/**
 * Decode server-side encoded colons in string values.
 * The Partner Central API double-encodes colons as &amp;colon; in responses.
 */
export const decodeServerEntities = (text) => {
  if (!text) return '';
  return text.replace(/&amp;colon;/g, ':');
};

/**
 * Recursively decode &amp;colon; in all string values of an object.
 * Preserves Date objects and other non-plain-object types.
 */
export const decodeServerEntitiesInObject = (value) => {
  if (typeof value === 'string') {
    return value.replace(/&amp;colon;/g, ':');
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