<?php
/**
 * Plugin Name: NMM Headless Routing
 * Description: Sends post/view links to Next.js frontend and blocks public WP theme rendering on CMS subdomain.
 * Version: 1.0.0
 * Author: Novy Matrix Media
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return string
 */
function nmm_headless_frontend_url() {
	$configured = defined( 'NMM_FRONTEND_URL' ) ? (string) NMM_FRONTEND_URL : '';
	$url        = '' !== $configured ? $configured : 'https://novymatrixmedia.sk';

	return untrailingslashit( $url );
}

/**
 * @param WP_Post $post
 *
 * @return string
 */
function nmm_headless_build_post_url( $post ) {
	$slug = (string) $post->post_name;

	if ( '' === $slug ) {
		return nmm_headless_frontend_url() . '/';
	}

	return nmm_headless_frontend_url() . '/' . rawurlencode( $slug ) . '/';
}

/**
 * Publish links in WP editor should always target Next.js frontend.
 */
function nmm_headless_filter_post_link( $permalink, $post ) {
	if ( ! ( $post instanceof WP_Post ) || 'post' !== $post->post_type ) {
		return $permalink;
	}

	if ( 'publish' !== $post->post_status ) {
		return $permalink;
	}

	return nmm_headless_build_post_url( $post );
}
add_filter( 'post_link', 'nmm_headless_filter_post_link', 10, 2 );

/**
 * Keep preview links untouched for drafts, but route published previews to frontend.
 */
function nmm_headless_filter_preview_link( $preview_link, $post ) {
	if ( ! ( $post instanceof WP_Post ) || 'post' !== $post->post_type ) {
		return $preview_link;
	}

	if ( 'publish' !== $post->post_status ) {
		return $preview_link;
	}

	return nmm_headless_build_post_url( $post );
}
add_filter( 'preview_post_link', 'nmm_headless_filter_preview_link', 10, 2 );

/**
 * Prevent public theme rendering on CMS/backend subdomain.
 */
function nmm_headless_redirect_public_requests() {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
		return;
	}

	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return;
	}

	if ( isset( $_GET['rest_route'] ) ) {
		return;
	}

	if ( isset( $_GET['graphql'] ) ) {
		return;
	}

	if ( isset( $_GET['doing_wp_cron'] ) ) {
		return;
	}

	if ( isset( $_GET['preview'] ) && current_user_can( 'edit_posts' ) ) {
		return;
	}

	$method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) : 'GET';
	if ( ! in_array( $method, array( 'GET', 'HEAD' ), true ) ) {
		return;
	}

	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '/';
	$path        = wp_parse_url( $request_uri, PHP_URL_PATH );
	$path        = is_string( $path ) ? $path : '/';

	$allowed_prefixes = array(
		'/wp-admin',
		'/wp-login.php',
		'/wp-json',
		'/graphql',
		'/xmlrpc.php',
		'/wp-cron.php',
		'/wp-content',
		'/wp-includes',
		'/wp-sitemap',
		'/sitemap.xml',
		'/robots.txt',
		'/favicon.ico',
	);

	foreach ( $allowed_prefixes as $prefix ) {
		if ( 0 === strpos( $path, $prefix ) ) {
			return;
		}
	}

	$frontend = nmm_headless_frontend_url();
	$current  = home_url();

	$frontend_host = wp_parse_url( $frontend, PHP_URL_HOST );
	$current_host  = wp_parse_url( $current, PHP_URL_HOST );
	if ( $frontend_host && $current_host && strtolower( $frontend_host ) === strtolower( $current_host ) ) {
		return;
	}

	$target = $frontend . ( '/' === $path ? '' : untrailingslashit( $path ) );
	if ( isset( $_SERVER['QUERY_STRING'] ) && '' !== $_SERVER['QUERY_STRING'] ) {
		$target .= '?' . (string) $_SERVER['QUERY_STRING'];
	}

	wp_redirect( esc_url_raw( $target ), 302 );
	exit;
}
add_action( 'template_redirect', 'nmm_headless_redirect_public_requests', 0 );
