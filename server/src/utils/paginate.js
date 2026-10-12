export function paginate(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function searchRegex(q) {
  if (!q) return null;
  return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
