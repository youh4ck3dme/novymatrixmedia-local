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
			'section'     => 'advanced',
			'label'       => 'Podtitul',
			'type'        => 'text',
			'placeholder' => 'Krátky kontext pod hlavným nadpisom',
		),
		'nmm_author_name' => array(
			'section'          => 'advanced',
			'label'            => 'Autor',
			'type'             => 'select',
			'help'             => 'Ak nezvolíš autora, použije sa WordPress autor článku.',
			'options_callback' => 'nmm_editorial_fields_get_author_options',
		),
		'nmm_source_name' => array(
			'section'     => 'advanced',
			'label'       => 'Zdroj - názov',
			'type'        => 'text',
			'placeholder' => 'Reuters, AP, TASR...',
		),
		'nmm_source_url' => array(
			'section'     => 'advanced',
			'label'       => 'Zdroj - URL',
			'type'        => 'url',
			'placeholder' => 'https://source.example/story',
		),
		'nmm_sources' => array(
			'section'     => 'primary',
			'label'       => 'Zdroje (viac položiek)',
			'type'        => 'textarea',
			'rows'        => 4,
			'help'        => 'Jeden zdroj na riadok: Názov | URL (URL je voliteľná).',
			'placeholder' => "Infovojna | https://example.com/sprava\nZem a Vek | https://example.com/clanok\nHlavný denník",
		),
		'nmm_featured_image_alt' => array(
			'section'     => 'advanced',
			'label'       => 'Alt text obrázku',
			'type'        => 'text',
			'placeholder' => 'Popis obrázku pre čítačky',
		),
		'nmm_featured_image_caption' => array(
			'section'     => 'advanced',
			'label'       => 'Popisok obrázku',
			'type'        => 'textarea',
			'rows'        => 2,
			'placeholder' => 'Popisok alebo atribúcia zdroja',
		),
		'nmm_gallery' => array(
			'section'     => 'advanced',
			'label'       => 'Galéria',
			'type'        => 'textarea',
			'rows'        => 4,
			'help'        => 'Jeden riadok = image-url | voliteľný popisok | voliteľný alt text.',
			'placeholder' => "https://cdn.example.com/image-1.jpg | Protest in city center | Crowd in front of parliament",
		),
		'nmm_video_embed' => array(
			'section'     => 'primary',
			'label'       => 'Video URL',
			'type'        => 'url',
			'help'        => 'Vlož YouTube URL alebo interné media URL (voliteľné).',
			'placeholder' => 'https://www.youtube.com/watch?v=VIDEO_ID',
		),
		'nmm_conclusion_number' => array(
			'section'     => 'primary',
			'label'       => 'Záver - číslo',
			'type'        => 'text',
			'placeholder' => '1',
		),
		'nmm_conclusion_text' => array(
			'section'     => 'primary',
			'label'       => 'Záver - text',
			'type'        => 'textarea',
			'rows'        => 2,
			'help'        => 'Voliteľné. Zobrazí sa pod obsahom ako blok „# Záver <číslo>“.',
			'placeholder' => 'Krátke zhrnutie článku v 1-3 vetách.',
		),
		'nmm_article_type' => array(
			'section' => 'advanced',
			'label'   => 'Typ článku',
			'type'    => 'select',
			'options' => array(
				''            => 'Automaticky podľa obsahu',
				'news'        => 'News',
				'analyza'     => 'Analýza',
				'komentar'    => 'Komentár',
				'breaking'    => 'Breaking',
				'analysis'    => 'Analysis',
				'commentary'  => 'Commentary',
				'explainer'   => 'Explainer',
				'feature'     => 'Feature',
				'video'       => 'Video',
			),
		),
		'nmm_highlight_badge' => array(
			'section'     => 'advanced',
			'label'       => 'Highlight badge',
			'type'        => 'text',
			'placeholder' => 'AKTUALNE',
		),
		'nmm_estimated_reading_time' => array(
			'section'     => 'advanced',
			'label'       => 'Čas čítania',
			'type'        => 'text',
			'placeholder' => 'Automaticky (napr. 4 min čítania)',
		),
		'nmm_fact_box' => array(
			'section'     => 'advanced',
			'label'       => 'Fact box',
			'type'        => 'textarea',
			'rows'        => 4,
			'help'        => 'Jeden bod na riadok.',
			'placeholder' => "Key point 1\nKey point 2\nKey point 3",
		),
		'nmm_related_posts' => array(
			'section'     => 'advanced',
			'label'       => 'Súvisiace články (ID)',
			'type'        => 'text',
			'help'        => 'ID oddelené čiarkou.',
			'placeholder' => '125,126,130',
		),
		'nmm_quote_block' => array(
			'section'     => 'advanced',
			'label'       => 'Quote block',
			'type'        => 'textarea',
			'rows'        => 3,
			'placeholder' => 'Zvýraznená citácia v článku.',
		),
		'nmm_editorial_readiness' => array(
			'section' => 'advanced',
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
			'section'     => 'advanced',
			'label'       => 'SEO Title',
			'type'        => 'text',
			'placeholder' => 'Automaticky z nadpisu',
		),
		'nmm_seo_description' => array(
			'section'     => 'advanced',
			'label'       => 'SEO Description',
			'type'        => 'textarea',
			'rows'        => 2,
			'placeholder' => 'Automaticky z perexu/úvodu',
		),
		'nmm_og_title' => array(
			'section'     => 'advanced',
			'label'       => 'OG Title',
			'type'        => 'text',
			'placeholder' => 'Automaticky zo SEO title',
		),
		'nmm_og_description' => array(
			'section'     => 'advanced',
			'label'       => 'OG Description',
			'type'        => 'textarea',
			'rows'        => 2,
			'placeholder' => 'Automaticky zo SEO description',
		),
		'nmm_og_image' => array(
			'section'     => 'advanced',
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
		'primary'      => 'Rýchle nastavenie',
		'advanced'     => 'Rozšírené nastavenia',
	);
}

