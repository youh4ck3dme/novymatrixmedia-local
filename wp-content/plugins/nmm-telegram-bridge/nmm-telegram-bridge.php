<?php
/**
 * Plugin Name: NMM Telegram Bridge
 * Description: Receives authenticated Telegram payloads and creates or updates WordPress posts with NMM editorial meta.
 * Version: 0.2.0
 * Author: Novy Matrix Media
 */

if (!defined('ABSPATH')) {
    exit;
}

const NMM_TELEGRAM_BRIDGE_ROUTE_NAMESPACE = 'nmm-telegram-bridge/v1';

function nmm_telegram_bridge_is_enabled() {
    if (!defined('NMM_TELEGRAM_BRIDGE_ENABLED')) {
        return false;
    }

    return (bool) NMM_TELEGRAM_BRIDGE_ENABLED;
}

function nmm_telegram_bridge_register_meta() {
    $string_meta_keys = array(
        'nmm_telegram_message_id',
        'nmm_telegram_chat_id',
        'nmm_telegram_chat_title',
        'nmm_telegram_author',
        'nmm_telegram_permalink',
        'nmm_ingest_source',
    );

    foreach ($string_meta_keys as $meta_key) {
        register_post_meta(
            'post',
            $meta_key,
            array(
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'auth_callback' => '__return_true',
            )
        );
    }
}
add_action('init', 'nmm_telegram_bridge_register_meta');

function nmm_telegram_bridge_register_routes() {
    if (!nmm_telegram_bridge_is_enabled()) {
        return;
    }

    register_rest_route(
        NMM_TELEGRAM_BRIDGE_ROUTE_NAMESPACE,
        '/ingest',
        array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nmm_telegram_bridge_handle_ingest',
            'permission_callback' => 'nmm_telegram_bridge_authorize_request',
        )
    );

    register_rest_route(
        NMM_TELEGRAM_BRIDGE_ROUTE_NAMESPACE,
        '/webhook',
        array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nmm_telegram_bridge_handle_webhook',
            'permission_callback' => 'nmm_telegram_bridge_authorize_webhook_request',
        )
    );
}
add_action('rest_api_init', 'nmm_telegram_bridge_register_routes');

function nmm_telegram_bridge_add_admin_column($columns) {
    $columns['nmm_ingest_source'] = __('Ingest', 'nmm-telegram-bridge');

    return $columns;
}
add_filter('manage_post_posts_columns', 'nmm_telegram_bridge_add_admin_column');

function nmm_telegram_bridge_render_admin_column($column, $post_id) {
    if ($column !== 'nmm_ingest_source') {
        return;
    }

    $source = get_post_meta($post_id, 'nmm_ingest_source', true);
    if ($source === '') {
        echo '<span style="color:#94a3b8;">—</span>';
        return;
    }

    $label = $source === 'telegram' ? 'Telegram' : ucfirst($source);
    echo '<span style="display:inline-block;padding:4px 8px;border:1px solid #0891b2;border-radius:999px;color:#0f766e;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">' . esc_html($label) . '</span>';
}
add_action('manage_post_posts_custom_column', 'nmm_telegram_bridge_render_admin_column', 10, 2);

function nmm_telegram_bridge_add_admin_filter() {
    global $typenow;

    if ($typenow !== 'post') {
        return;
    }

    $selected = isset($_GET['nmm_ingest_source']) ? sanitize_text_field(wp_unslash($_GET['nmm_ingest_source'])) : '';

    echo '<select name="nmm_ingest_source">';
    echo '<option value="">' . esc_html__('Všetky ingest zdroje', 'nmm-telegram-bridge') . '</option>';
    echo '<option value="telegram" ' . selected($selected, 'telegram', false) . '>' . esc_html__('Len Telegram ingest', 'nmm-telegram-bridge') . '</option>';
    echo '<option value="manual" ' . selected($selected, 'manual', false) . '>' . esc_html__('Len manual ingest', 'nmm-telegram-bridge') . '</option>';
    echo '</select>';
}
add_action('restrict_manage_posts', 'nmm_telegram_bridge_add_admin_filter');

