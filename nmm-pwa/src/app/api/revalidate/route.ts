import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * Called by the WordPress mu-plugin (nmm-revalidate.php) whenever a post is
 * published, updated, or trashed.
 *
 * Required env var on Vercel:
 *   REVALIDATE_SECRET  – must match NMM_REVALIDATE_SECRET in wp-config.php
 *
 * Request body (JSON):
 * {
 *   secret:        string,           // must match REVALIDATE_SECRET
 *   slug?:         string,           // post slug
 *   postId?:       number,           // post ID
 *   categorySlugs?: string[],        // category slugs the post belongs to
 *   purgeAll?:     boolean           // nuke every wp-* tag (use sparingly)
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    let body: Record<string, unknown>;

    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // ── Auth: validate secret ────────────────────────────────────────────────────
    const secret = process.env.REVALIDATE_SECRET;

    if (!secret || typeof body.secret !== "string" || body.secret !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const revalidated: string[] = [];

    // ── Purge all WordPress cache tags ──────────────────────────────────────────
    if (body.purgeAll === true) {
        revalidateTag("wp-posts", { expire: 0 });
        revalidateTag("wp-categories", { expire: 0 });
        revalidated.push("wp-posts", "wp-categories");

        return NextResponse.json({ revalidated, message: "Full purge complete" });
    }

    // ── Purge post-level tags ────────────────────────────────────────────────────
    revalidateTag("wp-posts", { expire: 0 }); // invalidates post lists (home page, feeds)
    revalidated.push("wp-posts");

    if (typeof body.slug === "string" && body.slug) {
        revalidateTag(`wp-post-${body.slug}`, { expire: 0 });
        revalidated.push(`wp-post-${body.slug}`);
    }

    if (typeof body.postId === "number") {
        revalidateTag(`wp-post-id-${body.postId}`, { expire: 0 });
        revalidated.push(`wp-post-id-${body.postId}`);
    }

    // ── Purge category-level tags ────────────────────────────────────────────────
    const categorySlugs = Array.isArray(body.categorySlugs)
        ? (body.categorySlugs as unknown[]).filter((s): s is string => typeof s === "string")
        : [];

    for (const catSlug of categorySlugs) {
        revalidateTag(`wp-category-posts-${catSlug}`, { expire: 0 });
        revalidated.push(`wp-category-posts-${catSlug}`);
    }

    return NextResponse.json({ revalidated, message: "Revalidation complete" });
}
