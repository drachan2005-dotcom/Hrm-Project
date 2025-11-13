/**
 * Heuristic helper that classifies whether an error looks like a network failure.
 * Supabase and the browser return a variety of error types when DNS lookup fails,
 * the request is blocked, or the fetch layer cannot reach the host. This utility
 * centralises the detection logic so the UI can gracefully fall back to mock mode.
 */
export function isNetworkError(err: unknown): boolean {
  if (!err) {
    return false;
  }

  if (err instanceof TypeError) {
    return true;
  }

  if (typeof err === 'string') {
    return matchesNetworkSignature(err);
  }

  if (typeof err === 'object') {
    const maybeError = err as {
      message?: string;
      status?: number;
      code?: string;
      name?: string;
      cause?: unknown;
    };

    if (matchesNetworkSignature(maybeError.message) || matchesNetworkSignature(maybeError.name)) {
      return true;
    }

    if (typeof maybeError.status === 'number' && maybeError.status === 0) {
      return true;
    }

    if (maybeError.code && matchesNetworkSignature(maybeError.code)) {
      return true;
    }

    if (maybeError.cause && maybeError.cause !== err && isNetworkError(maybeError.cause)) {
      return true;
    }
  }

  return false;
}

const NETWORK_PATTERNS = [
  'failed to fetch',
  'fetcherror',
  'networkerror',
  'network request failed',
  'timeout',
  'timed out',
  'enotfound',
  'econnrefused',
  'econnreset',
  'eai_again',
  'name not resolved',
  'dns',
  'getaddrinfo',
  'err_name_not_resolved',
];

function matchesNetworkSignature(value?: string): boolean {
  if (!value) {
    return false;
  }
  const normalised = value.toLowerCase();
  return NETWORK_PATTERNS.some((pattern) => normalised.includes(pattern));
}