function nmm_telegram_bridge_filter_admin_query($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }

    $post_type = $query->get('post_type');
    if ($post_type && $post_type !== 'post') {
        return;
    }

    $source = isset($_GET['nmm_ingest_source']) ? sanitize_text_field(wp_unslash($_GET['nmm_ingest_source'])) : '';
    if ($source === '') {
        return;
    }

    $query->set('meta_query', array(
        array(
            'key' => 'nmm_ingest_source',
            'value' => $source,
        ),
    ));
}
add_action('pre_get_posts', 'nmm_telegram_bridge_filter_admin_query');

function nmm_telegram_bridge_add_side_meta_box() {
    add_meta_box(
        'nmm-telegram-bridge-status',
        __('Telegram Bridge', 'nmm-telegram-bridge'),
        'nmm_telegram_bridge_render_side_meta_box',
        'post',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'nmm_telegram_bridge_add_side_meta_box');

function nmm_telegram_bridge_render_side_meta_box($post) {
    $source = get_post_meta($post->ID, 'nmm_ingest_source', true);
    $readiness = get_post_meta($post->ID, 'nmm_editorial_readiness', true);
    $chat_title = get_post_meta($post->ID, 'nmm_telegram_chat_title', true);
    $author = get_post_meta($post->ID, 'nmm_telegram_author', true);
    $message_id = get_post_meta($post->ID, 'nmm_telegram_message_id', true);
    $permalink = get_post_meta($post->ID, 'nmm_telegram_permalink', true);

    echo '<div style="display:grid;gap:10px;">';
    echo '<p style="margin:0;color:#475569;line-height:1.5;">' . esc_html__('Quick editorial context for posts created by bridge ingest.', 'nmm-telegram-bridge') . '</p>';

    if ($source === '') {
        echo '<p style="margin:0;color:#94a3b8;">' . esc_html__('This post was not created by the ingest bridge.', 'nmm-telegram-bridge') . '</p>';
        echo '</div>';
        return;
    }

    $rows = array(
        __('Ingest source', 'nmm-telegram-bridge') => $source,
        __('Editorial readiness', 'nmm-telegram-bridge') => $readiness,
        __('Telegram channel', 'nmm-telegram-bridge') => $chat_title,
        __('Telegram author', 'nmm-telegram-bridge') => $author,
        __('Message ID', 'nmm-telegram-bridge') => $message_id,
    );

    foreach ($rows as $label => $value) {
        if ($value === '') {
            continue;
        }

        echo '<div>';
        echo '<strong style="display:block;margin-bottom:3px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#0f766e;">' . esc_html($label) . '</strong>';
        echo '<span style="display:block;color:#0f172a;line-height:1.5;">' . esc_html($value) . '</span>';
        echo '</div>';
    }

    if ($permalink !== '') {
        echo '<a href="' . esc_url($permalink) . '" target="_blank" rel="noreferrer noopener" style="display:inline-flex;justify-content:center;padding:10px 12px;border:1px solid #0891b2;border-radius:999px;text-decoration:none;color:#0f766e;font-weight:600;">' . esc_html__('Open Telegram origin', 'nmm-telegram-bridge') . '</a>';
    }

    echo '</div>';
}

function nmm_telegram_bridge_authorize_request(WP_REST_Request $request) {
    $expected_token = defined('NMM_TELEGRAM_BRIDGE_TOKEN') ? trim((string) NMM_TELEGRAM_BRIDGE_TOKEN) : '';

    if ($expected_token === '') {
        return new WP_Error(
            'nmm_telegram_bridge_missing_token',
            'NMM_TELEGRAM_BRIDGE_TOKEN is not configured.',
            array('status' => 500)
        );
    }

    $provided_token = nmm_telegram_bridge_get_request_token($request);

    if ($provided_token === '' || !hash_equals($expected_token, $provided_token)) {
        return new WP_Error(
            'nmm_telegram_bridge_forbidden',
            'Invalid bridge token.',
            array('status' => 403)
        );
    }

    return true;
}

function nmm_telegram_bridge_get_request_token(WP_REST_Request $request) {
    $header_token = trim((string) $request->get_header('x-nmm-bridge-token'));
    if ($header_token !== '') {
        return $header_token;
    }

    $auth_header = trim((string) $request->get_header('authorization'));
    if (stripos($auth_header, 'Bearer ') === 0) {
        return trim(substr($auth_header, 7));
    }

    $body_token = $request->get_param('token');

    return is_string($body_token) ? trim($body_token) : '';
}

function nmm_telegram_bridge_authorize_webhook_request(WP_REST_Request $request) {
    $expected_secret = defined('NMM_TELEGRAM_WEBHOOK_SECRET') ? trim((string) NMM_TELEGRAM_WEBHOOK_SECRET) : '';
    if ($expected_secret === '') {
        return new WP_Error(
            'nmm_telegram_bridge_missing_webhook_secret',
            'NMM_TELEGRAM_WEBHOOK_SECRET is not configured.',
            array('status' => 500)
        );
    }

    $provided_secret = trim((string) $request->get_header('x-telegram-bot-api-secret-token'));
    if ($provided_secret === '') {
        $provided_secret = isset($_GET['secret']) ? sanitize_text_field(wp_unslash($_GET['secret'])) : '';
    }

    if ($provided_secret === '' || !hash_equals($expected_secret, $provided_secret)) {
        return new WP_Error(
            'nmm_telegram_bridge_webhook_forbidden',
            'Invalid Telegram webhook secret.',
            array('status' => 403)
        );
    }

    return true;
}

function nmm_telegram_bridge_handle_webhook(WP_REST_Request $request) {
    $update = $request->get_json_params();
    if (!is_array($update) || empty($update)) {
        return new WP_Error(
            'nmm_telegram_bridge_invalid_webhook_payload',
            'Webhook payload must be a valid Telegram update JSON object.',
            array('status' => 400)
        );
    }

    $is_edited_update = false;
    $message = array();

    if (!empty($update['channel_post']) && is_array($update['channel_post'])) {
        $message = $update['channel_post'];
    } elseif (!empty($update['edited_channel_post']) && is_array($update['edited_channel_post'])) {
        $message = $update['edited_channel_post'];
        $is_edited_update = true;
    } elseif (!empty($update['message']) && is_array($update['message'])) {
        $message = $update['message'];
    } elseif (!empty($update['edited_message']) && is_array($update['edited_message'])) {
        $message = $update['edited_message'];
        $is_edited_update = true;
    } else {
        return rest_ensure_response(
            array(
                'success' => true,
                'ignored' => true,
                'reason' => 'unsupported_update_type',
            )
        );
    }

    $payload = nmm_telegram_bridge_normalize_webhook_payload($message);
    if (is_wp_error($payload)) {
        return $payload;
    }

    $result = nmm_telegram_bridge_upsert_post($payload, $is_edited_update ? 'upsert' : 'dedupe');
    if (is_wp_error($result)) {
        return $result;
    }

    $result['source'] = 'telegram-webhook';
    $result['edited_update'] = $is_edited_update;
    return rest_ensure_response($result);
}

function nmm_telegram_bridge_handle_ingest(WP_REST_Request $request) {
    $payload = $request->get_json_params();
    if (!is_array($payload) || empty($payload)) {
        $payload = $request->get_params();
    }

    if (!is_array($payload) || empty($payload)) {
        return new WP_Error(
            'nmm_telegram_bridge_invalid_payload',
            'Request payload is empty.',
            array('status' => 400)
        );
    }

    $result = nmm_telegram_bridge_upsert_post($payload, 'upsert');
    if (is_wp_error($result)) {
        return $result;
    }

    $result['source'] = 'manual-bridge';
    return rest_ensure_response($result);
}

function nmm_telegram_bridge_upsert_post(array $payload, $mode = 'upsert') {
    $title = isset($payload['title']) ? sanitize_text_field(wp_unslash($payload['title'])) : '';
    $content = isset($payload['content']) ? wp_kses_post(wp_unslash($payload['content'])) : '';

    if ($title === '' || $content === '') {
        return new WP_Error(
            'nmm_telegram_bridge_invalid_payload',
            'Both title and content are required.',
            array('status' => 400)
        );
    }

    $existing_post_id = nmm_telegram_bridge_find_existing_post_id($payload);

    if ($existing_post_id > 0 && $mode === 'dedupe') {
        return array(
            'success' => true,
            'postId' => $existing_post_id,
            'status' => get_post_status($existing_post_id),
            'editLink' => get_edit_post_link($existing_post_id, 'raw'),
            'permalink' => get_permalink($existing_post_id),
            'action' => 'deduped',
        );
    }

    $postarr = array(
        'post_type' => 'post',
        'post_status' => nmm_telegram_bridge_get_post_status($payload),
        'post_title' => $title,
        'post_content' => $content,
        'post_excerpt' => isset($payload['excerpt']) ? sanitize_textarea_field(wp_unslash($payload['excerpt'])) : '',
    );

    if ($existing_post_id > 0) {
        $postarr['ID'] = $existing_post_id;
        $has_explicit_status = !empty($payload['status']) && is_string($payload['status']);
        if (!$has_explicit_status) {
            $existing_status = get_post_status($existing_post_id);
            if (is_string($existing_status) && $existing_status !== '') {
                $postarr['post_status'] = $existing_status;
            }
        }
    }

    if (!empty($payload['slug']) && is_string($payload['slug'])) {
        $postarr['post_name'] = sanitize_title($payload['slug']);
    }

    if (!empty($payload['published_at']) && is_string($payload['published_at'])) {
        $timestamp = strtotime($payload['published_at']);
        if (is_int($timestamp) && $timestamp > 0) {
            $postarr['post_date_gmt'] = gmdate('Y-m-d H:i:s', $timestamp);
            $postarr['post_date'] = get_date_from_gmt($postarr['post_date_gmt']);
        }
    }

    $post_id = wp_insert_post(wp_slash($postarr), true);
    if (is_wp_error($post_id)) {
        return $post_id;
    }

    nmm_telegram_bridge_assign_categories($post_id, $payload);
    nmm_telegram_bridge_assign_tags($post_id, $payload);
    nmm_telegram_bridge_store_editorial_meta($post_id, $payload);
    nmm_telegram_bridge_store_source_meta($post_id, $payload);

    if (!empty($payload['featured_image_url']) && is_string($payload['featured_image_url'])) {
        $attachment_id = nmm_telegram_bridge_attach_remote_image($post_id, $payload['featured_image_url']);
        if (!is_wp_error($attachment_id) && $attachment_id) {
            set_post_thumbnail($post_id, $attachment_id);
        }
    }

    return array(
        'success' => true,
        'postId' => $post_id,
        'status' => get_post_status($post_id),
        'editLink' => get_edit_post_link($post_id, 'raw'),
        'permalink' => get_permalink($post_id),
        'action' => $existing_post_id > 0 ? 'updated' : 'created',
    );
}

function nmm_telegram_bridge_find_existing_post_id(array $payload) {
    if (empty($payload['telegram']) || !is_array($payload['telegram'])) {
        return 0;
    }

    $telegram = $payload['telegram'];
    $message_id = isset($telegram['message_id']) ? sanitize_text_field((string) $telegram['message_id']) : '';
    $chat_id = isset($telegram['chat_id']) ? sanitize_text_field((string) $telegram['chat_id']) : '';

    if ($message_id === '' || $chat_id === '') {
        return 0;
    }

    $existing_ids = get_posts(
        array(
            'post_type' => 'post',
            'post_status' => array('publish', 'pending', 'draft', 'future', 'private'),
            'posts_per_page' => 1,
            'fields' => 'ids',
            'meta_query' => array(
                array(
                    'key' => 'nmm_telegram_message_id',
                    'value' => $message_id,
                ),
                array(
                    'key' => 'nmm_telegram_chat_id',
                    'value' => $chat_id,
                ),
            ),
        )
    );

    if (empty($existing_ids)) {
        return 0;
    }

    return (int) $existing_ids[0];
}

function nmm_telegram_bridge_normalize_webhook_payload(array $message) {
    $chat = isset($message['chat']) && is_array($message['chat']) ? $message['chat'] : array();
    $chat_id = isset($chat['id']) ? sanitize_text_field((string) $chat['id']) : '';
    $chat_title = isset($chat['title']) ? sanitize_text_field((string) $chat['title']) : 'Telegram';
    $chat_username = isset($chat['username']) ? sanitize_key((string) $chat['username']) : '';

    if (!nmm_telegram_bridge_is_source_chat_allowed($chat_id, $chat_username)) {
        return new WP_Error(
            'nmm_telegram_bridge_source_not_allowed',
            'Telegram source chat is not allowed for ingestion.',
            array('status' => 403)
        );
    }

    $message_id = isset($message['message_id']) ? sanitize_text_field((string) $message['message_id']) : '';
    if ($message_id === '') {
        return new WP_Error(
            'nmm_telegram_bridge_invalid_message',
            'Telegram message_id is missing.',
            array('status' => 422)
        );
    }

    $raw_text = '';
    if (!empty($message['text']) && is_string($message['text'])) {
        $raw_text = $message['text'];
    } elseif (!empty($message['caption']) && is_string($message['caption'])) {
        $raw_text = $message['caption'];
    }

    $raw_text = trim((string) $raw_text);
    if ($raw_text === '') {
        return new WP_Error(
            'nmm_telegram_bridge_empty_message',
            'Telegram message does not contain text or caption.',
            array('status' => 422)
        );
    }

    $lines = preg_split('/\r\n|\r|\n/', $raw_text);
    $clean_lines = array();
    foreach ((array) $lines as $line) {
        $normalized_line = trim((string) $line);
        if ($normalized_line !== '') {
            $clean_lines[] = $normalized_line;
        }
    }

    $first_line = !empty($clean_lines) ? $clean_lines[0] : $raw_text;
    $title = sanitize_text_field(wp_html_excerpt($first_line, 140, '…'));
    if ($title === '') {
        $title = 'Telegram post';
    }

    $paragraphs = array();
    foreach ($clean_lines as $line) {
        $paragraphs[] = '<p>' . esc_html($line) . '</p>';
    }

    $content = !empty($paragraphs) ? implode("\n", $paragraphs) : '<p>' . esc_html($raw_text) . '</p>';
    $tags_and_categories = nmm_telegram_bridge_extract_message_tags($raw_text);
    $source_url = nmm_telegram_bridge_build_webhook_permalink($chat_username, $message_id);

    $published_at = '';
    if (!empty($message['date']) && is_numeric($message['date'])) {
        $published_at = gmdate('c', (int) $message['date']);
    }

    return array(
        'title' => $title,
        'excerpt' => sanitize_text_field(wp_html_excerpt($raw_text, 220, '…')),
        'content' => $content,
        'status' => defined('NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS') ? (string) NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS : 'draft',
        'published_at' => $published_at,
        'categories' => $tags_and_categories['categories'],
        'tags' => $tags_and_categories['tags'],
        'source_name' => $chat_title,
        'source_url' => $source_url,
        'author_name' => !empty($message['author_signature']) ? sanitize_text_field((string) $message['author_signature']) : 'Telegram',
        'highlight_badge' => 'Telegram',
        'telegram' => array(
            'message_id' => $message_id,
            'chat_id' => $chat_id,
            'chat_title' => $chat_title,
            'author' => !empty($message['author_signature']) ? sanitize_text_field((string) $message['author_signature']) : '',
            'permalink' => $source_url,
        ),
    );
}

function nmm_telegram_bridge_is_source_chat_allowed($chat_id, $chat_username) {
    $configured = defined('NMM_TELEGRAM_SOURCE_CHAT') ? trim((string) NMM_TELEGRAM_SOURCE_CHAT) : '';
    if ($configured === '') {
        return true;
    }

    $normalized_username = sanitize_key(ltrim((string) $chat_username, '@'));
    $normalized_chat_id = trim((string) $chat_id);
    $allowed_values = array_filter(array_map('trim', explode(',', $configured)));

    foreach ($allowed_values as $allowed_value) {
        $normalized_allowed = trim((string) $allowed_value);
        if ($normalized_allowed === '') {
            continue;
        }

        if ($normalized_allowed[0] === '@') {
            if ($normalized_username !== '' && sanitize_key(ltrim($normalized_allowed, '@')) === $normalized_username) {
                return true;
            }
            continue;
        }

        if ($normalized_chat_id !== '' && $normalized_allowed === $normalized_chat_id) {
            return true;
        }
    }

    return false;
}

function nmm_telegram_bridge_extract_message_tags($text) {
    $result = array(
        'tags' => array(),
        'categories' => array(),
    );

    if (!is_string($text) || trim($text) === '') {
        return $result;
    }

    preg_match_all('/#([\p{L}\p{N}_-]+)/u', $text, $matches);
    if (empty($matches[1]) || !is_array($matches[1])) {
        return $result;
    }

    $known_categories = array(
        'domov' => 'domov',
        'zdomova' => 'domov',
        'z-domova' => 'domov',
        'zahranicie' => 'zahranicie',
        'komentare' => 'komentare',
        'zaujimave' => 'zaujimave',
        'video' => 'video',
    );

    $tag_names = array();
    $category_slugs = array();

    foreach ($matches[1] as $raw_tag) {
        $tag_name = sanitize_text_field((string) $raw_tag);
        if ($tag_name === '') {
            continue;
        }

        $tag_names[] = $tag_name;

        $tag_slug = sanitize_title($tag_name);
        if ($tag_slug !== '' && isset($known_categories[$tag_slug])) {
            $category_slugs[] = $known_categories[$tag_slug];
        }
    }

    $tag_names = array_values(array_unique($tag_names));
    $category_slugs = array_values(array_unique($category_slugs));

    $result['tags'] = $tag_names;
    $result['categories'] = array_map(
        function ($slug) {
            return array(
                'slug' => $slug,
                'name' => ucwords(str_replace('-', ' ', $slug)),
            );
        },
        $category_slugs
    );

    return $result;
}

function nmm_telegram_bridge_build_webhook_permalink($chat_username, $message_id) {
    $username = sanitize_key(ltrim((string) $chat_username, '@'));
    $message = sanitize_text_field((string) $message_id);

    if ($username === '' || $message === '') {
        return '';
    }

    return 'https://t.me/' . rawurlencode($username) . '/' . rawurlencode($message);
}

function nmm_telegram_bridge_get_post_status(array $payload) {
    if (!empty($payload['status']) && is_string($payload['status'])) {
        $requested_status = sanitize_key($payload['status']);
        if (in_array($requested_status, array('draft', 'pending', 'publish'), true)) {
            return $requested_status;
        }
    }

    if (defined('NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS')) {
        $configured_status = sanitize_key((string) NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS);
        if (in_array($configured_status, array('draft', 'pending', 'publish'), true)) {
            return $configured_status;
        }
    }

    return 'draft';
}

function nmm_telegram_bridge_assign_categories($post_id, array $payload) {
    $categories = isset($payload['categories']) && is_array($payload['categories']) ? $payload['categories'] : array();
    if (empty($categories)) {
        return;
    }

    $term_ids = array();

    foreach ($categories as $category) {
        $normalized = nmm_telegram_bridge_normalize_term_input($category, 'category');
        if (!$normalized) {
            continue;
        }

        $term = term_exists($normalized['slug'], 'category');
        if (!$term) {
            $term = wp_insert_term($normalized['name'], 'category', array('slug' => $normalized['slug']));
        }

        if (is_array($term) && !empty($term['term_id'])) {
            $term_ids[] = (int) $term['term_id'];
        } elseif (is_object($term) && !empty($term->term_id)) {
            $term_ids[] = (int) $term->term_id;
        } elseif (is_numeric($term)) {
            $term_ids[] = (int) $term;
        }
    }

    if (!empty($term_ids)) {
        wp_set_post_terms($post_id, array_values(array_unique($term_ids)), 'category', false);
    }
}

function nmm_telegram_bridge_assign_tags($post_id, array $payload) {
    $tags = isset($payload['tags']) && is_array($payload['tags']) ? $payload['tags'] : array();
    if (empty($tags)) {
        return;
    }

    $tag_names = array();

    foreach ($tags as $tag) {
        $normalized = nmm_telegram_bridge_normalize_term_input($tag, 'post_tag');
        if ($normalized) {
            $tag_names[] = $normalized['name'];
        }
    }

    if (!empty($tag_names)) {
        wp_set_post_terms($post_id, array_values(array_unique($tag_names)), 'post_tag', false);
    }
}

function nmm_telegram_bridge_normalize_term_input($value, $taxonomy) {
    if (is_string($value)) {
        $name = sanitize_text_field(wp_unslash($value));
        if ($name === '') {
            return null;
        }

        return array(
            'name' => $name,
            'slug' => sanitize_title($name),
        );
    }

    if (!is_array($value)) {
        return null;
    }

    $name = isset($value['name']) ? sanitize_text_field(wp_unslash($value['name'])) : '';
    $slug = isset($value['slug']) ? sanitize_title($value['slug']) : '';

    if ($name === '' && $slug === '') {
        return null;
    }

    if ($name === '' && $slug !== '') {
        $term = get_term_by('slug', $slug, $taxonomy);
        $name = $term && !is_wp_error($term) ? $term->name : $slug;
    }

    if ($slug === '') {
        $slug = sanitize_title($name);
    }

    return array(
        'name' => $name,
        'slug' => $slug,
    );
}

function nmm_telegram_bridge_store_editorial_meta($post_id, array $payload) {
    $meta_map = array(
        'subtitle' => 'nmm_subtitle',
        'author_name' => 'nmm_author_name',
        'editorial_readiness' => 'nmm_editorial_readiness',
        'source_name' => 'nmm_source_name',
        'source_url' => 'nmm_source_url',
        'featured_image_alt' => 'nmm_featured_image_alt',
        'featured_image_caption' => 'nmm_featured_image_caption',
        'article_type' => 'nmm_article_type',
        'highlight_badge' => 'nmm_highlight_badge',
        'estimated_reading_time' => 'nmm_estimated_reading_time',
        'fact_box' => 'nmm_fact_box',
        'quote_block' => 'nmm_quote_block',
        'seo_title' => 'nmm_seo_title',
        'seo_description' => 'nmm_seo_description',
        'og_title' => 'nmm_og_title',
        'og_description' => 'nmm_og_description',
        'og_image' => 'nmm_og_image',
        'video_embed' => 'nmm_video_embed',
    );

    foreach ($meta_map as $payload_key => $meta_key) {
        if (!array_key_exists($payload_key, $payload)) {
            continue;
        }

        $value = is_scalar($payload[$payload_key]) ? trim((string) wp_unslash($payload[$payload_key])) : '';
        if ($value === '') {
            continue;
        }

        update_post_meta($post_id, $meta_key, $value);
    }

    $readiness = nmm_telegram_bridge_get_editorial_readiness($payload, get_post_status($post_id));
    if ($readiness !== '') {
        update_post_meta($post_id, 'nmm_editorial_readiness', $readiness);
    }

    if (!empty($payload['gallery']) && is_array($payload['gallery'])) {
        $gallery_items = array();

        foreach ($payload['gallery'] as $item) {
            if (!is_array($item) || empty($item['url'])) {
                continue;
            }

            $url = esc_url_raw($item['url']);
            if ($url === '') {
                continue;
            }

            $line = $url;
            if (!empty($item['caption']) && is_string($item['caption'])) {
                $line .= ' | ' . sanitize_text_field(wp_unslash($item['caption']));
            }

            if (!empty($item['alt']) && is_string($item['alt'])) {
                $line .= ' | ' . sanitize_text_field(wp_unslash($item['alt']));
            }

            $gallery_items[] = $line;
        }

        if (!empty($gallery_items)) {
            update_post_meta($post_id, 'nmm_gallery', implode("\n", $gallery_items));
        }
    }

    if (!empty($payload['related_post_ids']) && is_array($payload['related_post_ids'])) {
        $related_ids = array_filter(array_map('absint', $payload['related_post_ids']));
        if (!empty($related_ids)) {
            update_post_meta($post_id, 'nmm_related_posts', implode(',', $related_ids));
        }
    }
}

function nmm_telegram_bridge_store_source_meta($post_id, array $payload) {
    if (empty($payload['telegram'])) {
        return;
    }

    $telegram = is_array($payload['telegram']) ? $payload['telegram'] : array();

    $source_meta = array(
        'nmm_telegram_message_id' => isset($telegram['message_id']) ? sanitize_text_field((string) $telegram['message_id']) : '',
        'nmm_telegram_chat_id' => isset($telegram['chat_id']) ? sanitize_text_field((string) $telegram['chat_id']) : '',
        'nmm_telegram_chat_title' => isset($telegram['chat_title']) ? sanitize_text_field((string) $telegram['chat_title']) : '',
        'nmm_telegram_author' => isset($telegram['author']) ? sanitize_text_field((string) $telegram['author']) : '',
        'nmm_telegram_permalink' => isset($telegram['permalink']) ? esc_url_raw((string) $telegram['permalink']) : '',
        'nmm_ingest_source' => 'telegram',
    );

    foreach ($source_meta as $meta_key => $value) {
        if ($value !== '') {
            update_post_meta($post_id, $meta_key, $value);
        }
    }
}

function nmm_telegram_bridge_attach_remote_image($post_id, $image_url) {
    $image_url = esc_url_raw(wp_unslash($image_url));
    if ($image_url === '') {
        return new WP_Error('nmm_telegram_bridge_invalid_image', 'Invalid featured_image_url.');
    }

    if (!function_exists('media_sideload_image')) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
    }

    return media_sideload_image($image_url, $post_id, null, 'id');
}

function nmm_telegram_bridge_get_editorial_readiness(array $payload, $post_status) {
    if (!empty($payload['editorial_readiness']) && is_string($payload['editorial_readiness'])) {
        $requested_readiness = sanitize_key($payload['editorial_readiness']);
        if (in_array($requested_readiness, array('draft-ingest', 'needs-review', 'editing', 'ready'), true)) {
            return $requested_readiness;
        }
    }

    $status = is_string($post_status) ? sanitize_key($post_status) : 'draft';
    if ($status === 'draft') {
        return 'draft-ingest';
    }

    return 'needs-review';
}
