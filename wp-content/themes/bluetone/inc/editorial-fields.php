<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function bluetone_get_editorial_field_definitions() {
	return array(
		'nmm_subtitle' => array(
			'label' => __( 'Subtitle', 'bluetone' ),
			'type' => 'text',
			'placeholder' => __( 'Krátky kontext pod hlavným titulkom', 'bluetone' ),
		),
		'nmm_author_name' => array(
			'label' => __( 'Author Name Override', 'bluetone' ),
			'type' => 'text',
			'placeholder' => __( 'Novy Matrix Media', 'bluetone' ),
		),
		'nmm_source_name' => array(
			'label' => __( 'Source Name', 'bluetone' ),
			'type' => 'text',
			'placeholder' => __( 'Reuters, TASR, vlastný zdroj...', 'bluetone' ),
		),
		'nmm_source_url' => array(
			'label' => __( 'Source URL', 'bluetone' ),
			'type' => 'url',
			'placeholder' => __( 'https://zdroj.sk/clanok', 'bluetone' ),
		),
		'nmm_featured_image_alt' => array(
			'label' => __( 'Featured Image Alt Override', 'bluetone' ),
			'type' => 'text',
			'placeholder' => __( 'Opis titulnej fotografie pre accessibility a SEO', 'bluetone' ),
		),
		'nmm_featured_image_caption' => array(
			'label' => __( 'Featured Image Caption', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 2,
			'placeholder' => __( 'Stručný popis alebo zdroj k titulnej fotografii', 'bluetone' ),
		),
		'nmm_gallery' => array(
			'label' => __( 'Gallery Items', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 4,
			'help' => __( 'One image per line in format: image-url | optional caption | optional alt text.', 'bluetone' ),
			'placeholder' => __( "https://cdn.websupport.sk/obrazok-1.jpg | Protest pred parlamentom | Dav pred budovou\nhttps://cdn.websupport.sk/obrazok-2.jpg | Reakcia opozície", 'bluetone' ),
			'example' => __( 'Tip: ak caption alebo alt nepotrebuješ, nechaj ich prázdne, ale oddeľovač | používaj len keď pokračuješ ďalším údajom.', 'bluetone' ),
		),
		'nmm_video_embed' => array(
			'label' => __( 'Video Embed', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 3,
			'help' => __( 'Paste a YouTube/Vimeo URL, iframe snippet, or direct MP4/WebM/Ogg file URL.', 'bluetone' ),
			'placeholder' => __( "https://www.youtube.com/watch?v=VIDEO_ID\n<iframe src=\"https://player.vimeo.com/video/123456\"></iframe>", 'bluetone' ),
			'example' => __( 'Frontend si URL alebo iframe normalizuje sám. Pri self-hosted videu vlož priamy .mp4/.webm/.ogg link.', 'bluetone' ),
		),
		'nmm_article_type' => array(
			'label' => __( 'Article Type', 'bluetone' ),
			'type' => 'select',
			'options' => array(
				'' => __( 'Select type', 'bluetone' ),
				'news' => __( 'News', 'bluetone' ),
				'analýza' => __( 'Analýza', 'bluetone' ),
				'komentár' => __( 'Komentár', 'bluetone' ),
				'breaking' => __( 'Breaking', 'bluetone' ),
			),
		),
		'nmm_highlight_badge' => array(
			'label' => __( 'Highlight Badge', 'bluetone' ),
			'type' => 'text',
			'help' => __( 'Examples: EXKLUZIVNE, AKTUALNE', 'bluetone' ),
			'placeholder' => __( 'AKTUALNE', 'bluetone' ),
		),
		'nmm_estimated_reading_time' => array(
			'label' => __( 'Estimated Reading Time', 'bluetone' ),
			'type' => 'text',
			'help' => __( 'Example: 4 min citania', 'bluetone' ),
			'placeholder' => __( '4 min citania', 'bluetone' ),
		),
		'nmm_fact_box' => array(
			'label' => __( 'Fact Box', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 4,
			'help' => __( 'One key point per line.', 'bluetone' ),
			'placeholder' => __( "Najdolezitejsi bod c. 1\nNajdolezitejsi bod c. 2\nNajdolezitejsi bod c. 3", 'bluetone' ),
		),
		'nmm_related_posts' => array(
			'label' => __( 'Related Post IDs', 'bluetone' ),
			'type' => 'text',
			'help' => __( 'Comma-separated post IDs for explicit related content.', 'bluetone' ),
			'placeholder' => __( '125, 126, 130', 'bluetone' ),
		),
		'nmm_quote_block' => array(
			'label' => __( 'Quote Block', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 3,
			'placeholder' => __( 'Silna veta alebo citat, ktory ma vystupit ako editorial highlight.', 'bluetone' ),
		),
		'nmm_seo_title' => array(
			'label' => __( 'SEO Title', 'bluetone' ),
			'type' => 'text',
			'placeholder' => __( 'Kratky SEO title do vyhladavaca', 'bluetone' ),
		),
		'nmm_seo_description' => array(
			'label' => __( 'SEO Description', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 2,
			'placeholder' => __( 'Zhrnutie clanku pre Google a social preview.', 'bluetone' ),
		),
		'nmm_og_title' => array(
			'label' => __( 'OG Title', 'bluetone' ),
			'type' => 'text',
			'placeholder' => __( 'Alternativny titulok pre social share', 'bluetone' ),
		),
		'nmm_og_description' => array(
			'label' => __( 'OG Description', 'bluetone' ),
			'type' => 'textarea',
			'rows' => 2,
			'placeholder' => __( 'Alternativny popis pre Facebook, X a Telegram preview.', 'bluetone' ),
		),
		'nmm_og_image' => array(
			'label' => __( 'OG Image URL', 'bluetone' ),
			'type' => 'url',
			'placeholder' => __( 'https://cdn.websupport.sk/social-cover.jpg', 'bluetone' ),
		),
	);
}

function bluetone_register_editorial_meta() {
	foreach ( bluetone_get_editorial_field_definitions() as $meta_key => $field ) {
		register_post_meta(
			'post',
			$meta_key,
			array(
				'show_in_rest' => true,
				'single' => true,
				'type' => 'string',
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => 'bluetone_sanitize_editorial_meta',
			)
		);
	}
}

add_action( 'init', 'bluetone_register_editorial_meta' );

function bluetone_sanitize_editorial_meta( $value ) {
	if ( ! is_string( $value ) ) {
		return '';
	}

	return wp_kses_post( trim( $value ) );
}

function bluetone_add_editorial_meta_box() {
	add_meta_box(
		'bluetone-editorial-fields',
		__( 'Novy Matrix Media Editorial Fields', 'bluetone' ),
		'bluetone_render_editorial_meta_box',
		'post',
		'normal',
		'high'
	);
}

add_action( 'add_meta_boxes', 'bluetone_add_editorial_meta_box' );

function bluetone_render_editorial_meta_box( $post ) {
	wp_nonce_field( 'bluetone_save_editorial_fields', 'bluetone_editorial_nonce' );
	$fields = bluetone_get_editorial_field_definitions();

	echo '<div style="margin-bottom:18px;padding:14px 16px;border:1px solid #dcdcde;background:#f6f7f7;">';
	echo '<strong style="display:block;margin-bottom:6px;">' . esc_html__( 'Editorial workflow hint', 'bluetone' ) . '</strong>';
	echo '<span style="display:block;color:#50575e;line-height:1.5;">' . esc_html__( 'Native WordPress fields handle title, excerpt, content, category, tags and featured image. Use the fields below only for premium article presentation, structured metadata and media extras in the Next.js frontend.', 'bluetone' ) . '</span>';
	echo '</div>';

	echo '<div class="bluetone-editorial-grid">';
	foreach ( $fields as $meta_key => $field ) {
		$value = get_post_meta( $post->ID, $meta_key, true );
		echo '<p style="margin-bottom:16px;">';
		echo '<label for="' . esc_attr( $meta_key ) . '" style="display:block;font-weight:600;margin-bottom:6px;">' . esc_html( $field['label'] ) . '</label>';
		$placeholder_attr = ! empty( $field['placeholder'] ) ? ' placeholder="' . esc_attr( $field['placeholder'] ) . '"' : '';

		switch ( $field['type'] ) {
			case 'textarea':
				echo '<textarea id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" rows="' . esc_attr( isset( $field['rows'] ) ? $field['rows'] : 3 ) . '" style="width:100%;"' . $placeholder_attr . '>' . esc_textarea( $value ) . '</textarea>';
				break;
			case 'select':
				echo '<select id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" style="width:100%;">';
				foreach ( $field['options'] as $option_value => $option_label ) {
					echo '<option value="' . esc_attr( $option_value ) . '" ' . selected( $value, $option_value, false ) . '>' . esc_html( $option_label ) . '</option>';
				}
				echo '</select>';
				break;
			default:
				echo '<input id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" type="' . esc_attr( $field['type'] ) . '" value="' . esc_attr( $value ) . '" style="width:100%;"' . $placeholder_attr . ' />';
				break;
		}

		if ( ! empty( $field['help'] ) ) {
			echo '<span style="display:block;margin-top:6px;color:#5c6770;">' . esc_html( $field['help'] ) . '</span>';
		}

		if ( ! empty( $field['example'] ) ) {
			echo '<span style="display:block;margin-top:6px;color:#2c3338;font-style:italic;line-height:1.5;">' . esc_html( $field['example'] ) . '</span>';
		}

		echo '</p>';
	}
	echo '</div>';
}

function bluetone_save_editorial_meta_box( $post_id ) {
	if ( ! isset( $_POST['bluetone_editorial_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bluetone_editorial_nonce'] ) ), 'bluetone_save_editorial_fields' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	foreach ( bluetone_get_editorial_field_definitions() as $meta_key => $field ) {
		if ( ! isset( $_POST[ $meta_key ] ) ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		$raw_value = wp_unslash( $_POST[ $meta_key ] );
		$sanitized_value = bluetone_sanitize_editorial_meta( is_string( $raw_value ) ? $raw_value : '' );

		if ( '' === $sanitized_value ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		update_post_meta( $post_id, $meta_key, $sanitized_value );
	}
}

add_action( 'save_post_post', 'bluetone_save_editorial_meta_box' );