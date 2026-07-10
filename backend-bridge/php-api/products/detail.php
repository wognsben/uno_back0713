<?php
/*
 * products/detail.php
 * React 상품 상세/예약 모듈이 기존 우노트래블 DB에서 상품 기본 정보와 예약 옵션을 가볍게 조회하는 API endpoint입니다.
 * 기본 mode=reservation에서는 긴 본문을 제외하고 pid, 상품명, 예약 옵션, 여권/룸정보 필요 여부만 반환합니다.
 * 상품 목록 HTML이나 관리자 화면을 만들지 않고, 상세페이지 첫 진입이 무겁지 않도록 작은 JSON 응답만 담당합니다.
 */

require_once dirname(__DIR__) . '/_bootstrap.php';
require_once dirname(__DIR__) . '/_product_map.php';

uno_api_require_method('GET');

function uno_api_sql_escape($value)
{
    if (function_exists('sql_escape_string')) {
        return sql_escape_string($value);
    }

    if (function_exists('sql_real_escape_string')) {
        return sql_real_escape_string($value);
    }

    return addslashes($value);
}

function uno_api_table_product()
{
    global $g5;
    return isset($g5['write_prefix']) ? $g5['write_prefix'] . 'product' : 'g5_write_product';
}

function uno_api_bool_field($value)
{
    $normalized = strtoupper(trim((string) $value));
    return in_array($normalized, array('1', 'Y', 'YES', 'TRUE'), true);
}

function uno_api_money($value)
{
    return (int) preg_replace('/[^0-9-]/', '', (string) $value);
}

function uno_api_href_for_product($productId, $productType)
{
    if ($productType === 'daily') {
        return '/product/detail/daily/' . rawurlencode($productId);
    }

    return '/product/detail/' . rawurlencode($productId);
}

function uno_api_fetch_daily_fee_options($legacyProductId)
{
    if (!function_exists('sql_query')) {
        return array();
    }

    $legacyProductId = (int) $legacyProductId;
    $result = sql_query(
        "select id, fee_subject, fee1, fee2, is_first
           from tour_fee
          where wr_id = '{$legacyProductId}'
          order by is_first desc, id asc"
    );

    $items = array();
    while ($row = sql_fetch_array($result)) {
        $items[] = array(
            'id' => (int) $row['id'],
            'label' => isset($row['fee_subject']) ? (string) $row['fee_subject'] : '',
            'deposit' => uno_api_money(isset($row['fee1']) ? $row['fee1'] : 0),
            'localPayment' => uno_api_money(isset($row['fee2']) ? $row['fee2'] : 0),
            'localPaymentCurrency' => 'EUR',
            'isDefault' => !empty($row['is_first']),
        );
    }

    return $items;
}

function uno_api_fetch_package_schedules($legacyProductId)
{
    if (!function_exists('sql_query')) {
        return array();
    }

    $legacyProductId = (int) $legacyProductId;
    $result = sql_query(
        "select id, start_time, arrive_time, fee_1, fee_2, fee_3, fee_air, price, seat, status, is_main
           from v2_pkgTour
          where pid = '{$legacyProductId}'
            and (del_time = 0 or del_time is null)
            and (is_view = 'Y' or is_view = '1')
          order by start_time asc, id asc"
    );

    $items = array();
    while ($row = sql_fetch_array($result)) {
        $items[] = array(
            'id' => (int) $row['id'],
            'label' => trim((string) $row['start_time'] . ' 출발'),
            'startDate' => isset($row['start_time']) ? (string) $row['start_time'] : '',
            'endDate' => isset($row['arrive_time']) ? (string) $row['arrive_time'] : '',
            'deposit' => uno_api_money(isset($row['fee_1']) ? $row['fee_1'] : 0),
            'middlePayment' => uno_api_money(isset($row['fee_2']) ? $row['fee_2'] : 0),
            'finalPayment' => uno_api_money(isset($row['fee_3']) ? $row['fee_3'] : 0),
            'airfare' => uno_api_money(isset($row['fee_air']) ? $row['fee_air'] : 0),
            'totalPrice' => uno_api_money(isset($row['price']) ? $row['price'] : 0),
            'seat' => (int) $row['seat'],
            'status' => isset($row['status']) ? (string) $row['status'] : '',
            'isDefault' => !empty($row['is_main']),
        );
    }

    return $items;
}

