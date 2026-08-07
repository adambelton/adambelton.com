export function isThoughtFormNonOwnerTemporaryAccessEnabled(
  environment: { development: boolean },
) {
  return environment.development;
}
