<?php
/*
 * community/file.php
 * Public file viewer/downloader for community qna/write attachments.
 * This does not serve private cusTour files and does not expose /data/file directly.
 */

require_once dirname(__DIR__) . '/_bootstrap.php';

uno_api_require_method('GET');

function uno_api_community_file_escape($value)
{
    if (function_exists('sql_escape_string')) {
        return sql_escape_string((string) $value);
    }

    if (function_exists('sql_real_escape_string')) {
        return sql_real_escape_string((string) $value);
    }

    return addslashes((string) $value);
}

function uno_api_community_file_table_name($key, $fallback)
{
    global $g5;
    return isset($g5[$key]) && $g5[$key] !== '' ? $g5[$key] : $fallback;
}

function uno_api_community_file_write_table($board)
{
    global $g5;
    $prefix = isset($g5['write_prefix']) && $g5['write_prefix'] !== ''
        ? $g5['write_prefix']
        : 'g5_write_';

    return $prefix . $board;
}

function uno_api_community_file_upload_dir($board)
{
    if (defined('G5_DATA_PATH')) {
        return rtrim(G5_DATA_PATH, '/\\') . '/file/' . $board;
    }

    return dirname(__DIR__, 2) . '/bbs/data/file/' . $board;
}

function uno_api_community_file_mime($extension)
{
    $map = array(
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls' => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return isset($map[$extension]) ? $map[$extension] : 'application/octet-stream';
}

if (!function_exists('sql_fetch')) {
    uno_api_error('SERVER_ERROR', 'Gnuboard DB functions are unavailable.', 500);
}

$board = isset($_GET['bo_table']) ? trim((string) $_GET['bo_table']) : 'qna';
if (!in_array($board, array('qna', 'write'), true)) {
    uno_api_error('VALIDATION_ERROR', '지원하지 않는 게시판입니다.', 400);
}

$wrId = isset($_GET['wr_id']) ? (int) $_GET['wr_id'] : 0;
$fileNo = isset($_GET['no']) ? (int) $_GET['no'] : 0;
if ($wrId <= 0 || $fileNo < 0) {
    uno_api_error('VALIDATION_ERROR', '첨부파일 요청 정보가 올바르지 않습니다.', 400);
}

$writeTable = uno_api_community_file_write_table($board);
$write = sql_fetch("select wr_id, mb_id, wr_option from {$writeTable} where wr_id = '{$wrId}' and wr_is_comment = '0' limit 1");
if (!$write || empty($write['wr_id'])) {
    uno_api_error('NOT_FOUND', '첨부파일이 연결된 공개 문의를 찾을 수 없습니다.', 404);
}

$option = isset($write['wr_option']) ? (string) $write['wr_option'] : '';
$isSecret = $board === 'qna' && (strpos(',' . $option . ',', ',secret,') !== false || trim($option) === 'secret');
$memberId = uno_api_current_member_id();
$isOwner = $memberId !== '' && isset($write['mb_id']) && (string) $write['mb_id'] === $memberId;
if ($isSecret && !uno_api_is_admin() && !$isOwner) {
    uno_api_error('PERMISSION_DENIED', '비밀글 첨부파일은 작성자와 관리자만 확인할 수 있습니다.', 403);
}

$safeBoard = uno_api_community_file_escape($board);
$boardFileTable = uno_api_community_file_table_name('board_file_table', 'g5_board_file');
$file = sql_fetch(
    "select bf_source, bf_file, bf_filesize
       from {$boardFileTable}
      where bo_table = '{$safeBoard}'
        and wr_id = '{$wrId}'
        and bf_no = '{$fileNo}'
        and bf_file <> ''
      limit 1"
);

if (!$file || empty($file['bf_file'])) {
    uno_api_error('NOT_FOUND', '첨부파일을 찾을 수 없습니다.', 404);
}

$storedName = basename((string) $file['bf_file']);
$sourceName = isset($file['bf_source']) && $file['bf_source'] !== ''
    ? basename((string) $file['bf_source'])
    : $storedName;
$extension = strtolower(pathinfo($storedName, PATHINFO_EXTENSION));
$allowed = array('jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx');
if (!in_array($extension, $allowed, true)) {
    uno_api_error('VALIDATION_ERROR', '지원하지 않는 첨부파일입니다.', 400);
}

$path = uno_api_community_file_upload_dir($board) . '/' . $storedName;
if (!is_file($path) || !is_readable($path)) {
    uno_api_error('NOT_FOUND', '첨부파일을 읽을 수 없습니다.', 404);
}

$disposition = in_array($extension, array('jpg', 'jpeg', 'png', 'pdf'), true) ? 'inline' : 'attachment';
$encodedName = rawurlencode($sourceName);

while (ob_get_level() > 0) {
    ob_end_clean();
}

header('Content-Type: ' . uno_api_community_file_mime($extension));
header('Content-Length: ' . filesize($path));
header("Content-Disposition: {$disposition}; filename=\"{$encodedName}\"; filename*=UTF-8''{$encodedName}");
header('X-Content-Type-Options: nosniff');
readfile($path);
exit;
