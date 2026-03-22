export function getEditorialReadinessLabel(readiness?: string): string | null {
    switch (readiness) {
        case "draft-ingest":
            return "Draft ingest";
        case "needs-review":
            return "Needs review";
        case "editing":
            return "In editing";
        case "ready":
            return "Ready to publish";
        default:
            return null;
    }
}

export function getEditorialReadinessTone(readiness?: string): "warning" | "progress" | "ready" | null {
    switch (readiness) {
        case "draft-ingest":
        case "needs-review":
            return "warning";
        case "editing":
            return "progress";
        case "ready":
            return "ready";
        default:
            return null;
    }
}