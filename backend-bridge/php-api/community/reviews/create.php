<?php
/*
 * community/reviews/create.php
 * Public community travel review writer for legacy bo_table=write.
 */

require_once dirname(dirname(__DIR__)) . '/_bootstrap.php';
require_once dirname(dirname(__DIR__)) . '/_spam_guard.php';

uno_api_require_method('POST');
uno_api_require_login();

function uno_api_public_review_read_payload()
{
    if (isset($_POST['subject']) || isset($_POST['content'])) {
        return array(
            'subject' => isset($_POST['subject']) ? $_POST['subject'] : '',
            'content' => isset($_POST['content']) ? $_POST['content'] : '',
        );
    }

    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);

    if (!is_array($payload)) {
        uno_api_error('VALIDATION_ERROR', '요청 형식이 올바르지 않습니다.', 400);
    }

    return $payload;
}

function uno_api_public_review_escape($value)
{
    if (function_exists('sql_escape_string')) {
        return sql_escape_string((string) $value);
    }

    if (function_exists('sql_real_escape_string')) {
        return sql_real_escape_string((string) $value);
    }

    return addslashes((string) $value);
}

function uno_api_public_review_text($value, $maxLength)
{
    $text = html_entity_decode(strip_tags((string) $value), ENT_QUOTES, 'UTF-8');
    $text = preg_replace("/\r\n|\r|\n/", "\n", $text);
    $text = preg_replace("/[ \t]+/", " ", $text);
    $text = trim($text);

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength, 'UTF-8');
    }

    return substr($text, 0, $maxLength);
}

function uno_api_public_review_text_length($value)
{
    if (function_exists('mb_strlen')) {
        return mb_strlen((string) $value, 'UTF-8');
    }

    return strlen((string) $value);
}

function uno_api_public_review_write_table()
{
    global $g5;
    $prefix = isset($g5['write_prefix']) && $g5['write_prefix'] !== ''
        ? $g5['write_prefix']
        : 'g5_write_';

    return $prefix . 'write';
}

function uno_api_public_review_tables()
{
    global $g5;

    return array(
        'boardNewTable' => isset($g5['board_new_table']) && $g5['board_new_table'] !== ''
            ? $g5['board_new_table']
            : 'g5_board_new',
        'boardFileTable' => isset($g5['board_file_table']) && $g5['board_file_table'] !== ''
            ? $g5['board_file_table']
            : 'g5_board_file',
        'boardTable' => isset($g5['board_table']) && $g5['board_table'] !== ''
            ? $g5['board_table']
            : 'g5_board',
    );
}

function uno_api_public_review_insert_id()
{
    if (function_exists('sql_insert_id')) {
        return sql_insert_id();
    }

    if (function_exists('mysql_insert_id')) {
        return mysql_insert_id();
    }

    return 0;
}

function uno_api_public_review_next_num($table)
{
    if (function_exists('get_next_num')) {
        return get_next_num($table);
    }

    $row = sql_fetch("select min(wr_num) as min_wr_num from {$table}");
    $min = isset($row['min_wr_num']) ? (int) $row['min_wr_num'] : 0;
    return $min - 1;
}

function uno_api_public_review_query($sql, $message)
{
    $result = sql_query($sql, false);

    if (!$result) {
        uno_api_error('SERVER_ERROR', $message, 500);
    }

    return $result;
}

function uno_api_public_review_has_attachment()
{
    return isset($_FILES['attachment'])
        && is_array($_FILES['attachment'])
        && isset($_FILES['attachment']['error'])
        && (int) $_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE;
}