$productId = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
$mode = isset($_GET['mode']) ? trim((string) $_GET['mode']) : 'reservation';

if ($productId === '') {
    uno_api_error('VALIDATION_ERROR', '상품 ID가 필요합니다.', 400);
}

$mapping = uno_api_product_mapping($productId);
if (!$mapping || empty($mapping['legacyProductId'])) {
    uno_api_error('PRODUCT_NOT_MAPPED', '기존 DB와 연결되지 않은 상품입니다.', 404);
}

if (!function_exists('sql_fetch')) {
    uno_api_error('SERVER_ERROR', 'Gnuboard DB 함수를 찾을 수 없습니다.', 500);
}

$legacyProductId = (int) $mapping['legacyProductId'];
$productTable = uno_api_table_product();
$product = sql_fetch(
    "select wr_id, ca_name, wr_subject, wr_content, wr_reg_result, is_passport, is_delivery, is_roominfo
       from {$productTable}
      where wr_id = '{$legacyProductId}'"
);

if (!$product || empty($product['wr_id'])) {
    uno_api_error('PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.', 404);
}

$productType = isset($mapping['legacyCategory']) && $mapping['legacyCategory'] === 'semi'
    ? 'semi'
    : 'daily';
$feeOptions = array();
$packageSchedules = array();

if ($productType === 'semi') {
    $packageSchedules = uno_api_fetch_package_schedules($legacyProductId);
    foreach ($packageSchedules as $schedule) {
        $feeOptions[] = array(
            'id' => $schedule['id'],
            'label' => $schedule['label'],
            'deposit' => $schedule['deposit'],
            'localPayment' => $schedule['middlePayment'],
            'localPaymentCurrency' => 'KRW',
            'isDefault' => $schedule['isDefault'],
        );
    }
} else {
    $feeOptions = uno_api_fetch_daily_fee_options($legacyProductId);
}

$defaultFee = count($feeOptions) > 0 ? $feeOptions[0] : null;
$response = array(
    'id' => $productId,
    'legacyProductId' => $legacyProductId,
    'legacyFeeOptionId' => isset($mapping['legacyFeeOptionId']) ? $mapping['legacyFeeOptionId'] : null,
    'productType' => $productType,
    'title' => isset($product['wr_subject']) ? (string) $product['wr_subject'] : '',
    'category' => '',
    'legacyCategory' => isset($product['ca_name']) ? (string) $product['ca_name'] : '',
    'href' => uno_api_href_for_product($productId, $productType),
    'price' => $defaultFee ? array(
        'deposit' => $defaultFee['deposit'],
        'localPayment' => isset($defaultFee['localPayment']) ? $defaultFee['localPayment'] : 0,
        'localPaymentCurrency' => isset($defaultFee['localPaymentCurrency']) ? $defaultFee['localPaymentCurrency'] : 'KRW',
    ) : null,
    'requiresPassport' => uno_api_bool_field(isset($product['is_passport']) ? $product['is_passport'] : ''),
    'requiresRoomInfo' => uno_api_bool_field(isset($product['is_roominfo']) ? $product['is_roominfo'] : ''),
    'requiresDelivery' => uno_api_bool_field(isset($product['is_delivery']) ? $product['is_delivery'] : ''),
    'reservationDefaults' => array(
        'requiresPassport' => uno_api_bool_field(isset($product['is_passport']) ? $product['is_passport'] : ''),
        'requiresRoomInfo' => uno_api_bool_field(isset($product['is_roominfo']) ? $product['is_roominfo'] : ''),
        'requiresDelivery' => uno_api_bool_field(isset($product['is_delivery']) ? $product['is_delivery'] : ''),
        'defaultFinalStatus' => isset($product['wr_reg_result']) && $product['wr_reg_result'] !== ''
            ? (string) $product['wr_reg_result']
            : '1',
    ),
    'feeOptions' => $feeOptions,
);

if ($productType === 'semi') {
    $response['packageSchedules'] = $packageSchedules;
}

if ($mode === 'full') {
    $response['detailHtml'] = isset($product['wr_content']) ? (string) $product['wr_content'] : '';
}

uno_api_success($response);
