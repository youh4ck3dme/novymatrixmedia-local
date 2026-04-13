<?php
/**
 * Plugin Name: NMM Temporary Service Notice
 * Description: Shows a temporary service notice in WP admin while the public frontend is impacted by the Vercel billing issue.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return string
 */
function nmm_temporary_service_notice_message() {
	return 'Docasny oznam: verejny frontend NOVY MATRIX MEDIA moze byt docasne obmedzeny kvoli problemu s Vercel billingom. Redakcna praca a WordPress CMS ostavaju dostupne na info.novymatrixmedia.sk/wp-admin.';
}

/**
 * Render the admin notice for all logged-in CMS users with dashboard access.
 */
function nmm_render_temporary_service_notice() {
	if ( ! is_admin() || ! is_user_logged_in() ) {
		return;
	}

	$message = nmm_temporary_service_notice_message();
	$admin_url = 'https://info.novymatrixmedia.sk/wp-admin';

	printf(
		'<div class="notice notice-warning"><p><strong>%1$s</strong></p><p><a href="%2$s" target="_blank" rel="noreferrer noopener">Otvorit WordPress CMS</a></p></div>',
		esc_html( $message ),
		esc_url( $admin_url )
	);
}
add_action( 'admin_notices', 'nmm_render_temporary_service_notice' );

/**
 * Repeat the same notice on the login screen so the status is visible before sign-in.
 *
 * @param string $message Existing login message HTML.
 *
 * @return string
 */
function nmm_append_temporary_service_login_notice( $message ) {
	$notice = sprintf(
		'<div class="message notice notice-warning"><p>%1$s</p></div>',
		esc_html( nmm_temporary_service_notice_message() )
	);

	return $notice . $message;
}
add_filter( 'login_message', 'nmm_append_temporary_service_login_notice' );
