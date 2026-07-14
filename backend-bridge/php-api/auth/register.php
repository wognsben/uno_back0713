<?php
/*
 * auth/register.php
 * Renewal register endpoint that creates a normal Gnuboard member without KCAPTCHA.
 */

require_once dirname(__DIR__) . '/_bootstrap.php';

uno_api_require_method('POST');

if (defined('G5_LIB_PATH') && file_exists(G5_LIB_PATH . '/register.lib.php')) {
    require_once G5_LIB_PATH . '/register.lib.php';
}

function uno_api_register_json_body()
{
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (is_array($body)) {
        return $body;
    }

    return is_array($_POST) ? $_POST : array();
}

function uno_api_register_body_value($body, $keys, $default = '')
{
    foreach ($keys as $key) {
        if (isset($body[$key])) {
            return $body[$key];
        }
    }

    return $default;
}

function uno_api_register_text($jsonString)
{
    $decoded = json_decode($jsonString);
    return is_string($decoded) ? $decoded : '';
}

function uno_api_register_escape($value)
{
    if (function_exists('sql_escape_string')) {
        return sql_escape_string($value);
    }

    if (function_exists('mysql_real_escape_string')) {
        return mysql_real_escape_string($value);
    }

    return addslashes($value);
}

function uno_api_register_member_table()
{
    global $g5, $g4;

    if (isset($g5['member_table']) && $g5['member_table']) {
        return $g5['member_table'];
    }

    if (isset($g4['member_table']) && $g4['member_table']) {
        return $g4['member_table'];
    }

    return 'g5_member';
}

function uno_api_register_now($format)
{
    global $g5, $g4;

    if ($format === 'ymd') {
        if (isset($g5['time_ymd'])) return $g5['time_ymd'];
        if (isset($g4['time_ymd'])) return $g4['time_ymd'];
        return date('Y-m-d');
    }

    if (isset($g5['time_ymdhis'])) return $g5['time_ymdhis'];
    if (isset($g4['time_ymdhis'])) return $g4['time_ymdhis'];
    return date('Y-m-d H:i:s');
}

function uno_api_register_default_level()
{
    global $config;

    if (isset($config['cf_register_level']) && (int) $config['cf_register_level'] > 0) {
        return (int) $config['cf_register_level'];
    }

    return 2;
}

function uno_api_register_uses_email_certify()
{
    global $config;

    return !empty($config['cf_use_email_certify']);
}

function uno_api_register_password_hash($password)
{
    if (function_exists('get_encrypt_string')) {
        return get_encrypt_string($password);
    }

    if (function_exists('sql_password')) {
        return sql_password($password);
    }

    return password_hash($password, PASSWORD_DEFAULT);
}

function uno_api_register_db_error_message()
{
    global $g5;

    if (isset($g5['connect_db'])
        && function_exists('mysqli_error')
        && class_exists('mysqli', false)
        && $g5['connect_db'] instanceof mysqli
    ) {
        $message = mysqli_error($g5['connect_db']);
        if ($message) {
            return $message;
        }
    }

    if (function_exists('mysql_error')) {
        $message = mysql_error();
        if ($message) {
            return $message;
        }
    }

    return '';
}

function uno_api_register_exception_message($exception)
{
    if (is_object($exception) && method_exists($exception, 'getMessage')) {
        return $exception->getMessage();
    }

    return '';
}

function uno_api_register_login_member($memberId)
{
    if (!function_exists('set_session')) {
        return;
    }

    $member = function_exists('get_member') ? get_member($memberId) : array();

    set_session('ss_mb_id', $memberId);
    if ($member && !empty($member['mb_datetime']) && function_exists('get_real_client_ip')) {
        $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
        set_session('ss_mb_key', md5($member['mb_datetime'] . get_real_client_ip() . $userAgent));
    }
    set_session('ss_mb_reg', $memberId);
}

function uno_api_register_validation_error($message)
{
    uno_api_error('VALIDATION_ERROR', $message, 200);
}

$body = uno_api_register_json_body();

$name = trim(strip_tags((string) uno_api_register_body_value($body, array('name', 'mb_name'), '')));
$email = trim(strip_tags((string) uno_api_register_body_value($body, array('email', 'mb_id', 'mb_email'), '')));
$phone = trim(strip_tags((string) uno_api_register_body_value($body, array('phone', 'mb_hp'), '')));
$kakaoId = trim(strip_tags((string) uno_api_register_body_value($body, array('kakaoId', 'mb_1', 'mb_kakao'), '')));
$password = (string) uno_api_register_body_value($body, array('password', 'mb_password'), '');
$passwordConfirm = (string) uno_api_register_body_value($body, array('passwordConfirm', 'mb_password_re'), $password);

if ($name === '' || $email === '' || $phone === '' || $password === '') {
    uno_api_register_validation_error(uno_api_register_text('"\ud544\uc218 \ud68c\uc6d0\uc815\ubcf4\ub97c \ubaa8\ub450 \uc785\ub825\ud574 \uc8fc\uc138\uc694."'));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    uno_api_register_validation_error(uno_api_register_text('"\uc774\uba54\uc77c \ud615\uc2dd\uc774 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."'));
}

$name = function_exists('clean_xss_tags') ? clean_xss_tags($name) : $name;
$email = function_exists('get_email_address') ? get_email_address($email) : $email;

if (function_exists('empty_mb_id') && empty_mb_id($email)) {
    uno_api_register_validation_error(empty_mb_id($email));
}

