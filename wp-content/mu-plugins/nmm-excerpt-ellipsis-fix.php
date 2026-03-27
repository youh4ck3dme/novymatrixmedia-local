<?php
/**
 * Plugin Name: NMM Excerpt Ellipsis Fix
 * Description: Normalizes malformed excerpt ellipsis tokens and provides a WP-CLI cleanup command for stored excerpts.
 * Version: 1.0.0
 * Author: Novy Matrix Media
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns excerpt text with malformed trailing ellipsis tokens normalized.
 *
 * @param string $text Excerpt text.
 * @return string
 */
function nmm_excerpt_normalize_ellipsis_token( $text ) {
	if ( ! is_string( $text ) || '' === $text ) {
		return $text;
	}

	return preg_replace(
		'/(?:\s|&nbsp;|&#160;)*(?:#8230|&#0*8230;|&amp;#0*8230;|&#0*38;#0*8230;|&hellip;|&amp;hellip;)\s*$/i',
		'...',
		$text
	);
}

/**
 * Forces a consistent excerpt suffix for auto-generated excerpts.
 *
 * @param string $more Existing excerpt suffix.
 * @return string
 */
function nmm_excerpt_force_more_text( $more ) {
	return '...';
}
add_filter( 'excerpt_more', 'nmm_excerpt_force_more_text', 9999 );

/**
 * Normalizes malformed excerpt suffixes before output.
 *
 * @param string $excerpt Excerpt output.
 * @return string
 */
function nmm_excerpt_normalize_output( $excerpt ) {
	return nmm_excerpt_normalize_ellipsis_token( $excerpt );
}
add_filter( 'get_the_excerpt', 'nmm_excerpt_normalize_output', 9999 );

/**
 * Cleans malformed trailing ellipsis tokens in stored post excerpts.
 *
 * @param bool $dry_run    When true, does not write updates.
 * @param int  $batch_size Number of records loaded per loop.
 * @return array<string, int>
 */
function nmm_excerpt_cleanup_stored_values( $dry_run = true, $batch_size = 500 ) {
	global $wpdb;

	$batch_size = max( 1, min( 2000, (int) $batch_size ) );
	$last_id    = 0;
	$scanned    = 0;
	$updated    = 0;

	do {
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_excerpt
				 FROM {$wpdb->posts}
				 WHERE ID > %d
				   AND post_excerpt IS NOT NULL
				   AND post_excerpt <> ''
				   AND ( post_excerpt LIKE %s OR post_excerpt LIKE %s OR post_excerpt LIKE %s OR post_excerpt LIKE %s )
				 ORDER BY ID ASC
				 LIMIT %d",
				$last_id,
				'%#8230%',
				'%8230;%',
				'%hellip%',
				'%#038;#8230;%',
				$batch_size
			)
		);

		if ( empty( $rows ) ) {
			break;
		}

		foreach ( $rows as $row ) {
			$last_id = (int) $row->ID;
			$scanned++;

			$cleaned = nmm_excerpt_normalize_ellipsis_token( $row->post_excerpt );
			if ( $cleaned === $row->post_excerpt ) {
				continue;
			}

			if ( ! $dry_run ) {
				$result = $wpdb->update(
					$wpdb->posts,
					array( 'post_excerpt' => $cleaned ),
					array( 'ID' => (int) $row->ID ),
					array( '%s' ),
					array( '%d' )
				);

				if ( false === $result ) {
					continue;
				}
			}

			$updated++;
		}
	} while ( true );

	return array(
		'scanned' => $scanned,
		'updated' => $updated,
		'dry_run' => $dry_run ? 1 : 0,
	);
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Runs stored excerpt cleanup from CLI.
	 *
	 * ## OPTIONS
	 *
	 * [--dry-run]
	 * : Simulate the cleanup without writing changes.
	 *
	 * [--batch-size=<n>]
	 * : Number of rows fetched in one batch. Default: 500.
	 *
	 * @param array<int, string>   $args       Positional args.
	 * @param array<string, mixed> $assoc_args Associative args.
	 */
	function nmm_excerpt_cleanup_cli_command( $args, $assoc_args ) {
		$dry_run    = isset( $assoc_args['dry-run'] );
		$batch_size = isset( $assoc_args['batch-size'] ) ? (int) $assoc_args['batch-size'] : 500;

		$result = nmm_excerpt_cleanup_stored_values( $dry_run, $batch_size );

		WP_CLI::log( sprintf( 'Scanned excerpts: %d', (int) $result['scanned'] ) );
		WP_CLI::log( sprintf( 'Changed excerpts: %d', (int) $result['updated'] ) );

		if ( $dry_run ) {
			WP_CLI::success( 'Dry run completed. Re-run without --dry-run to persist changes.' );
			return;
		}

		WP_CLI::success( 'Excerpt cleanup completed and saved.' );
	}

	WP_CLI::add_command( 'nmm excerpt-cleanup', 'nmm_excerpt_cleanup_cli_command' );
}
