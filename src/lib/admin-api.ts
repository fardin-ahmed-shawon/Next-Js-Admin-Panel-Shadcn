/** Join an admin endpoint without depending on a trailing slash in deployment settings. */
export function adminApiUrl(
  path: string,
  base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/",
): string {
  return base.trim().replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

/** Keep server exceptions/HTML out of the UI while retaining useful HTTP diagnostics. */
export async function readAdminApiResponse(response: Response) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    let message: string;
    switch (response.status) {
      case 401:
        message = "Your session has expired. Sign in again.";
        break;
      case 403:
        message =
          result?.code === "FEATURE_DISABLED"
            ? "This feature is disabled in Feature Control."
            : "Your role does not have permission for this action.";
        break;
      case 404:
      case 405:
        message =
          "The API endpoint is unavailable. Ask your administrator to check the backend deployment and route cache.";
        break;
      case 422:
        message =
          typeof result?.message === "string" ? result.message : "Please check the selected employee and try again.";
        break;
      case 429:
        message = "Too many requests. Please wait and retry.";
        break;
      default:
        message = "The server could not complete this request. Ask your administrator to check the API error log.";
    }
    throw new Error(message + " (HTTP " + response.status + ")");
  }
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(
      "The API returned an unexpected response. Ask your administrator to check the API address and deployment.",
    );
  }
  return result;
}
