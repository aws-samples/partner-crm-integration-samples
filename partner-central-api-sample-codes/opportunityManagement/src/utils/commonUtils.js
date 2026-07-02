/**
 * Decode server-side encoded entities in string values.
 * The Partner Central API double-encodes colons as &amp;colon; in responses.
 *
 * Order matters: decode &amp;colon; -> ':' first, then decode any remaining
 * &amp; -> '&'. The editable-JSON round-trip re-encodes every literal '&' to
 * '&amp;' on submit, so without the second step an enum value like
 * "Business Applications & Contact Center" would be sent as
 * "Business Applications &amp; Contact Center" and rejected with
 * INVALID_ENUM_VALUE.
 */
export const decodeServerEntities = (text) => {
  if (!text) return '';
  return text
    .replace(/&amp;colon;/g, ':')
    .replace(/&amp;/g, '&');
};

/**
 * Recursively decode server-side encoded entities in all string values of an
 * object. Preserves Date objects and other non-plain-object types.
 *
 * Uses the same decode order as decodeServerEntities: &amp;colon; -> ':' first,
 * then &amp; -> '&' so literal ampersands survive the editable-JSON round-trip.
 */
export const decodeServerEntitiesInObject = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/&amp;colon;/g, ':')
      .replace(/&amp;/g, '&');
  }
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(decodeServerEntitiesInObject);
  }
  if (value && typeof value === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = decodeServerEntitiesInObject(v);
    }
    return result;
  }
  return value;
};
