<?php
/**
 * Plugin Name: NMM Maintenance Switcher
 * Description: Enforces single super-admin email access and provides an admin switcher for frontend maintenance mode.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return string
 */
function nmm_switcher_allowed_email() {
	return 'larsenevans@proton.me';
}

/**
 * @return string
 */
function nmm_switcher_option_name() {
	return 'nmm_maintenance_mode';
}

/**
 * @return string
 */
function nmm_switcher_token_option_name() {
	return 'nmm_switcher_emergency_token';
}

/**
 * @return string
 */
function nmm_switcher_emergency_token() {
	$configured = defined( 'NMM_SWITCHER_TOKEN' ) ? (string) NMM_SWITCHER_TOKEN : '';
	if ( '' !== $configured ) {
		return $configured;
	}

	$stored = (string) get_option( nmm_switcher_token_option_name(), '' );
	if ( '' !== $stored ) {
		return $stored;
	}

	$generated = wp_generate_password( 48, false, false );
	update_option( nmm_switcher_token_option_name(), $generated, false );
	return $generated;
}

/**
 * @param string $mode
 *
 * @return string
 */
function nmm_switcher_build_emergency_url( $mode ) {
	return add_query_arg(
		array(
			'nmm_switcher_token' => nmm_switcher_emergency_token(),
			'nmm_mode'           => $mode,
		),
		wp_login_url()
	);
}

/**
 * @return bool
 */
function nmm_switcher_is_maintenance_enabled() {
	$value = get_option( nmm_switcher_option_name(), '1' );
	return '1' === (string) $value;
}

/**
 * @param WP_User $user
 *
 * @return bool
 */
function nmm_switcher_is_allowed_user( $user ) {
	if ( ! ( $user instanceof WP_User ) ) {
		return false;
	}

	$email = isset( $user->user_email ) ? (string) $user->user_email : '';
	return '' !== $email && 0 === strcasecmp( $email, nmm_switcher_allowed_email() );
}

/**
 * Ensure the allowed user keeps administrator role.
 */
add_action(
	'init',
	static function () {
		$allowed_user = get_user_by( 'email', nmm_switcher_allowed_email() );
		if ( ! ( $allowed_user instanceof WP_User ) ) {
			return;
		}

		if ( ! in_array( 'administrator', $allowed_user->roles, true ) ) {
			$allowed_user->set_role( 'administrator' );
		}
	},
	20
);

/**
 * Block login for every account except the allowed email.
 *
 * @param WP_User|WP_Error $user WP user after credentials check.
 *
 * @return WP_User|WP_Error
 */
add_filter(
	'wp_authenticate_user',
	static function ( $user ) {
		if ( is_wp_error( $user ) || ! ( $user instanceof WP_User ) ) {
			return $user;
		}

		if ( nmm_switcher_is_allowed_user( $user ) ) {
			return $user;
		}

		return new WP_Error(
			'nmm_access_blocked',
			'Tento pristup je vyhradeny pre hlavneho super admina.'
		);
	},
	99,
	1
);

/**
 * Block wp-admin for everyone except the allowed email user.
 */
add_action(
	'admin_init',
	static function () {
		if ( ! is_user_logged_in() ) {
			return;
		}

		$current_user = wp_get_current_user();
		if ( nmm_switcher_is_allowed_user( $current_user ) ) {
			return;
		}

		wp_logout();
		wp_die( 'Pristup zamietnuty.', 'Pristup zamietnuty', array( 'response' => 403 ) );
	},
	1
);

/**
 * Public endpoint for Next.js layout to read maintenance mode.
 */
add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'nmm/v1',
			'/site-state',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => '__return_true',
				'callback'            => static function () {
					return rest_ensure_response(
						array(
							'maintenanceMode' => nmm_switcher_is_maintenance_enabled(),
						)
					);
				},
			)
		);
	}
);

/**
 * Call Next.js revalidation endpoint after switch change.
 */
function nmm_switcher_trigger_revalidate() {
	$secret = defined( 'NMM_REVALIDATE_SECRET' ) ? (string) NMM_REVALIDATE_SECRET : '';
	$url    = defined( 'NMM_REVALIDATE_URL' ) ? (string) NMM_REVALIDATE_URL : '';

	if ( '' === $secret || '' === $url ) {
		return;
	}

	$payload = wp_json_encode(
		array(
			'secret'   => $secret,
			'purgeAll' => true,
		)
	);

	wp_remote_post(
		$url,
		array(
			'headers'   => array( 'Content-Type' => 'application/json' ),
			'body'      => $payload,
			'timeout'   => 10,
			'sslverify' => true,
		)
	);
}