/**
 * Builds a stable list of selectable author names for the editorial field.
 * Keeps backward compatibility by preserving unknown previously stored values.
 *
 * @param string $selected_value
 * @return array<string, string>
 */
function nmm_editorial_fields_get_author_options( $selected_value = '' ) {
	$options = array(
		'' => 'Automaticky podľa WordPress autora',
	);

	$users = get_users(
		array(
			'who'     => 'authors',
			'orderby' => 'display_name',
			'order'   => 'ASC',
			'fields'  => array( 'display_name' ),
		)
	);

	if ( is_array( $users ) ) {
		foreach ( $users as $user ) {
			if ( ! ( $user instanceof WP_User ) ) {
				continue;
			}

			$display_name = trim( (string) $user->display_name );
			if ( '' === $display_name ) {
				continue;
			}

			$options[ $display_name ] = $display_name;
		}
	}

	$selected_value = trim( (string) $selected_value );
	if ( '' !== $selected_value && ! isset( $options[ $selected_value ] ) ) {
		$options[ $selected_value ] = $selected_value;
	}

	return $options;
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
 * Exposes featured image data on the post REST object.
 * This keeps headless frontend image rendering stable even when wp/v2/media
 * is restricted by security rules.
 */
function nmm_editorial_fields_register_public_featured_image_fields() {
	$get_thumbnail_id = static function( array $post_data ): int {
		$post_id = isset( $post_data['id'] ) ? (int) $post_data['id'] : 0;
		return $post_id > 0 ? (int) get_post_thumbnail_id( $post_id ) : 0;
	};

	register_rest_field(
		'post',
		'nmm_featured_image_url',
		array(
			'get_callback' => static function( array $post_data ) use ( $get_thumbnail_id ): string {
				$thumbnail_id = $get_thumbnail_id( $post_data );
				if ( $thumbnail_id <= 0 ) {
					return '';
				}

				$image_url = wp_get_attachment_image_url( $thumbnail_id, 'full' );
				return is_string( $image_url ) ? $image_url : '';
			},
			'schema'       => array(
				'description' => 'Public featured image URL for headless clients.',
				'type'        => 'string',
				'context'     => array( 'view', 'embed', 'edit' ),
			),
		)
	);

	register_rest_field(
		'post',
		'nmm_featured_image_alt_public',
		array(
			'get_callback' => static function( array $post_data ) use ( $get_thumbnail_id ): string {
				$thumbnail_id = $get_thumbnail_id( $post_data );
				if ( $thumbnail_id <= 0 ) {
					return '';
				}

				$alt = get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true );
				return is_string( $alt ) ? trim( $alt ) : '';
			},
			'schema'       => array(
				'description' => 'Public featured image alt text for headless clients.',
				'type'        => 'string',
				'context'     => array( 'view', 'embed', 'edit' ),
			),
		)
	);

	register_rest_field(
		'post',
		'nmm_featured_image_caption_public',
		array(
			'get_callback' => static function( array $post_data ) use ( $get_thumbnail_id ): string {
				$thumbnail_id = $get_thumbnail_id( $post_data );
				if ( $thumbnail_id <= 0 ) {
					return '';
				}

				$caption = wp_get_attachment_caption( $thumbnail_id );
				return is_string( $caption ) ? trim( $caption ) : '';
			},
			'schema'       => array(
				'description' => 'Public featured image caption for headless clients.',
				'type'        => 'string',
				'context'     => array( 'view', 'embed', 'edit' ),
			),
		)
	);
}
add_action( 'rest_api_init', 'nmm_editorial_fields_register_public_featured_image_fields' );

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
		'NMM: Video a meta',
		'nmm_editorial_fields_render_meta_box',
		'post',
		'normal',
		'default'
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

	echo '<p style="margin:0 0 12px;">Bežne stačí vyplniť zdroje a video URL (ak je potrebné). Ostatné pomocné polia sa dopĺňajú automaticky pri uložení draftu.</p>';
	nmm_editorial_fields_render_quality_checklist( $post );

	foreach ( $definitions as $meta_key => $field ) {
		if ( ( $field['section'] ?? '' ) !== 'primary' ) {
			continue;
		}

		nmm_editorial_fields_render_input( $post, $meta_key, $field );
	}

	echo '<details style="margin-top:12px;border:1px solid #dcdcde;background:#f6f7f7;padding:10px 12px;">';
	echo '<summary style="cursor:pointer;font-weight:600;">' . esc_html( $sections['advanced'] ) . '</summary>';
	echo '<p style="margin:10px 0 0;color:#50575e;"><strong>Bežne netreba vypĺňať.</strong></p>';
	echo '<p style="margin:10px 0 12px;color:#50575e;">Tieto polia sú voliteľné. Ak ich necháš prázdne, systém doplní bezpečné fallbacky bez prepisovania ručných hodnôt.</p>';

	foreach ( $definitions as $meta_key => $field ) {
		if ( ( $field['section'] ?? '' ) !== 'advanced' ) {
			continue;
		}

		nmm_editorial_fields_render_input( $post, $meta_key, $field );
	}

	echo '</details>';
}

