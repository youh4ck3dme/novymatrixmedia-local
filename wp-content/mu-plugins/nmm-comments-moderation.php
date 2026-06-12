<?php
/**
 * Plugin Name: NMM Comments Moderation Guard
 * Description: Enforces safe public comments workflow for headless frontend.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runtime guard for discussion behavior.
 * - Visitors can comment without WP account.
 * - Every visitor comment requires manual approval.
 * - Name and e-mail are required.
 */
add_filter(
	'pre_option_comment_registration',
	static function () {
		return 0;
	}
);

add_filter(
	'pre_option_comment_moderation',
	static function () {
		return 1;
	}
);

add_filter(
	'pre_option_comment_whitelist',
	static function () {
		return 0;
	}
);

add_filter(
	'pre_option_require_name_email',
	static function () {
		return 1;
	}
);

add_filter(
	'pre_option_default_comment_status',
	static function () {
		return 'open';
	}
);

/**
 * Allow anonymous comment creation via WP REST API.
 * WordPress keeps this disabled by default even when comment_registration is off.
 */
add_filter(
	'rest_allow_anonymous_comments',
	static function () {
		return true;
	},
	10,
	2
);

/**
 * Safety net: keep new visitor comments pending even if discussion options change later.
 */
add_filter(
	'pre_comment_approved',
	static function ( $approved ) {
		if ( is_user_logged_in() && current_user_can( 'moderate_comments' ) ) {
			return $approved;
		}

		return 0;
	},
	10,
	1
);

/**
 * Persist matching options in database for clear visibility in WP admin discussion screen.
 */
add_action(
	'admin_init',
	static function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$desired_options = array(
			'comment_registration'       => '0',
			'comment_moderation'         => '1',
			'comment_previously_approved' => '0',
			'require_name_email'         => '1',
			'default_comment_status'     => 'open',
		);

		foreach ( $desired_options as $option_name => $expected_value ) {
			$current_value = (string) get_option( $option_name );

			if ( $current_value !== $expected_value ) {
				update_option( $option_name, $expected_value );
			}
		}
	},
	20
);
