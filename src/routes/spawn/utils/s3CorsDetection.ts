/**
 * ============================================================================
 * TEMPORARY HOTFIX — CORS WORKAROUND — DO NOT KEEP LONG-TERM
 * ============================================================================
 *
 * Problem: the spawn form validates user-supplied S3 credentials in the
 * browser (see validateS3Credentials.ts). Buckets without a CORS rule
 * (e.g. s3.cl4.du.cesnet.cz) block the browser's preflight request, so
 * validation always fails with a misleading "Cannot reach S3 endpoint"
 * error even when the endpoint and credentials are fine.
 *
 * Workaround: when the SDK failure looks like a browser-level network
 * error AND the endpoint itself responds to a CORS-exempt probe, treat the
 * failure as CORS-blocked and SKIP validation (the form submits anyway).
 *
 * REMOVE THIS FILE and the CORS-skip logic in useSpawnFormSubmit.ts once a
 * proper fix exists (server-side validation in JupyterHub, or bucket-side
 * CORS configuration: `aws s3api put-bucket-cors ... AllowedHeaders ["*"]`).
 * ============================================================================
 */

/** Messages browsers produce when a fetch is blocked (CORS) or fails at network level. */
const NETWORK_FAILURE_PATTERN = /failed to fetch|networkerror|load failed/i;

/**
 * TEMPORARY HOTFIX (CORS): True when the error thrown by the S3 client was
 * a browser-level network failure — the shape CORS blocks always produce
 * ("TypeError: Failed to fetch" in Chrome, "NetworkError..." in Firefox,
 * "Load failed" in Safari). False for real S3 error responses
 * (AccessDenied, NoSuchBucket, SignatureDoesNotMatch, ...), which only
 * reach our code when CORS already passed — those still fail validation.
 */
export function isNetworkLevelS3Failure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "TypeError" || NETWORK_FAILURE_PATTERN.test(error.message)
  );
}

/**
 * TEMPORARY HOTFIX (CORS): Probes the S3 endpoint with a CORS-exempt fetch.
 *
 * A `mode: "no-cors"` fetch never triggers CORS checks: it resolves with an
 * opaque response if the server responds AT ALL (even 403/404), and only
 * rejects when the endpoint is genuinely unreachable or times out.
 * Therefore: SDK network-failure + probe resolves ⇒ the SDK call was
 * CORS-blocked, not a dead endpoint.
 *
 * @returns true if the server responded (endpoint alive ⇒ CORS was the culprit)
 * @returns false if the endpoint is unreachable or timed out
 */
export async function isEndpointReachable(
  url: string,
  timeoutMs = 5000,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // HEAD is a CORS-safelisted method; "no-cors" makes the browser skip
    // the CORS check entirely. Any server response resolves the promise.
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    // Unreachable, DNS failure, TLS failure, or timeout.
    return false;
  } finally {
    clearTimeout(timer);
  }
}