/**
 * @param WP_Post $post
 */
function nmm_editorial_fields_render_quality_checklist( $post ) {
	$has_title          = '' !== trim( wp_strip_all_tags( (string) $post->post_title ) );
	$has_content        = '' !== trim( wp_strip_all_tags( (string) $post->post_content ) );
	$has_excerpt        = '' !== trim( (string) $post->post_excerpt );
	$has_category       = has_category( '', $post );
	$has_featured_image = (int) get_post_thumbnail_id( $post->ID ) > 0;
	$video_value        = nmm_editorial_fields_get_meta_value( $post->ID, 'nmm_video_embed' );
	$has_video_url      = '' !== $video_value;

	$checks = array(
		array(
			'id'       => 'title',
			'label'    => 'Titulok',
			'ok'       => $has_title,
			'required' => true,
		),
		array(
			'id'       => 'content',
			'label'    => 'Obsah',
			'ok'       => $has_content,
			'required' => true,
		),
		array(
			'id'       => 'category',
			'label'    => 'Kategória',
			'ok'       => $has_category,
			'required' => true,
		),
		array(
			'id'       => 'excerpt',
			'label'    => 'Perex / excerpt',
			'ok'       => $has_excerpt,
			'required' => false,
		),
		array(
			'id'       => 'featured-image',
			'label'    => 'Hlavný obrázok',
			'ok'       => $has_featured_image,
			'required' => false,
		),
		array(
			'id'       => 'video-url',
			'label'    => 'Video URL (iba ak ide o video článok)',
			'ok'       => $has_video_url,
			'required' => false,
		),
	);

	$required_total = 0;
	$required_ok    = 0;
	$optional_total = 0;
	$optional_ok    = 0;

	foreach ( $checks as $check ) {
		if ( ! empty( $check['required'] ) ) {
			$required_total++;
			if ( ! empty( $check['ok'] ) ) {
				$required_ok++;
			}
		} else {
			$optional_total++;
			if ( ! empty( $check['ok'] ) ) {
				$optional_ok++;
			}
		}
	}

	echo '<div id="nmm-editorial-checklist" style="margin:0 0 14px;border:1px solid #dcdcde;border-radius:6px;background:#fff;padding:12px;">';
	echo '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:8px;">';
	echo '<strong style="font-size:13px;">Rýchly kontrolný semafor</strong>';
	echo '<span id="nmm-editorial-summary" style="font-size:12px;color:#50575e;">Povinné: ' . esc_html( (string) $required_ok ) . '/' . esc_html( (string) $required_total ) . ' · Odporúčané: ' . esc_html( (string) $optional_ok ) . '/' . esc_html( (string) $optional_total ) . '</span>';
	echo '</div>';
	echo '<ul style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px;">';

	foreach ( $checks as $check ) {
		$status_icon  = ! empty( $check['ok'] ) ? '✓' : '•';
		$status_color = ! empty( $check['ok'] ) ? '#0f766e' : ( ! empty( $check['required'] ) ? '#b91c1c' : '#a16207' );
		$weight       = ! empty( $check['required'] ) ? '600' : '500';
		$meta_suffix  = ! empty( $check['required'] ) ? ' (povinné)' : ' (odporúčané)';

		echo '<li data-nmm-check="' . esc_attr( (string) $check['id'] ) . '" data-nmm-required="' . ( ! empty( $check['required'] ) ? '1' : '0' ) . '" style="display:flex;align-items:center;gap:8px;font-size:12px;">';
		echo '<span data-nmm-check-icon="1" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;background:#f6f7f7;color:' . esc_attr( $status_color ) . ';font-weight:700;">' . esc_html( $status_icon ) . '</span>';
		echo '<span data-nmm-check-label="1" style="font-weight:' . esc_attr( $weight ) . ';color:#1d2327;">' . esc_html( (string) $check['label'] . $meta_suffix ) . '</span>';
		echo '</li>';
	}

	echo '</ul>';
	echo '</div>';
}