function uno_api_public_review_validate_attachment()
{
    if (!uno_api_public_review_has_attachment()) {
        return null;
    }

    $file = $_FILES['attachment'];
    if (!isset($file['error']) || (int) $file['error'] !== UPLOAD_ERR_OK) {
        uno_api_error('VALIDATION_ERROR', '첨부파일 업로드에 실패했습니다.', 400);
    }

    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        uno_api_error('VALIDATION_ERROR', '첨부파일을 확인할 수 없습니다.', 400);
    }

    $size = isset($file['size']) ? (int) $file['size'] : 0;
    if ($size <= 0 || $size > 10 * 1024 * 1024) {
        uno_api_error('VALIDATION_ERROR', '첨부파일은 10MB 이하만 업로드할 수 있습니다.', 400);
    }

    $sourceName = isset($file['name']) ? basename((string) $file['name']) : 'attachment';
    $extension = strtolower(pathinfo($sourceName, PATHINFO_EXTENSION));
    $allowed = array('jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx');
    if (!in_array($extension, $allowed, true)) {
        uno_api_error('VALIDATION_ERROR', 'JPG, PNG, PDF, DOC, DOCX, XLS, XLSX 파일만 업로드할 수 있습니다.', 400);
    }

    return array(
        'tmpName' => $file['tmp_name'],
        'sourceName' => $sourceName,
        'extension' => $extension,
    );
}

function uno_api_public_review_upload_dir()
{
    if (defined('G5_DATA_PATH')) {
        return G5_DATA_PATH . '/file/write';
    }

    return dirname(__DIR__, 3) . '/bbs/data/file/write';
}

function uno_api_public_review_save_attachment($table, $wrId, $attachment, $now)
{
    if (!$attachment) {
        return;
    }

    $wrId = (int) $wrId;
    if ($wrId <= 0) {
        return;
    }

    $uploadDir = uno_api_public_review_upload_dir();
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, defined('G5_DIR_PERMISSION') ? G5_DIR_PERMISSION : 0755, true);
    }

    if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
        uno_api_error('SERVER_ERROR', '첨부파일 저장 폴더를 사용할 수 없습니다.', 500);
    }

    $storedFile = date('YmdHis') . '_write_' . $wrId . '_' . bin2hex(random_bytes(4)) . '.' . $attachment['extension'];
    $destination = $uploadDir . '/' . $storedFile;

    if (!move_uploaded_file($attachment['tmpName'], $destination)) {
        uno_api_error('SERVER_ERROR', '첨부파일을 저장하지 못했습니다.', 500);
    }

    @chmod($destination, defined('G5_FILE_PERMISSION') ? G5_FILE_PERMISSION : 0644);

    $imageInfo = @getimagesize($destination);
    $width = $imageInfo && isset($imageInfo[0]) ? (int) $imageInfo[0] : 0;
    $height = $imageInfo && isset($imageInfo[1]) ? (int) $imageInfo[1] : 0;
    $type = $imageInfo ? 1 : 0;
    $tables = uno_api_public_review_tables();
    $source = uno_api_public_review_escape($attachment['sourceName']);
    $stored = uno_api_public_review_escape($storedFile);
    $fileSize = (int) @filesize($destination);
    $safeNow = uno_api_public_review_escape($now);

    uno_api_public_review_query(
        "insert into {$tables['boardFileTable']}
            set bo_table = 'write',
                wr_id = '{$wrId}',
                bf_no = '0',
                bf_source = '{$source}',
                bf_file = '{$stored}',
                bf_download = '0',
                bf_content = '',
                bf_filesize = '{$fileSize}',
                bf_width = '{$width}',
                bf_height = '{$height}',
                bf_type = '{$type}',
                bf_datetime = '{$safeNow}'",
        '첨부파일 정보를 저장하지 못했습니다.'
    );

    uno_api_public_review_query(
        "update {$table} set wr_file = '1' where wr_id = '{$wrId}'",
        '첨부파일 개수를 갱신하지 못했습니다.'
    );
}

if (!function_exists('sql_query') || !function_exists('sql_fetch')) {
    uno_api_error('SERVER_ERROR', 'Gnuboard DB 함수를 찾을 수 없습니다.', 500);
}