/**
 * Emergency fallback endpoint:
 * /wp-login.php?nmm_switcher_token=...&nmm_mode=0|1
 * Allows switching maintenance mode even if wp-admin is inaccessible.
 */
add_action(
	'init',
	static function () {
		if ( ! isset( $_GET['nmm_switcher_token'] ) ) {
			return;
		}

		$provided_token = sanitize_text_field( wp_unslash( $_GET['nmm_switcher_token'] ) );
		$expected_token = nmm_switcher_emergency_token();

		if ( '' === $provided_token || ! hash_equals( $expected_token, $provided_token ) ) {
			wp_die( 'Invalid emergency token.', 'Access denied', array( 'response' => 403 ) );
		}

		$mode = isset( $_GET['nmm_mode'] ) ? sanitize_text_field( wp_unslash( $_GET['nmm_mode'] ) ) : '';
		if ( '0' !== $mode && '1' !== $mode ) {
			wp_die( 'Invalid mode. Use nmm_mode=0 or nmm_mode=1.', 'Invalid mode', array( 'response' => 400 ) );
		}

		update_option( nmm_switcher_option_name(), $mode, true );
		nmm_switcher_trigger_revalidate();

		header( 'Content-Type: text/plain; charset=utf-8' );
		echo 'OK: maintenance mode set to ';
		echo '1' === $mode ? 'ON' : 'OFF';
		exit;
	},
	0
);

/**
 * Render switcher admin page.
 */
function nmm_switcher_render_admin_page() {
	if ( ! is_user_logged_in() || ! nmm_switcher_is_allowed_user( wp_get_current_user() ) ) {
		wp_die( 'Pristup zamietnuty.', 'Pristup zamietnuty', array( 'response' => 403 ) );
	}

	$enabled = nmm_switcher_is_maintenance_enabled();
	$emergency_on_url  = nmm_switcher_build_emergency_url( '1' );
	$emergency_off_url = nmm_switcher_build_emergency_url( '0' );
	?>
	<div class="wrap">
		<h1>NMM Maintenance Switcher</h1>
		<p><strong>Aktualny stav:</strong> <?php echo esc_html( $enabled ? 'ZAPNUTY (fullscreen blok)' : 'VYPNUTY (normalny web)' ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<?php wp_nonce_field( 'nmm_switcher_toggle_mode' ); ?>
			<input type="hidden" name="action" value="nmm_switcher_toggle_mode" />
			<input type="hidden" name="mode" value="<?php echo esc_attr( $enabled ? '0' : '1' ); ?>" />
			<?php submit_button( $enabled ? 'Vypnut maintenance mode' : 'Zapnut maintenance mode', 'primary large' ); ?>
		</form>
		<hr />
		<h2>Emergency fallback URL</h2>
		<p>Pouzite, ak by bol wp-admin nedostupny.</p>
		<p><strong>Zapnut (ON):</strong><br /><code><?php echo esc_html( $emergency_on_url ); ?></code></p>
		<p><strong>Vypnut (OFF):</strong><br /><code><?php echo esc_html( $emergency_off_url ); ?></code></p>
	</div>
	<?php
}

add_action(
	'admin_menu',
	static function () {
		$current_user = wp_get_current_user();
		if ( ! is_user_logged_in() || ! nmm_switcher_is_allowed_user( $current_user ) ) {
			return;
		}

		add_menu_page(
			'NMM Switcher',
			'NMM Switcher',
			'read',
			'nmm-maintenance-switcher',
			'nmm_switcher_render_admin_page',
			'dashicons-shield',
			2
		);
	}
);

/**
 * Handle switch toggle.
 */
add_action(
	'admin_post_nmm_switcher_toggle_mode',
	static function () {
		if ( ! is_user_logged_in() || ! nmm_switcher_is_allowed_user( wp_get_current_user() ) ) {
			wp_die( 'Pristup zamietnuty.', 'Pristup zamietnuty', array( 'response' => 403 ) );
		}

		check_admin_referer( 'nmm_switcher_toggle_mode' );

		$mode = isset( $_POST['mode'] ) ? sanitize_text_field( wp_unslash( $_POST['mode'] ) ) : '1';
		update_option( nmm_switcher_option_name(), '1' === $mode ? '1' : '0', true );
		nmm_switcher_trigger_revalidate();

		wp_safe_redirect( admin_url( 'admin.php?page=nmm-maintenance-switcher' ) );
		exit;
	}
);