/**
 * Adds lightweight live refresh for checklist status in Classic and Block editor forms.
 */
function nmm_editorial_fields_enqueue_quality_checklist_script( $hook ) {
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}

	$screen = get_current_screen();
	if ( ! ( $screen instanceof WP_Screen ) || 'post' !== $screen->post_type ) {
		return;
	}
	?>
	<script>
	(function () {
		"use strict";

		function stripHtml(value) {
			const holder = document.createElement("div");
			holder.innerHTML = value || "";
			return (holder.textContent || holder.innerText || "").trim();
		}

		function getEditorContent() {
			if (window.tinymce && window.tinymce.activeEditor && !window.tinymce.activeEditor.isHidden()) {
				return stripHtml(window.tinymce.activeEditor.getContent());
			}
			const textarea = document.getElementById("content");
			return textarea ? stripHtml(textarea.value) : "";
		}

		function getCheckedCategoryLabels() {
			const boxes = document.querySelectorAll("#categorychecklist input[type='checkbox']:checked");
			return Array.from(boxes).map(function (box) {
				const label = box.closest("label");
				return label ? (label.textContent || "").trim() : "";
			});
		}

		function updateChecklist() {
			const wrapper = document.getElementById("nmm-editorial-checklist");
			if (!wrapper) {
				return;
			}

			const titleInput = document.getElementById("title");
			const excerptInput = document.getElementById("excerpt");
			const thumbInput = document.getElementById("_thumbnail_id");
			const videoInput = document.getElementById("nmm_video_embed");
			const categories = getCheckedCategoryLabels();
			const hasVideoCategory = categories.some(function (label) {
				return /video/i.test(label);
			});

			const checks = {
				"title": !!(titleInput && titleInput.value.trim()),
				"content": getEditorContent().length > 0,
				"category": categories.length > 0,
				"excerpt": !!(excerptInput && excerptInput.value.trim()),
				"featured-image": !!(thumbInput && thumbInput.value.trim()),
				"video-url": !hasVideoCategory || !!(videoInput && videoInput.value.trim())
			};

			let requiredTotal = 0;
			let requiredOk = 0;
			let optionalTotal = 0;
			let optionalOk = 0;

			Object.keys(checks).forEach(function (checkId) {
				const row = wrapper.querySelector("[data-nmm-check='" + checkId + "']");
				if (!row) {
					return;
				}

				const isRequired = row.getAttribute("data-nmm-required") === "1";
				const isOk = checks[checkId];
				const icon = row.querySelector("[data-nmm-check-icon='1']");
				const label = row.querySelector("[data-nmm-check-label='1']");

				if (isRequired) {
					requiredTotal += 1;
					if (isOk) {
						requiredOk += 1;
					}
				} else {
					optionalTotal += 1;
					if (isOk) {
						optionalOk += 1;
					}
				}

				if (icon) {
					icon.textContent = isOk ? "✓" : "•";
					icon.style.color = isOk ? "#0f766e" : (isRequired ? "#b91c1c" : "#a16207");
				}

				if (label) {
					label.style.opacity = isOk ? "1" : "0.84";
				}
			});

			const summary = document.getElementById("nmm-editorial-summary");
			if (summary) {
				summary.textContent = "Povinné: " + requiredOk + "/" + requiredTotal + " · Odporúčané: " + optionalOk + "/" + optionalTotal;
			}
		}

		document.addEventListener("input", updateChecklist, true);
		document.addEventListener("change", updateChecklist, true);
		document.addEventListener("tinymce-editor-init", function () {
			setTimeout(updateChecklist, 0);
		});
		window.addEventListener("load", updateChecklist);
		setTimeout(updateChecklist, 120);
	})();
	</script>
	<?php
}
add_action( 'admin_footer', 'nmm_editorial_fields_enqueue_quality_checklist_script' );

