<?php
/*
 * community/inquiries/answer.php
 * Admin-only answer endpoint for public qna posts.
 * It writes a Gnuboard comment under bo_table=qna without changing board schema.
 */

require_once dirname(dirname(__DIR__)) . '/_bootstrap.php';

uno_api_require_method('POST');
uno_api_require_admin();

function uno_api_qna_answer_json_body()
{
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);
    return is_array($payload) ? $payload : array();
}

function uno_api_qna_answer_escape($value)
{
    if (function_exists('sql_escape_string')) {
        return sql_escape_string((string) $value);
    }

    if (function_exists('sql_real_escape_string')) {
        return sql_real_escape_string((string) $value);
    }

    return addslashes((string) $value);
}

function uno_api_qna_answer_text($value, $maxLength)
{
    $text = html_entity_decode(strip_tags((string) $value), ENT_QUOTES, 'UTF-8');
    $text = preg_replace("/\r\n|\r|\n/", "\n", $text);
    $text = trim($text);

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength, 'UTF-8');
    }

    return substr($text, 0, $maxLength);
}

function uno_api_qna_answer_table_name($key, $fallback)
{
    global $g5;
    return isset($g5[$key]) && $g5[$key] !== '' ? $g5[$key] : $fallback;
}

function uno_api_qna_answer_board($value)
{
    $value = trim((string) $value);
    if ($value === 'review') {
        return 'write';
    }

    if ($value === 'write' || $value === 'qna') {
        return $value;
    }

    return 'qna';
}

function uno_api_qna_answer_write_table($board)
{
    global $g5;
    $prefix = isset($g5['write_prefix']) && $g5['write_prefix'] !== ''
        ? $g5['write_prefix']
        : 'g5_write_';

    return $prefix . $board;
}

function uno_api_qna_answer_insert_id()
{
    if (function_exists('sql_insert_id')) {
        return sql_insert_id();
    }

    if (function_exists('mysql_insert_id')) {
        return mysql_insert_id();
    }

    return 0;
}

function uno_api_qna_answer_query($sql, $message)
{
    $result = sql_query($sql, false);
    if (!$result) {
        uno_api_error('SERVER_ERROR', $message, 500);
    }

    return $result;
}

if (!function_exists('sql_query') || !function_exists('sql_fetch')) {
    uno_api_error('SERVER_ERROR', 'Gnuboard DB 함수를 찾을 수 없습니다.', 500);
}

$payload = uno_api_qna_answer_json_body();
$board = uno_api_qna_answer_board(isset($payload['board']) ? $payload['board'] : 'qna');
$action = isset($payload['action']) ? (string) $payload['action'] : 'create';
$threadId = isset($payload['postId']) ? (int) $payload['postId'] : 0;
$commentId = isset($payload['commentId']) ? (int) $payload['commentId'] : 0;
$content = uno_api_qna_answer_text(isset($payload['content']) ? $payload['content'] : '', 65536);

if ($threadId <= 0) {
    uno_api_error('VALIDATION_ERROR', '답변할 공개 문의를 찾을 수 없습니다.', 400);
}

if ($action !== 'delete' && ($content === '' || (function_exists('mb_strlen') ? mb_strlen($content, 'UTF-8') : strlen($content)) < 2)) {
    uno_api_error('VALIDATION_ERROR', '답변 내용을 입력해 주세요.', 400);
}

$table = uno_api_qna_answer_write_table($board);
$thread = sql_fetch("select * from {$table} where wr_id = '{$threadId}' and wr_is_comment = '0' limit 1");
if (!$thread || empty($thread['wr_id'])) {
    uno_api_error('NOT_FOUND', '공개 문의 원글을 찾을 수 없습니다.', 404);
}

if ($action === 'update') {
    if ($commentId <= 0) {
        uno_api_error('VALIDATION_ERROR', '수정할 답변을 찾을 수 없습니다.', 400);
    }

    $safeContent = uno_api_qna_answer_escape($content);
    uno_api_qna_answer_query(
        "update {$table}
            set wr_content = '{$safeContent}'
          where wr_id = '{$commentId}'
            and wr_parent = '{$threadId}'
            and wr_is_comment = '1'",
        '답변 수정에 실패했습니다.'
    );

    uno_api_success(array(
        'board' => $board,
        'postId' => $threadId,
        'commentId' => $commentId,
        'updated' => true,
    ));
}

