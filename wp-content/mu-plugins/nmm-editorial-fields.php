<?php
/**
 * Plugin Name: NMM Editorial Fields
 * Description: Registers Novy Matrix Media editorial post meta and renders the editorial meta box.
 * Version: 1.0.0
 * Author: Novy Matrix Media
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central field map so REST registration, editor rendering, and saving stay in sync.
 *
 * @return array<string, array<string, mixed>>
 */
function nmm_editorial_fields_definitions() {
	return array(
		'nmm_subtitle' => array(
			'section'     => 'story',
			'label'       => 'Subtitle',
			'type'        => 'text',
			'placeholder' => 'Short context under the main headline',
		),
		'nmm_author_name' => array(
			'section'     => 'story',
			'label'       => 'Author Name',
			'type'        => 'text',
			'placeholder' => 'Novy Matrix Media',
		),
		'nmm_source_name' => array(
			'section'     => 'media',
			'label'       => 'Source Name',
			'type'        => 'text',
			'placeholder' => 'Reuters, AP, TASR...',
		),
		'nmm_source_url' => array(
			'section'     => 'media',
			'label'       => 'Source URL',
			'type'        => 'url',
			'placeholder' => 'https://source.example/story',
		),
		'nmm_featured_image_alt' => array(
			'section'     => 'media',
			'label'       => 'Featured Image Alt',
			'type'        => 'text',
			'placeholder' => 'Accessible image description',
		),
		'nmm_featured_image_caption' => array(
			'section'     => 'media',
			'label'       => 'Featured Image Caption',
			'type'        => 'textarea',
			'rows'        => 2,
			'placeholder' => 'Image caption or source attribution',
		),
		'nmm_gallery' => array(
			'section'     => 'media',
			'label'       => 'Gallery Items',
			'type'        => 'textarea',
			'rows'        => 4,
			'help'        => 'One item per line: image-url | optional caption | optional alt text.',
			'placeholder' => "https://cdn.example.com/image-1.jpg | Protest in city center | Crowd in front of parliament",
		),
		'nmm_video_embed' => array(
			'section'     => 'media',
			'label'       => 'Video Embed',
			'type'        => 'textarea',
			'rows'        => 3,
			'help'        => 'Paste YouTube/Vimeo URL, iframe snippet, or direct MP4/WebM/Ogg URL.',
			'placeholder' => 'https://www.youtube.com/watch?v=VIDEO_ID',
		),
		'nmm_article_type' => array(
			'section' => 'story',
			'label'   => 'Article Type',
			'type'    => 'select',
			'options' => array(
				''          => 'Select type',
				'news'      => 'News',
				'analyza'   => 'Analyza',
				'komentar'  => 'Komentar',
				'breaking'  => 'Breaking',
			),
		),
		'nmm_highlight_badge' => array(
			'section'     => 'story',
			'label'       => 'Highlight Badge',
			'type'        => 'text',
			'placeholder' => 'AKTUALNE',
		),
		'nmm_estimated_reading_time' => array(
			'section'     => 'story',
			'label'       => 'Estimated Reading Time',
			'type'        => 'text',
			'placeholder' => '4 min citania',
		),
		'nmm_fact_box' => array(
			'section'     => 'story',
			'label'       => 'Fact Box',
			'type'        => 'textarea',
			'rows'        => 4,
			'help'        => 'One key point per line.',
			'placeholder' => "Key point 1\nKey point 2\nKey point 3",
		),
		'nmm_related_posts' => array(
			'section'     => 'distribution',
			'label'       => 'Related Post IDs',
			'type'        => 'text',
			'help'        => 'Comma-separated post IDs.',
			'placeholder' => '125,126,130',
		),
		'nmm_quote_block' => array(
			'section'     => 'story',
			'label'       => 'Quote Block',
			'type'        => 'textarea',
			'rows'        => 3,
			'placeholder' => 'Strong quote highlighted in the article.',
		),
		'nmm_editorial_readiness' => array(
			'section' => 'workflow',
			'label'   => 'Editorial Readiness',
			'type'    => 'select',
			'options' => array(
				''             => 'Not set',
				'draft-ingest' => 'Draft ingest',
				'needs-review' => 'Needs review',
				'editing'      => 'In editing',
				'ready'        => 'Ready to publish',
			),
		),
		// Kept for backward compatibility with current frontend mapping.
		'nmm_seo_title' => array(
			'section'     => 'distribution',
			'label'       => 'SEO Title',
			'type'        => 'text',
			'placeholder' => 'SEO title override',
		),
		'nmm_seo_description' => array(
			'section'     => 'distribution',
			'label'       => 'SEO Description',
			'type'        => 'textarea',
			'rows'        => 2,
			'placeholder' => 'SEO description override',
		),
		'nmm_og_title' => array(
			'section'     => 'distribution',
			'label'       => 'OG Title',
			'type'        => 'text',
			'placeholder' => 'Open Graph title override',
		),
		'nmm_og_description' => array(
			'section'     => 'distribution',
			'label'       => 'OG Description',
			'type'        => 'textarea',
			'rows'        => 2,
			'placeholder' => 'Open Graph description override',
		),
		'nmm_og_image' => array(
			'section'     => 'distribution',
			'label'       => 'OG Image URL',
			'type'        => 'url',
			'placeholder' => 'https://cdn.example.com/og-image.jpg',
		),
	);
}

/**
 * @return array<string, string>
 */
function nmm_editorial_fields_sections() {
	return array(
		'workflow'     => 'Workflow',
		'story'        => 'Story Layer',
		'media'        => 'Media Layer',
		'distribution' => 'SEO & Distribution',
	);
}