/**
 * @param WP_Post               $post
 * @param string                $meta_key
 * @param array<string, mixed>  $field
 */
function nmm_editorial_fields_render_input( $post, $meta_key, $field ) {
	$value            = get_post_meta( $post->ID, $meta_key, true );
	$rows             = isset( $field['rows'] ) ? max( 1, (int) $field['rows'] ) : 3;
	$placeholder      = isset( $field['placeholder'] ) ? (string) $field['placeholder'] : '';
	$placeholder_attr = '' !== $placeholder ? ' placeholder="' . esc_attr( $placeholder ) . '"' : '';

	echo '<div style="margin-bottom:14px;">';
	echo '<label for="' . esc_attr( $meta_key ) . '" style="display:block;font-weight:600;margin-bottom:6px;">' . esc_html( (string) $field['label'] ) . '</label>';

	if ( 'textarea' === $field['type'] ) {
		echo '<textarea id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" rows="' . esc_attr( (string) $rows ) . '" style="width:100%;"' . $placeholder_attr . '>' . esc_textarea( (string) $value ) . '</textarea>';
	} elseif ( 'select' === $field['type'] ) {
		$options = isset( $field['options'] ) && is_array( $field['options'] ) ? $field['options'] : array();
		if (
			isset( $field['options_callback'] ) &&
			is_string( $field['options_callback'] ) &&
			function_exists( $field['options_callback'] )
		) {
			$dynamic_options = call_user_func( $field['options_callback'], (string) $value );
			if ( is_array( $dynamic_options ) ) {
				$options = $dynamic_options;
			}
		}

		echo '<select id="' . esc_attr( $meta_key ) . '" name="' . esc_attr( $meta_key ) . '" style="width:100%;">';
		foreach ( $options as $option_value => $option_label ) {
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

/**
 * Ensures excerpt box is visible by default for new users.
 *
 * @param string[]  $hidden
 * @param WP_Screen $screen
 * @return string[]
 */
function nmm_editorial_fields_show_excerpt_by_default( $hidden, $screen ) {
	if ( ! ( $screen instanceof WP_Screen ) ) {
		return $hidden;
	}

	if ( 'post' !== $screen->id || 'post' !== $screen->base ) {
		return $hidden;
	}

	return array_values( array_diff( $hidden, array( 'postexcerpt' ) ) );
}
add_filter( 'default_hidden_meta_boxes', 'nmm_editorial_fields_show_excerpt_by_default', 10, 2 );

/**
 * Makes sure excerpt support is enabled on post type.
 */
function nmm_editorial_fields_enable_excerpt_support() {
	add_post_type_support( 'post', 'excerpt' );
}
add_action( 'init', 'nmm_editorial_fields_enable_excerpt_support', 20 );

/**
 * Fills computed metadata only when corresponding values are empty.
 *
 * @param int      $post_id
 * @param WP_Post  $post
 * @param bool     $update
 */
function nmm_editorial_fields_apply_fallbacks( $post_id, $post, $update ) {
	unset( $update );

	if ( ! ( $post instanceof WP_Post ) || 'post' !== $post->post_type ) {
		return;
	}

	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( 'auto-draft' === $post->post_status ) {
		return;
	}

	$excerpt = trim( (string) $post->post_excerpt );
	if ( '' === $excerpt ) {
		$generated_excerpt = nmm_editorial_fields_generate_excerpt( $post );
		if ( '' !== $generated_excerpt ) {
			remove_action( 'save_post_post', 'nmm_editorial_fields_apply_fallbacks', 20 );
			wp_update_post(
				array(
					'ID'           => $post_id,
					'post_excerpt' => $generated_excerpt,
				)
			);
			add_action( 'save_post_post', 'nmm_editorial_fields_apply_fallbacks', 20, 3 );
			$excerpt = $generated_excerpt;
		}
	}

	$title = trim( wp_strip_all_tags( (string) $post->post_title ) );
	$description_source = '' !== $excerpt ? $excerpt : nmm_editorial_fields_generate_excerpt( $post );
	$seo_title_fallback = nmm_editorial_fields_limit_text( $title, 60 );
	$seo_desc_fallback  = nmm_editorial_fields_limit_text( $description_source, 160 );
	$og_title_source    = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_seo_title' );
	$og_title_fallback  = '' !== $og_title_source ? $og_title_source : $seo_title_fallback;
	$og_desc_source     = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_seo_description' );
	$og_desc_fallback   = '' !== $og_desc_source ? $og_desc_source : $seo_desc_fallback;
	$reading_time       = nmm_editorial_fields_calculate_reading_time( $post );
	$post_author_name   = get_the_author_meta( 'display_name', (int) $post->post_author );
	$author_fallback    = is_string( $post_author_name ) ? trim( $post_author_name ) : '';

	nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_author_name', $author_fallback );
	nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_seo_title', $seo_title_fallback );
	nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_seo_description', $seo_desc_fallback );
	nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_og_title', $og_title_fallback );
	nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_og_description', $og_desc_fallback );
	nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_estimated_reading_time', $reading_time );
}
add_action( 'save_post_post', 'nmm_editorial_fields_apply_fallbacks', 20, 3 );

/**
 * Applies article type fallback when no explicit value is set.
 *
 * @param int     $post_id
 * @param WP_Post $post
 * @param bool    $allow_news_upgrade Whether "news" can be replaced by a more specific auto-detected type.
 */
function nmm_editorial_fields_apply_article_type_fallback_internal( $post_id, $post, $allow_news_upgrade = false ) {
	if ( ! ( $post instanceof WP_Post ) || 'post' !== $post->post_type ) {
		return;
	}

	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( 'auto-draft' === $post->post_status ) {
		return;
	}

	$current_article_type = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_article_type' );
	$article_type = nmm_editorial_fields_detect_article_type( $post_id );

	if ( '' === $current_article_type ) {
		nmm_editorial_fields_update_meta_if_empty( $post_id, 'nmm_article_type', $article_type );
		return;
	}

	if ( $allow_news_upgrade && 'news' === $current_article_type && 'news' !== $article_type ) {
		update_post_meta( $post_id, 'nmm_article_type', nmm_editorial_fields_sanitize( $article_type ) );
	}
}

/**
 * Handles classic/non-REST saves after post persistence.
 *
 * @param int     $post_id
 * @param WP_Post $post
 * @param bool    $update
 */
function nmm_editorial_fields_apply_article_type_fallback( $post_id, $post, $update ) {
	unset( $update );
	nmm_editorial_fields_apply_article_type_fallback_internal( $post_id, $post, false );
}
add_action( 'wp_after_insert_post', 'nmm_editorial_fields_apply_article_type_fallback', 20, 3 );

/**
 * Handles REST/Block/API saves after all REST fields (including meta) are stored.
 * Keeps manually submitted nmm_article_type untouched.
 *
 * @param WP_Post         $post
 * @param WP_REST_Request $request
 * @param bool            $creating
 */
function nmm_editorial_fields_apply_article_type_fallback_rest( $post, $request, $creating ) {
	unset( $creating );

	if ( ! ( $post instanceof WP_Post ) || ! ( $request instanceof WP_REST_Request ) ) {
		return;
	}

	$meta = $request->get_param( 'meta' );
	if ( is_array( $meta ) && array_key_exists( 'nmm_article_type', $meta ) ) {
		$submitted_article_type = is_string( $meta['nmm_article_type'] ) ? trim( $meta['nmm_article_type'] ) : '';
		if ( '' !== $submitted_article_type ) {
			return;
		}
	}

	nmm_editorial_fields_apply_article_type_fallback_internal( $post->ID, $post, true );
}
add_action( 'rest_after_insert_post', 'nmm_editorial_fields_apply_article_type_fallback_rest', 20, 3 );

/**
 * @param WP_Post $post
 * @return string
 */
function nmm_editorial_fields_generate_excerpt( $post ) {
	$content = strip_shortcodes( (string) $post->post_content );
	$content = preg_replace( '#</(p|div|h[1-6]|li|blockquote|tr)>#i', '$0 ', $content ) ?? $content;
	$text    = wp_strip_all_tags( $content );
	$text = trim( preg_replace( '/\s+/', ' ', $text ) ?? '' );

	if ( '' === $text ) {
		return '';
	}

	return wp_trim_words( $text, 34, '...' );
}

/**
 * @param int    $post_id
 * @param string $meta_key
 * @param string $value
 */
function nmm_editorial_fields_update_meta_if_empty( $post_id, $meta_key, $value ) {
	$value = trim( $value );
	if ( '' === $value ) {
		return;
	}

	if ( '' !== nmm_editorial_fields_get_meta_value( $post_id, $meta_key ) ) {
		return;
	}

	update_post_meta( $post_id, $meta_key, nmm_editorial_fields_sanitize( $value ) );
}

/**
 * @param int    $post_id
 * @param string $meta_key
 * @return string
 */
function nmm_editorial_fields_get_meta_value( $post_id, $meta_key ) {
	$value = get_post_meta( $post_id, $meta_key, true );
	return is_string( $value ) ? trim( $value ) : '';
}

/**
 * @param string $value
 * @param int    $length
 * @return string
 */
function nmm_editorial_fields_limit_text( $value, $length ) {
	$value = trim( wp_strip_all_tags( $value ) );
	if ( '' === $value ) {
		return '';
	}

	return trim( wp_html_excerpt( $value, $length, '' ) );
}

/**
 * @param WP_Post $post
 * @return string
 */
function nmm_editorial_fields_calculate_reading_time( $post ) {
	$content    = wp_strip_all_tags( strip_shortcodes( (string) $post->post_content ) );
	$word_count = str_word_count( $content );
	$minutes    = max( 1, (int) ceil( $word_count / 220 ) );

	return sprintf( '%d min čítania', $minutes );
}

/**
 * @param int $post_id
 * @return string
 */
function nmm_editorial_fields_detect_article_type( $post_id ) {
	$video_value = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_video_embed' );
	if ( '' !== $video_value ) {
		return 'video';
	}

	$categories = get_the_category( $post_id );
	if ( empty( $categories ) || ! is_array( $categories ) ) {
		return 'news';
	}

	$slugs = array();
	foreach ( $categories as $category ) {
		if ( $category instanceof WP_Term ) {
			$slugs[] = sanitize_title( $category->slug );
		}
	}

	if ( in_array( 'video', $slugs, true ) ) {
		return 'video';
	}

	if ( in_array( 'komentare', $slugs, true ) ) {
		return 'commentary';
	}

	if ( in_array( 'zaujimave', $slugs, true ) ) {
		return 'feature';
	}

	$analysis_categories = array( 'domov', 'zahranicie', 'politika', 'spolocnost', 'diskusia', 'ai', 'tech', 'veda' );
	foreach ( $analysis_categories as $analysis_slug ) {
		if ( in_array( $analysis_slug, $slugs, true ) ) {
			return 'analysis';
		}
	}

	return 'news';
}

/**
 * @param string $raw_sources
 * @return array<int, array{name:string,url:string}>
 */
function nmm_editorial_fields_parse_sources( $raw_sources ) {
	if ( ! is_string( $raw_sources ) || '' === trim( $raw_sources ) ) {
		return array();
	}

	$items = array();
	$lines = preg_split( '/\r\n|\r|\n/', $raw_sources ) ?: array();

	foreach ( $lines as $line ) {
		$line = trim( (string) $line );
		if ( '' === $line ) {
			continue;
		}

		$parts = array_map( 'trim', explode( '|', $line, 2 ) );
		$name  = isset( $parts[0] ) ? wp_strip_all_tags( (string) $parts[0] ) : '';
		$url   = isset( $parts[1] ) ? trim( (string) $parts[1] ) : '';

		if ( '' === $name ) {
			continue;
		}

		if ( '' !== $url && ! wp_http_validate_url( $url ) ) {
			$url = '';
		}

		$items[] = array(
			'name' => $name,
			'url'  => $url,
		);
	}

	return $items;
}

/**
 * Syncs first source from nmm_sources to legacy single-source fields when they are empty.
 * This keeps old integrations working while editor can maintain multiple sources.
 *
 * @param int      $post_id
 * @param WP_Post  $post
 * @param bool     $update
 */
function nmm_editorial_fields_sync_legacy_source_meta( $post_id, $post, $update ) {
	unset( $update );

	if ( ! ( $post instanceof WP_Post ) || 'post' !== $post->post_type ) {
		return;
	}

	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	$sources_raw = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_sources' );
	$sources     = nmm_editorial_fields_parse_sources( $sources_raw );

	if ( empty( $sources ) ) {
		return;
	}

	$first_source = $sources[0];
	$current_name = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_source_name' );
	$current_url  = nmm_editorial_fields_get_meta_value( $post_id, 'nmm_source_url' );

	if ( '' === $current_name && ! empty( $first_source['name'] ) ) {
		update_post_meta( $post_id, 'nmm_source_name', nmm_editorial_fields_sanitize( $first_source['name'] ) );
	}

	if ( '' === $current_url && ! empty( $first_source['url'] ) ) {
		update_post_meta( $post_id, 'nmm_source_url', nmm_editorial_fields_sanitize( $first_source['url'] ) );
	}
}
add_action( 'save_post_post', 'nmm_editorial_fields_sync_legacy_source_meta', 25, 3 );