if ($action === 'delete') {
    if ($commentId <= 0) {
        uno_api_error('VALIDATION_ERROR', '삭제할 답변을 찾을 수 없습니다.', 400);
    }

    $boardNewTable = uno_api_qna_answer_table_name('board_new_table', 'g5_board_new');
    $boardTable = uno_api_qna_answer_table_name('board_table', 'g5_board');
    $safeBoard = uno_api_qna_answer_escape($board);
    uno_api_qna_answer_query(
        "delete from {$table}
          where wr_id = '{$commentId}'
            and wr_parent = '{$threadId}'
            and wr_is_comment = '1'",
        '답변 삭제에 실패했습니다.'
    );
    sql_query("delete from {$boardNewTable} where bo_table = '{$safeBoard}' and wr_id = '{$commentId}'", false);
    sql_query("update {$table} set wr_comment = greatest(wr_comment - 1, 0) where wr_id = '{$threadId}'", false);
    sql_query("update {$boardTable} set bo_count_comment = greatest(bo_count_comment - 1, 0) where bo_table = '{$safeBoard}'", false);

    uno_api_success(array(
        'board' => $board,
        'postId' => $threadId,
        'commentId' => $commentId,
        'deleted' => true,
    ));
}

$member = uno_api_member();
$memberId = isset($member['mb_id']) ? (string) $member['mb_id'] : '';
$memberName = isset($member['mb_name']) && $member['mb_name'] !== '' ? (string) $member['mb_name'] : $memberId;
$memberEmail = isset($member['mb_email']) ? (string) $member['mb_email'] : '';
$memberPassword = isset($member['mb_password']) ? (string) $member['mb_password'] : '';
$now = defined('G5_TIME_YMDHIS') ? G5_TIME_YMDHIS : date('Y-m-d H:i:s');
$ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';

$commentRow = sql_fetch(
    "select max(wr_comment) as max_comment
       from {$table}
      where wr_parent = '{$threadId}'
        and wr_is_comment = '1'"
);
$commentNo = isset($commentRow['max_comment']) ? (int) $commentRow['max_comment'] + 1 : 1;

$safeContent = uno_api_qna_answer_escape($content);
$safeMemberId = uno_api_qna_answer_escape($memberId);
$safeMemberName = uno_api_qna_answer_escape(function_exists('clean_xss_tags') ? clean_xss_tags($memberName) : $memberName);
$safeEmail = uno_api_qna_answer_escape($memberEmail);
$safePassword = uno_api_qna_answer_escape($memberPassword);
$safeNow = uno_api_qna_answer_escape($now);
$safeIp = uno_api_qna_answer_escape($ip);
$safeCaName = uno_api_qna_answer_escape(isset($thread['ca_name']) ? $thread['ca_name'] : '');
$safeWrNum = uno_api_qna_answer_escape(isset($thread['wr_num']) ? $thread['wr_num'] : '');

uno_api_qna_answer_query(
    "insert into {$table}
        set ca_name = '{$safeCaName}',
            wr_option = '',
            wr_num = '{$safeWrNum}',
            wr_reply = '',
            wr_parent = '{$threadId}',
            wr_is_comment = '1',
            wr_comment = '{$commentNo}',
            wr_comment_reply = '',
            wr_subject = '',
            wr_content = '{$safeContent}',
            wr_link1 = '',
            wr_link2 = '',
            wr_link1_hit = '0',
            wr_link2_hit = '0',
            wr_hit = '0',
            wr_good = '0',
            wr_nogood = '0',
            mb_id = '{$safeMemberId}',
            wr_password = '{$safePassword}',
            wr_name = '{$safeMemberName}',
            wr_email = '{$safeEmail}',
            wr_homepage = '',
            wr_file = '0',
            wr_facebook_user = '',
            wr_twitter_user = '',
            wr_datetime = '{$safeNow}',
            wr_last = '',
            wr_ip = '{$safeIp}',
            wr_1 = '',
            wr_2 = '',
            wr_3 = '',
            wr_4 = '',
            wr_5 = '',
            wr_6 = '',
            wr_7 = '',
            wr_8 = '',
            wr_9 = '',
            wr_10 = ''",
    '공개 문의 답변 저장에 실패했습니다.'
);

$commentId = uno_api_qna_answer_insert_id();
if (!$commentId) {
    uno_api_error('SERVER_ERROR', '공개 문의 답변 저장에 실패했습니다.', 500);
}

uno_api_qna_answer_query(
    "update {$table} set wr_comment = wr_comment + 1, wr_last = '{$safeNow}' where wr_id = '{$threadId}'",
    '공개 문의 답변 카운트 갱신에 실패했습니다.'
);

$boardNewTable = uno_api_qna_answer_table_name('board_new_table', 'g5_board_new');
$boardTable = uno_api_qna_answer_table_name('board_table', 'g5_board');
uno_api_qna_answer_query(
    "insert into {$boardNewTable}
        (bo_table, wr_id, wr_parent, bn_datetime, mb_id)
     values
        ('{$board}', '{$commentId}', '{$threadId}', '{$safeNow}', '{$safeMemberId}')",
    '공개 문의 답변 새글 기록에 실패했습니다.'
);

uno_api_qna_answer_query(
    "update {$boardTable} set bo_count_comment = bo_count_comment + 1 where bo_table = '{$board}'",
    '공개 문의 답변 게시판 카운트 갱신에 실패했습니다.'
);

uno_api_success(array(
    'board' => $board,
    'postId' => $threadId,
    'commentId' => (int) $commentId,
    'createdAt' => $now,
), 201);
