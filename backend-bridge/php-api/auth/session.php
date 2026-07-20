<?php
/*
 * auth/session.php
 * React 프런트가 기존 Gnuboard 로그인 세션을 확인할 때 호출하는 인증 상태 API endpoint입니다.
 * $member 값을 읽어 로그인 여부와 예약 폼 기본 신청자 정보를 JSON으로 반환합니다.
 * 로그인 처리 자체는 담당하지 않으며, 기존 우노트래블 로그인 세션을 읽기 전용으로 노출합니다.
 */

require_once dirname(__DIR__) . '/_bootstrap.php';

uno_api_require_method('GET');

$member = uno_api_member();

if (!uno_api_is_logged_in()) {
    uno_api_success(array(
        'isLoggedIn' => false,
        'member' => null,
    ));
}

uno_api_success(array(
    'isLoggedIn' => true,
    'isAdmin' => uno_api_is_admin(),
    'member' => array(
        'id' => isset($member['mb_id']) ? (string) $member['mb_id'] : '',
        'name' => isset($member['mb_name']) ? (string) $member['mb_name'] : '',
        'email' => isset($member['mb_email']) ? (string) $member['mb_email'] : '',
        'phone' => isset($member['mb_hp']) ? (string) $member['mb_hp'] : '',
        'kakaoId' => isset($member['mb_kakao']) ? (string) $member['mb_kakao'] : '',
    ),
));
