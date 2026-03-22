<?php
/**
 * Plugin Name: NMM Lightweight Firewall
 * Description: Simple IP and User-Agent filtering for Nový Matrix Media.
 * Version: 1.0
 * Author: Antigravity AI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'setup_theme', 'nmm_lightweight_firewall' );

function nmm_lightweight_firewall() {
    // 1. Block known malicious User-Agents
    $malicious_ua = array( 'base64_', 'eval(', 'union select', 'directory traversal' );
    foreach ( $malicious_ua as $ua ) {
        if ( isset( $_SERVER['HTTP_USER_AGENT'] ) && stripos( $_SERVER['HTTP_USER_AGENT'], $ua ) !== false ) {
            status_header( 403 );
            die( 'Access Denied: Potential Malicious Activity Detected.' );
        }
    }

    // 2. Block direct access to critical query strings
    if ( isset( $_SERVER['QUERY_STRING'] ) && ( stripos( $_SERVER['QUERY_STRING'], 'wp-config.php' ) !== false || stripos( $_SERVER['QUERY_STRING'], 'eval(' ) !== false ) ) {
        status_header( 403 );
        die( 'Forbidden: Unauthorized Parameter.' );
    }
}
