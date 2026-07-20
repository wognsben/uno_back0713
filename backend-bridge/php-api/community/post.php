<?php
/*
 * community/post.php
 * Update/delete endpoint for public community qna/write original posts.
 */

require_once __DIR__ . '/../_bootstrap.php';

uno_api_require_method('POST');
uno_api_require_login();

function uno_api_community_post_body()
{
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);
    return is_array($payload) ? $payload : array();
}

function uno_api_community_post_escape($value)
{
    if (function_exists('sql_escape_string')) {
        return sql_escape_string((string) $value);
    }

    if (function_exists('sql_real_escape_string')) {
        return sql_real_escape_string((string) $value);
    }

    return addslashes((string) $value);
}

function uno_api_community_post_text($value, $maxLength)
{
    $text = html_entity_decode(strip_tags((string) $value), ENT_QUOTES, 'UTF-8');
    $text = preg_replace("/\r\n|\r|\n/", "\n", $text);
    $text = trim($text);

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength, 'UTF-8');
    }

    return substr($text, 0, $maxLength);
}

function uno_api_community_post_board($value)
{
    $value = trim((string) $value);
    if ($value === 'review') {
        return 'write';
    }

    if ($value === 'write' || $value === 'qna') {
        return $value;
    }

    uno_api_error('VALIDATION_ERROR', '지원하지 않는 게시판입니다.', 400);
}

function uno_api_community_post_table($board)
{
    global $g5;
    $prefix = isset($g5['write_prefix']) && $g5['write_prefix'] !== ''
        ? $g5['write_prefix']
        : 'g5_write_';

    return $prefix . $board;
}

function uno_api_community_post_table_name($key, $fallback)
{
    global $g5;
    return isset($g5[$key]) && $g5[$key] !== '' ? $g5[$key] : $fallback;
}

function uno_api_community_post_query($sql, $message)
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

$payload = uno_api_community_post_body();
$action = isset($payload['action']) ? (string) $payload['action'] : '';
$board = uno_api_community_post_board(isset($payload['board']) ? $payload['board'] : '');
$postId = isset($payload['postId']) ? (int) $payload['postId'] : 0;

if ($postId <= 0) {
    uno_api_error('VALIDATION_ERROR', '게시글을 찾을 수 없습니다.', 400);
}

$table = uno_api_community_post_table($board);
$post = sql_fetch("select * from {$table} where wr_id = '{$postId}' and wr_is_comment = '0' limit 1");
if (!$post || empty($post['wr_id'])) {
    uno_api_error('NOT_FOUND', '게시글을 찾을 수 없습니다.', 404);
}

$memberId = uno_api_current_member_id();
$isOwner = $memberId !== '' && isset($post['mb_id']) && (string) $post['mb_id'] === $memberId;
if (!uno_api_is_admin() && !$isOwner) {
    uno_api_error('PERMISSION_DENIED', '작성자와 관리자만 수정 또는 삭제할 수 있습니다.', 403);
}

if ($action === 'update') {
    $subject = uno_api_community_post_text(isset($payload['subject']) ? $payload['subject'] : '', 255);
    $content = uno_api_community_post_text(isset($payload['content']) ? $payload['content'] : '', 65536);
    if ($subject === '' || $content === '') {
        uno_api_error('VALIDATION_ERROR', '제목과 내용을 입력해 주세요.', 400);
    }

    $safeSubject = uno_api_community_post_escape($subject);
    $safeContent = uno_api_community_post_escape($content);
    $safeOption = ($board === 'qna' && !empty($payload['isSecret'])) ? 'secret' : '';
    uno_api_community_post_query(
        "update {$table}
            set wr_subject = '{$safeSubject}',
                wr_content = '{$safeContent}',
                wr_option = '{$safeOption}'
          where wr_id = '{$postId}'
            and wr_is_comment = '0'",
        '게시글 수정에 실패했습니다.'
    );

    uno_api_success(array('board' => $board, 'postId' => $postId, 'updated' => true));
}

if ($action === 'delete') {
    $safeBoard = uno_api_community_post_escape($board);
    $boardFileTable = uno_api_community_post_table_name('board_file_table', 'g5_board_file');
    $boardNewTable = uno_api_community_post_table_name('board_new_table', 'g5_board_new');
    $boardTable = uno_api_community_post_table_name('board_table', 'g5_board');
    $commentCount = isset($post['wr_comment']) ? (int) $post['wr_comment'] : 0;

    uno_api_community_post_query("delete from {$table} where wr_parent = '{$postId}'", '게시글 삭제에 실패했습니다.');
    sql_query("delete from {$boardFileTable} where bo_table = '{$safeBoard}' and wr_id = '{$postId}'", false);
    sql_query("delete from {$boardNewTable} where bo_table = '{$safeBoard}' and wr_parent = '{$postId}'", false);
    sql_query("update {$boardTable} set bo_count_write = greatest(bo_count_write - 1, 0), bo_count_comment = greatest(bo_count_comment - '{$commentCount}', 0) where bo_table = '{$safeBoard}'", false);

    uno_api_success(array('board' => $board, 'postId' => $postId, 'deleted' => true));
}

uno_api_error('VALIDATION_ERROR', '지원하지 않는 작업입니다.', 400);