if (function_exists('count_mb_id') && count_mb_id($email)) {
    uno_api_register_validation_error(count_mb_id($email));
}

if (function_exists('valid_mb_email') && valid_mb_email($email)) {
    uno_api_register_validation_error(valid_mb_email($email));
}

if (function_exists('prohibit_mb_email') && prohibit_mb_email($email)) {
    uno_api_register_validation_error(prohibit_mb_email($email));
}

if (strlen($password) < 3) {
    uno_api_register_validation_error(uno_api_register_text('"\ube44\ubc00\ubc88\ud638\ub294 3\uc790 \uc774\uc0c1\uc73c\ub85c \uc785\ub825\ud574 \uc8fc\uc138\uc694."'));
}

if ($password !== $passwordConfirm) {
    uno_api_register_validation_error(uno_api_register_text('"\ube44\ubc00\ubc88\ud638 \ud655\uc778\uc774 \uc77c\uce58\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."'));
}

if (!function_exists('sql_fetch') || !function_exists('sql_query')) {
    uno_api_error('SERVER_ERROR', uno_api_register_text('"\ud68c\uc6d0 DB \ud568\uc218\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."'), 500);
}

$memberTable = uno_api_register_member_table();
$memberId = $email;
$memberNick = $name;

if (function_exists('hyphen_hp_number')) {
    $phone = hyphen_hp_number($phone);
}

$escapedMemberId = uno_api_register_escape($memberId);
$escapedName = uno_api_register_escape($name);
$escapedNick = uno_api_register_escape($memberNick);
$escapedEmail = uno_api_register_escape($email);
$escapedPhone = uno_api_register_escape($phone);
$escapedKakaoId = uno_api_register_escape($kakaoId);
$escapedPassword = uno_api_register_escape(uno_api_register_password_hash($password));
$empty = uno_api_register_escape('');
$now = uno_api_register_escape(uno_api_register_now('ymdhis'));
$today = uno_api_register_escape(uno_api_register_now('ymd'));
$ip = isset($_SERVER['REMOTE_ADDR']) ? uno_api_register_escape($_SERVER['REMOTE_ADDR']) : '';
$level = uno_api_register_default_level();

$existing = sql_fetch(
    "select mb_id, mb_email
       from {$memberTable}
      where mb_id = '{$escapedMemberId}'
         or mb_email = '{$escapedEmail}'
      limit 1"
);

if (($existing && (!empty($existing['mb_id']) || !empty($existing['mb_email'])))
    || (function_exists('exist_mb_id') && exist_mb_id($memberId))
    || (function_exists('exist_mb_email') && exist_mb_email($email, ''))
) {
    uno_api_register_validation_error(uno_api_register_text('"\uc774\ubbf8 \uac00\uc785\ub41c \uc774\uba54\uc77c\uc785\ub2c8\ub2e4."'));
}

$sql = "insert into {$memberTable}
           set mb_id = '{$escapedMemberId}',
               mb_password = '{$escapedPassword}',
               mb_name = '{$escapedName}',
               mb_nick = '{$escapedNick}',
               mb_nick_date = '{$today}',
               mb_email = '{$escapedEmail}',
               mb_homepage = '{$empty}',
               mb_tel = '{$empty}',
               mb_hp = '{$escapedPhone}',
               mb_zip1 = '{$empty}',
               mb_zip2 = '{$empty}',
               mb_addr1 = '{$empty}',
               mb_addr2 = '{$empty}',
               mb_addr3 = '{$empty}',
               mb_addr_jibeon = '{$empty}',
               mb_signature = '{$empty}',
               mb_profile = '{$empty}',
               mb_memo = '{$empty}',
               mb_lost_certify = '{$empty}',
               mb_1 = '{$escapedKakaoId}',
               mb_2 = '{$empty}',
               mb_3 = '{$empty}',
               mb_4 = '{$empty}',
               mb_5 = '{$empty}',
               mb_6 = '{$empty}',
               mb_7 = '{$empty}',
               mb_8 = '{$empty}',
               mb_9 = '{$empty}',
               mb_10 = '{$empty}',
               mb_today_login = '{$now}',
               mb_datetime = '{$now}',
               mb_ip = '{$ip}',
               mb_level = '{$level}',
               mb_recommend = '{$empty}',
               mb_login_ip = '{$ip}',
               mb_mailling = '1',
               mb_sms = '1',
               mb_open = '1',
               mb_open_date = '{$today}'";

if (!uno_api_register_uses_email_certify()) {
    $sql .= " , mb_email_certify = '{$now}'";
}

$insertResult = false;
try {
    $insertResult = sql_query($sql, false);
} catch (Exception $exception) {
    uno_api_error(
        'SERVER_ERROR',
        '회원 DB 저장 예외: ' . uno_api_register_exception_message($exception),
        500
    );
}

if (!$insertResult) {
    $dbError = uno_api_register_db_error_message();
    uno_api_error(
        'SERVER_ERROR',
        $dbError ? '회원 DB 저장 실패: ' . $dbError : '회원 DB 저장에 실패했습니다.',
        500
    );
}

try {
    uno_api_register_login_member($memberId);
} catch (Exception $exception) {
    uno_api_error(
        'SERVER_ERROR',
        '회원 가입 후 로그인 처리 예외: ' . uno_api_register_exception_message($exception),
        500
    );
}

uno_api_success(array(
    'isLoggedIn' => true,
    'member' => array(
        'id' => $memberId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'kakaoId' => $kakaoId,
    ),
));
