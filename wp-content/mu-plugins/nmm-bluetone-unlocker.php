<?php
/**
 * Plugin Name: NMM Bluetone Unlocker (Permanent)
 * Description: Ensures Bluetone theme remains unlocked and ad-free even after updates.
 * Version: 1.0
 * Author: Antigravity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Remove Bluetone Admin Notices and Admin Bar Button
 */
add_action( 'admin_init', function() {
    // Remove the annoying admin notice
    remove_action( 'admin_notices', 'bluetone_admin_notice' );
    
    // Remove the Helper menu page if it exists
    remove_action( 'admin_menu', 'realtime_themes_helper_register_menu' );
}, 20 );

add_action( 'admin_bar_menu', function( $wp_admin_bar ) {
    // Remove the specific node from admin bar by ID
    $wp_admin_bar->remove_node( 'real_time_themes_helper_button2' );
}, 999 );

/**
 * Enqueue JavaScript to Unlock Blocks in the Editor
 */
add_action( 'enqueue_block_editor_assets', function() {
    $script = "
        (function() {
            const unlock = () => {
                if (window.wp && window.wp.hooks) {
                    // Remove the theme's move lock filter
                    window.wp.hooks.removeFilter(
                        'editor.BlockEdit',
                        'realtime-themes-helper/lock-all-blocks'
                    );
                    
                    // Remove the theme's ad-pro filter for core/group
                    window.wp.hooks.removeFilter(
                        'editor.BlockEdit',
                        'realtime-themes-helper/ad-pro-core-group'
                    );

                    console.log('NMM Unlocker: Block movement restored and ads removed.');
                }
            };
            
            // Run on load and periodically to catch late-loading filters
            unlock();
            setTimeout(unlock, 1000);
            setTimeout(unlock, 3000);
        })();
    ";
    wp_add_inline_script( 'wp-blocks', $script );
}, 100 );

/**
 * Hide Upsell panels via CSS in the Editor
 */
add_action( 'admin_head', function() {
    echo '<style>
        /* Hide Bluetone Upsell Sections in Customizer */
        .bluetone_upsell_section, #accordion-section-upsell_section { display: none !important; }
        /* Hide Real Time Themes Helper Sidebar and panels in Editor */
        .interface-complementary-area__tab[data-plugin="real-time-themes-helper-sidebar"],
        .edit-post-sidebar__panel-body[title="Unlock all features"] { display: none !important; }
    </style>';
});
