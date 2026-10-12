export function omitEmpty(obj) {
  const next = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (value === "" || value === undefined) continue;
    next[key] = value;
  }
  return next;
}