$payload = uno_api_public_review_read_payload();
$member = uno_api_member();
$memberId = isset($member['mb_id']) ? (string) $member['mb_id'] : '';
$memberName = isset($member['mb_name']) && $member['mb_name'] !== ''
    ? (string) $member['mb_name']
    : $memberId;
$memberEmail = isset($member['mb_email']) ? (string) $member['mb_email'] : '';
$memberPassword = isset($member['mb_password']) ? (string) $member['mb_password'] : '';

$subject = uno_api_public_review_text(isset($payload['subject']) ? $payload['subject'] : '', 255);
$content = uno_api_public_review_text(isset($payload['content']) ? $payload['content'] : '', 65536);

if (uno_api_public_review_text_length($subject) < 2) {
    uno_api_error('VALIDATION_ERROR', '리뷰 제목을 입력해 주세요.', 400);
}

if (uno_api_public_review_text_length($content) < 10) {
    uno_api_error('VALIDATION_ERROR', '리뷰 내용은 10자 이상 입력해 주세요.', 400);
}

uno_spam_guard_assert_write('write', $subject, $content, $memberId, uno_api_is_admin());
$attachment = uno_api_public_review_validate_attachment();

$tables = uno_api_public_review_tables();
$board = sql_fetch("select * from {$tables['boardTable']} where bo_table = 'write' limit 1");
if (!$board || empty($board['bo_table'])) {
    uno_api_error('SERVER_ERROR', '여행후기 게시판을 찾을 수 없습니다.', 500);
}

$table = uno_api_public_review_write_table();
$wrNum = uno_api_public_review_next_num($table);
$now = defined('G5_TIME_YMDHIS') ? G5_TIME_YMDHIS : date('Y-m-d H:i:s');
$ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';

$safeSubject = uno_api_public_review_escape($subject);
$safeContent = uno_api_public_review_escape($content);
$safeMemberId = uno_api_public_review_escape($memberId);
$safeMemberName = uno_api_public_review_escape(function_exists('clean_xss_tags') ? clean_xss_tags($memberName) : $memberName);
$safeEmail = uno_api_public_review_escape($memberEmail);
$safePassword = uno_api_public_review_escape($memberPassword);
$safeNow = uno_api_public_review_escape($now);
$safeIp = uno_api_public_review_escape($ip);

uno_api_public_review_query(
    "insert into {$table}
        set wr_num = '{$wrNum}',
            wr_reply = '',
            wr_parent = '0',
            wr_comment_reply = '',
            wr_is_comment = '0',
            wr_comment = '0',
            ca_name = '',
            wr_option = '',
            wr_subject = '{$safeSubject}',
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
            wr_last = '{$safeNow}',
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
    '여행후기 저장에 실패했습니다.'
);

$wrId = uno_api_public_review_insert_id();
if (!$wrId) {
    uno_api_error('SERVER_ERROR', '여행후기 저장에 실패했습니다.', 500);
}

uno_api_public_review_query(
    "update {$table} set wr_parent = '{$wrId}' where wr_id = '{$wrId}'",
    '여행후기 부모 연결에 실패했습니다.'
);

uno_api_public_review_save_attachment($table, $wrId, $attachment, $now);

uno_api_public_review_query(
    "insert into {$tables['boardNewTable']}
        (bo_table, wr_id, wr_parent, bn_datetime, mb_id)
     values
        ('write', '{$wrId}', '{$wrId}', '{$safeNow}', '{$safeMemberId}')",
    '여행후기 새 글 기록에 실패했습니다.'
);

uno_api_public_review_query(
    "update {$tables['boardTable']} set bo_count_write = bo_count_write + 1 where bo_table = 'write'",
    '여행후기 게시판 카운트 갱신에 실패했습니다.'
);

uno_api_success(array(
    'board' => 'write',
    'postId' => (int) $wrId,
    'subject' => $subject,
    'createdAt' => $now,
    'nextUrl' => '/community/review',
), 201);
