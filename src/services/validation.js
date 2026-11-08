/**
 * Shared client-side validation helpers.
 * UI-only guards; Firestore Security Rules remain the real authorization layer.
 */

/** YouTube video IDs are exactly 11 characters: A-Z, a-z, 0-9, _ or -. */
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isValidYoutubeVideoId(value) {
  return typeof value === "string" && YOUTUBE_ID_PATTERN.test(value.trim());
}

/** Readable messages for the Firebase error codes the admin panel can hit. */
const FRIENDLY_ERRORS = {
  "permission-denied": "You do not have permission to perform this action. Please sign in again as the admin.",
  unauthenticated: "Your admin session has expired. Please sign in again.",
  unavailable: "Cannot reach the database right now. Check your internet connection and try again.",
  "not-found": "This record no longer exists. It may have been deleted.",
  "invalid-argument": "The database rejected this data. Please review the form and try again.",
  "failed-precondition": "The database rejected this request. Please refresh and try again.",
  "resource-exhausted": "The database is busy right now. Please wait a moment and try again.",
  "deadline-exceeded": "The request timed out. Please try again.",
  aborted: "The save was interrupted. Please try again.",
  "already-exists": "A record with these details already exists.",
};

/**
 * Builds the readable dependency detail used when a company cannot be
 * deleted because other records still reference it.
 * Returns an empty string when there are no dependencies.
 */
export function companyDeleteDependencyMessage({ plans = 0, links = 0 } = {}) {
  const parts = [];
  if (plans > 0) parts.push(`${plans} insurance plan${plans === 1 ? "" : "s"}`);
  if (links > 0) parts.push(`${links} calculator link${links === 1 ? "" : "s"}`);
  if (parts.length === 0) return "";
  const onlyOneRecord = parts.length === 1 && ((plans === 1 && links === 0) || (links === 1 && plans === 0));
  return `${parts.join(" and ")} still ${onlyOneRecord ? "references" : "reference"} it`;
}

/**
 * Turns a Firebase/Firestore error into a short, readable sentence that can
 * be shown inside an admin modal. Keeps the raw code as a suffix so the owner
 * can still quote it when reporting a problem.
 */
export function describeFirestoreError(err, fallback = "Something went wrong. Please try again.") {
  const rawCode = typeof err?.code === "string" ? err.code : "";
  const code = rawCode.replace(/^firestore\//, "").replace(/^auth\//, "");
  const friendly = FRIENDLY_ERRORS[code];
  const rawMessage = typeof err?.message === "string" ? err.message.trim() : "";

  if (friendly) {
    return rawCode ? `${friendly} (${rawCode})` : friendly;
  }
  if (rawMessage) return rawMessage;
  return fallback;
}
