<?php
/**
 * NMM – One-Time Admin Password Reset
 *
 * USAGE:
 *   1. Upload this file to the WordPress root via FTP.
 *   2. Visit:  https://novymatrixmedia.sk/nmm-pass-reset.php?token=nmm_reset_2026
 *   3. Copy the generated password from the page.
 *   4. DELETE this file from the server immediately.
 *
 * SECURITY: The ?token parameter is a basic guard against accidental exposure.
 * Delete this file the moment you have the new password – do NOT leave it on the server.
 */

define( 'ABSPATH_CHECK', true );

// ── Guard: require a matching token ────────────────────────────────────────────
$expected_token = 'nmm_reset_2026';
$provided_token = isset( $_GET['token'] ) ? (string) $_GET['token'] : '';

if ( ! hash_equals( $expected_token, $provided_token ) ) {
    http_response_code( 403 );
    exit( '<h2>403 Forbidden</h2><p>Missing or invalid token.</p>' );
}

// ── Bootstrap WordPress (no theme/plugins needed) ──────────────────────────────
define( 'SHORTINIT', false );
require_once __DIR__ . '/wp-load.php';

// ── Identify the target user ───────────────────────────────────────────────────
$target_login = 'admin_nmm';
$user         = get_user_by( 'login', $target_login );

if ( ! $user ) {
    exit( '<h2>Error</h2><p>User "' . esc_html( $target_login ) . '" not found.</p>' );
}

// ── Generate a secure random password ─────────────────────────────────────────
$new_password = wp_generate_password( 20, true, false );

// ── Apply the new password ─────────────────────────────────────────────────────
wp_set_password( $new_password, $user->ID );

// ── Fix the email typo while we are here ──────────────────────────────────────
$correct_email = 'info@novymatrixmedia.sk';
wp_update_user( [
    'ID'         => $user->ID,
    'user_email' => $correct_email,
] );

// Also fix the site admin_email option if it is still the default placeholder.
$current_admin_email = get_option( 'admin_email' );
if ( 'admin@example.com' === $current_admin_email ) {
    update_option( 'admin_email', $correct_email );
}

// ── Output the result (plain HTML – no CSS dependency) ────────────────────────
?>
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <title>NMM Password Reset – done</title>
  <style>
    body { font-family: monospace; max-width: 600px; margin: 60px auto; padding: 20px; background: #111; color: #0f0; }
    .box { border: 1px solid #0f0; padding: 20px; border-radius: 4px; }
    .pw  { font-size: 1.4em; letter-spacing: 2px; color: #ff0; word-break: break-all; }
    .warn { color: #f80; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>✓ Password reset complete</h2>
    <p><strong>Login:</strong> <?php echo esc_html( $target_login ); ?></p>
    <p><strong>New password:</strong><br><span class="pw"><?php echo esc_html( $new_password ); ?></span></p>
    <p><strong>Email fixed:</strong> <?php echo esc_html( $correct_email ); ?></p>
    <p class="warn">
      ⚠ COPY THIS PASSWORD NOW.<br>
      Then <strong>delete</strong> <code>nmm-pass-reset.php</code> from the server immediately.<br>
      This page will not show the password again.
    </p>
  </div>
</body>
</html>
