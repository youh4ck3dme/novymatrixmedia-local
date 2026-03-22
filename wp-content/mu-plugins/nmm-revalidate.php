<?php
/**
 * Plugin Name: NMM Vercel Revalidator
 * Description: Triggers Next.js on-demand ISR revalidation when a post is published or updated.
 * Version:     1.2
 * Author:      Antigravity AI
 *
 * Configuration (add to wp-config-production.php):
 *   define( 'NMM_REVALIDATE_SECRET', 'your_long_random_secret_here' );
 *   define( 'NMM_REVALIDATE_URL',    'https://your-nextjs-app.vercel.app/api/revalidate' );
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'transition_post_status', 'nmm_revalidate_on_status_change', 10, 3 );

function nmm_revalidate_on_status_change( string $new_status, string $old_status, WP_Post $post ): void {
    if ( 'post' !== $post->post_type ) {
        return;
    }

    $should_fire = ( 'publish' === $new_status ) || ( 'publish' === $old_status && $new_status !== $old_status );

    if ( ! $should_fire ) {
        return;
    }

    // Fire directly instead of via cron for reliability.
    nmm_send_revalidate_request( $post->ID );
}

function nmm_send_revalidate_request( int $post_id ): void {
    $secret = defined( 'NMM_REVALIDATE_SECRET' ) ? NMM_REVALIDATE_SECRET : '';
    $url    = defined( 'NMM_REVALIDATE_URL' )    ? NMM_REVALIDATE_URL    : '';

    if ( empty( $secret ) || empty( $url ) ) {
        return;
    }

    $post = get_post( $post_id );
    if ( ! $post ) {
        return;
    }

    $categories     = get_the_category( $post_id );
    $category_slugs = array_map( static fn( WP_Term $cat ) => $cat->slug, $categories );

    $payload = wp_json_encode( [
        'secret'         => $secret,
        'slug'           => $post->post_name,
        'postId'         => $post_id,
        'categorySlugs'  => array_values( $category_slugs ),
    ] );

    $response = wp_remote_post( $url, [
        'headers'   => [ 'Content-Type' => 'application/json' ],
        'body'      => $payload,
        'timeout'   => 10,
        'sslverify' => true,
    ] );

    if ( is_wp_error( $response ) ) {
        error_log( '[NMM Revalidate] Error: ' . $response->get_error_message() );
    } elseif ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        $code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        error_log( "[NMM Revalidate] OK: HTTP $code - $body" );
    }
}
