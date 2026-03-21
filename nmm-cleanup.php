<?php
/**
 * NMM Cleanup & Optimization Script
 * CLI usage: wp eval-file nmm-cleanup.php
 */

if ( ! defined( 'ABSPATH' ) ) {
    // If called directly, try to load WP
    require_once( 'wp-load.php' );
}

if ( ! current_user_can( 'manage_options' ) && PHP_SAPI !== 'cli' ) {
    die( 'Unauthorized' );
}

echo "Starting Nový Matrix Media Cleanup...\n";

global $wpdb;

// 1. Post Revisions Cleanup
$revisions_deleted = $wpdb->query( "DELETE FROM $wpdb->posts WHERE post_type = 'revision'" );
echo "- Deleted $revisions_deleted post revisions.\n";

// 2. Orphaned Post Meta Cleanup
$meta_deleted = $wpdb->query( "DELETE pm FROM $wpdb->postmeta pm LEFT JOIN $wpdb->posts wp ON wp.ID = pm.post_id WHERE wp.ID IS NULL" );
echo "- Deleted $meta_deleted orphaned post meta entries.\n";

// 3. Rank Math Analytics Cleanup (example)
if ( $wpdb->get_var( "SHOW TABLES LIKE '{$wpdb->prefix}rank_math_analytics_objects'" ) ) {
    // Keep only last 30 days of analytics if table exists
    // $wpdb->query("DELETE FROM {$wpdb->prefix}rank_math_analytics_objects WHERE created < DATE_SUB(NOW(), INTERVAL 30 DAY)");
    echo "- Rank Math analytics table identified.\n";
}

// 4. Transients Cleanup
$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_%' OR option_name LIKE '_site_transient_%'" );
echo "- All transients cleared.\n";

echo "Cleanup completed successfully!\n";
