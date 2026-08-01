export const PRIVACY_ACKNOWLEDGEMENT_KEY =
  "socratic-draft:privacy-acknowledged:2026-08-01";

type SessionStorage = Pick<Storage, "getItem" | "setItem">;

export function hasAcknowledgedPrivacy(storage: SessionStorage | null) {
  return storage?.getItem(PRIVACY_ACKNOWLEDGEMENT_KEY) === "true";
}

export function acknowledgePrivacy(storage: SessionStorage | null) {
  storage?.setItem(PRIVACY_ACKNOWLEDGEMENT_KEY, "true");
}
