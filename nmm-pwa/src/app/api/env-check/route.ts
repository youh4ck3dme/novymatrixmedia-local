import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/env-check?secret=<REVALIDATE_SECRET>
 *
 * Verifies that all required environment variables are correctly configured
 * on the Vercel deployment. Protected by REVALIDATE_SECRET.
 *
 * Returns a JSON report of all env vars: ✅ set or ❌ missing,
 * plus connectivity checks to WordPress endpoints.
 */

interface EnvCheck {
    name: string;
    status: "ok" | "missing" | "warning";
    value?: string;        // masked
    note?: string;
}

interface ConnectivityCheck {
    url: string;
    status: "ok" | "error";
    httpStatus?: number;
    note?: string;
}

function maskValue(val: string | undefined): string | undefined {
    if (!val) return undefined;
    if (val.length <= 8) return "****";
    return val.slice(0, 4) + "…" + val.slice(-4);
}

function isValidUrl(val: string): boolean {
    try {
        new URL(val);
        return true;
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    // ── Auth ────────────────────────────────────────────────────────────────────
    const secret = process.env.REVALIDATE_SECRET;
    const provided = request.nextUrl.searchParams.get("secret");

    if (!secret || !provided || provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Check environment variables ─────────────────────────────────────────────
    const checks: EnvCheck[] = [];

    // 1. NEXT_PUBLIC_WP_URL
    const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
    checks.push({
        name: "NEXT_PUBLIC_WP_URL",
        status: wpUrl ? "ok" : "warning",
        value: maskValue(wpUrl),
        note: wpUrl
            ? isValidUrl(wpUrl)
                ? wpUrl.endsWith("/") ? "Trailing slash detected — remove it" : undefined
                : "Invalid URL format"
            : "Not set — falls back to http://localhost:8080",
    });

    // 2. NEXT_PUBLIC_API_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    checks.push({
        name: "NEXT_PUBLIC_API_URL",
        status: apiUrl ? "ok" : "warning",
        value: maskValue(apiUrl),
        note: apiUrl
            ? isValidUrl(apiUrl)
                ? apiUrl.includes("/wp-json/wp/v2") ? undefined : "Expected path /wp-json/wp/v2"
                : "Invalid URL format"
            : `Not set — falls back to \${NEXT_PUBLIC_WP_URL}/wp-json/wp/v2`,
    });

    // 3. NEXT_PUBLIC_GRAPHQL_URL
    const gqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    checks.push({
        name: "NEXT_PUBLIC_GRAPHQL_URL",
        status: gqlUrl ? "ok" : "warning",
        value: maskValue(gqlUrl),
        note: gqlUrl
            ? isValidUrl(gqlUrl)
                ? gqlUrl.includes("/graphql") ? undefined : "Expected path /graphql"
                : "Invalid URL format"
            : `Not set — falls back to \${NEXT_PUBLIC_WP_URL}/graphql`,
    });

    // 4. NEXT_PUBLIC_SITE_URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    checks.push({
        name: "NEXT_PUBLIC_SITE_URL",
        status: siteUrl ? "ok" : "warning",
        value: maskValue(siteUrl),
        note: siteUrl
            ? isValidUrl(siteUrl)
                ? siteUrl.startsWith("https://") ? undefined : "Should use https:// in production"
                : "Invalid URL format"
            : "Not set — falls back to https://novymatrixmedia.sk",
    });

    // 5. REVALIDATE_SECRET
    const revalSecret = process.env.REVALIDATE_SECRET;
    checks.push({
        name: "REVALIDATE_SECRET",
        status: revalSecret ? "ok" : "missing",
        value: maskValue(revalSecret),
        note: revalSecret
            ? revalSecret.length < 32
                ? "Too short — use at least 32 characters (openssl rand -hex 32)"
                : undefined
            : "CRITICAL — On-demand ISR will not work without this",
    });

    // 6. NODE_ENV (auto-set)
    const nodeEnv = process.env.NODE_ENV;
    checks.push({
        name: "NODE_ENV",
        status: nodeEnv === "production" ? "ok" : "warning",
        value: nodeEnv,
        note: nodeEnv !== "production" ? `Expected "production" on Vercel, got "${nodeEnv}"` : undefined,
    });

    // 7. VERCEL (auto-set by Vercel)
    const vercel = process.env.VERCEL;
    checks.push({
        name: "VERCEL",
        status: vercel ? "ok" : "warning",
        value: vercel,
        note: vercel ? undefined : "Not set — are you running outside Vercel?",
    });

    // 8. VERCEL_URL (auto-set)
    const vercelUrl = process.env.VERCEL_URL;
    checks.push({
        name: "VERCEL_URL",
        status: vercelUrl ? "ok" : "warning",
        value: maskValue(vercelUrl),
        note: vercelUrl ? undefined : "Not set — expected on Vercel deployments",
    });

    // ── Connectivity checks ─────────────────────────────────────────────────────
    const resolvedWpUrl = (wpUrl ?? "http://localhost:8080").replace(/\/$/, "");
    const resolvedApiUrl = (apiUrl ?? `${resolvedWpUrl}/wp-json/wp/v2`).replace(/\/$/, "");
    const resolvedGqlUrl = (gqlUrl ?? `${resolvedWpUrl}/graphql`).replace(/\/$/, "");

    const connectivity: ConnectivityCheck[] = [];

    // REST API check — fetch /wp-json/wp/v2 root
    try {
        const res = await fetch(resolvedApiUrl, {
            method: "GET",
            signal: AbortSignal.timeout(8000),
            cache: "no-store",
        });
        connectivity.push({
            url: resolvedApiUrl,
            status: res.ok ? "ok" : "error",
            httpStatus: res.status,
            note: res.ok ? undefined : `HTTP ${res.status} — WordPress REST API unreachable`,
        });
    } catch (err) {
        connectivity.push({
            url: resolvedApiUrl,
            status: "error",
            note: `Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
    }

    // GraphQL check — POST introspection query
    try {
        const res = await fetch(resolvedGqlUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "{ __typename }" }),
            signal: AbortSignal.timeout(8000),
            cache: "no-store",
        });
        connectivity.push({
            url: resolvedGqlUrl,
            status: res.ok ? "ok" : "error",
            httpStatus: res.status,
            note: res.ok ? undefined : `HTTP ${res.status} — WPGraphQL endpoint unreachable`,
        });
    } catch (err) {
        connectivity.push({
            url: resolvedGqlUrl,
            status: "error",
            note: `Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
    }

    // ── Summary ─────────────────────────────────────────────────────────────────
    const missing = checks.filter((c) => c.status === "missing").length;
    const warnings = checks.filter((c) => c.status === "warning").length;
    const connErrors = connectivity.filter((c) => c.status === "error").length;

    const overall =
        missing > 0
            ? "FAIL"
            : connErrors > 0
                ? "DEGRADED"
                : warnings > 0
                    ? "OK_WITH_WARNINGS"
                    : "ALL_GREEN";

    return NextResponse.json(
        {
            timestamp: new Date().toISOString(),
            environment: nodeEnv,
            platform: vercel ? "vercel" : "other",
            overall,
            summary: {
                total: checks.length,
                ok: checks.filter((c) => c.status === "ok").length,
                warnings,
                missing,
                connectivityErrors: connErrors,
            },
            envVars: checks,
            connectivity,
        },
        {
            status: overall === "FAIL" ? 500 : 200,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        }
    );
}