/**
 * Removes legacy theme hooks if the same editorial registration is still wired there.
 * This prevents duplicate register_post_meta/meta box/save handlers after MU migration.
 */
function nmm_editorial_fields_detach_theme_registration() {
	if ( function_exists( 'bluetone_register_editorial_meta' ) ) {
		remove_action( 'init', 'bluetone_register_editorial_meta' );
	}

	if ( function_exists( 'bluetone_add_editorial_meta_box' ) ) {
		remove_action( 'add_meta_boxes', 'bluetone_add_editorial_meta_box' );
	}

	if ( function_exists( 'bluetone_save_editorial_meta_box' ) ) {
		remove_action( 'save_post_post', 'bluetone_save_editorial_meta_box' );
	}
}
add_action( 'after_setup_theme', 'nmm_editorial_fields_detach_theme_registration', 1000 );

/**
 * Registers all editorial fields for REST API.
 */
function nmm_editorial_fields_register_meta() {
	foreach ( nmm_editorial_fields_definitions() as $meta_key => $field ) {
		register_post_meta(
			'post',
			$meta_key,
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'string',
				'auth_callback'     => static function() {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => 'nmm_editorial_fields_sanitize',
			)
		);
	}
}
add_action( 'init', 'nmm_editorial_fields_register_meta' );

/**
 * @param mixed $value
 *
 * @return string
 */
function nmm_editorial_fields_sanitize( $value ) {
	if ( ! is_string( $value ) ) {
		return '';
	}

	return wp_kses_post( trim( $value ) );
}

/**
 * Adds the editorial meta box to the post editor.
 */
function nmm_editorial_fields_add_meta_box() {
	add_meta_box(
		'nmm-editorial-fields',
		'Novy Matrix Media Editorial Fields',
		'nmm_editorial_fields_render_meta_box',
		'post',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'nmm_editorial_fields_add_meta_box' );

/**
 * @param WP_Post $post
 */
function nmm_editorial_fields_render_meta_box( $post ) {
	wp_nonce_field( 'nmm_editorial_fields_save', 'nmm_editorial_fields_nonce' );

	$definitions = nmm_editorial_fields_definitions();
	$sections    = nmm_editorial_fields_sections();

	foreach ( $sections as $section_key => $section_label ) {
		echo '<div style="margin-bottom:20px;padding:14px 16px;border:1px solid #dcdcde;background:#f6f7f7;">';
		echo '<strong style="display:block;margin-bottom:12px;">' . esc_html( $section_label ) . '</strong>';

		foreach ( $definitions as $meta_key => $field ) {
			if ( ( $field['section'] ?? '' ) !== $section_key ) {
				continue;
			}

			$value           = get_post_meta( $post->ID, $meta_key, true );
			$rows            = isset( $field['rows'] ) ? max( 1, (int) $field['rows'] ) : 3;
			$placeholder     = isset( $field['placeholder'] ) ? (string) $field['placeholder'] : '';
			$placeholder_attr = '' !== $placeholder ? ' placeholder="' . esc_attr( $placeholder ) . '"' : '';

			echo '<div style="margin-bottom:14px;">';
			echo '<label for="' . esc_attr( $meta_key ) . '" style="display:block;font-weight:600;margin-bottom:6px;">' . esc_html( (string) $field['label'] ) . '</label>';

			if ( 'textarea' === $field['type'] ) {
				echo '<textarea id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" rows="' . esc_attr( (string) $rows ) . '" style="width:100%;"' . $placeholder_attr . '>' . esc_textarea( (string) $value ) . '</textarea>';
			} elseif ( 'select' === $field['type'] ) {
				echo '<select id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" style="width:100%;">';
				foreach ( $field['options'] as $option_value => $option_label ) {
					echo '<option value="' . esc_attr( (string) $option_value ) . '" ' . selected( (string) $value, (string) $option_value, false ) . '>' . esc_html( (string) $option_label ) . '</option>';
				}
				echo '</select>';
			} else {
				$type = in_array( $field['type'], array( 'text', 'url' ), true ) ? $field['type'] : 'text';
				echo '<input id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" type="' . esc_attr( $type ) . '" value="' . esc_attr( (string) $value ) . '" style="width:100%;"' . $placeholder_attr . ' />';
			}

			if ( ! empty( $field['help'] ) ) {
				echo '<p style="margin:8px 0 0;color:#50575e;">' . esc_html( (string) $field['help'] ) . '</p>';
			}

			echo '</div>';
		}

		echo '</div>';
	}
}

/**
 * @param int $post_id
 */
function nmm_editorial_fields_save_meta_box( $post_id ) {
	if ( ! isset( $_POST['nmm_editorial_fields_nonce'] ) ) {
		return;
	}

	$nonce = sanitize_text_field( wp_unslash( $_POST['nmm_editorial_fields_nonce'] ) );
	if ( ! wp_verify_nonce( $nonce, 'nmm_editorial_fields_save' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	foreach ( nmm_editorial_fields_definitions() as $meta_key => $field ) {
		if ( ! isset( $_POST[ $meta_key ] ) ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		$raw_value = wp_unslash( $_POST[ $meta_key ] );
		$value     = nmm_editorial_fields_sanitize( is_string( $raw_value ) ? $raw_value : '' );

		if ( '' === $value ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		update_post_meta( $post_id, $meta_key, $value );
	}
}
add_action( 'save_post_post', 'nmm_editorial_fields_save_meta_box' );
