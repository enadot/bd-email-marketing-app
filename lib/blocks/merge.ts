// Replaces {{mergeTags}} in a string with values from a data record.
// Unknown tags are replaced with the provided fallback (default: empty string).
export function applyMergeTags(
  input: string,
  data: Record<string, unknown>,
  fallback = "",
): string {
  return input.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const value = key
      .split(".")
      .reduce<unknown>((acc, k) => (acc == null ? acc : (acc as Record<string, unknown>)[k]), data);
    return value == null ? fallback : String(value);
  });
}

// Builds the merge data for a contact (top-level fields + custom `fields`).
export function contactMergeData(contact: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fields?: unknown;
}): Record<string, unknown> {
  const custom =
    contact.fields && typeof contact.fields === "object"
      ? (contact.fields as Record<string, unknown>)
      : {};
  return {
    email: contact.email,
    firstName: contact.firstName ?? "",
    lastName: contact.lastName ?? "",
    ...custom,
  };
}
