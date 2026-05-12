/**
 * Recursively adds an `_id` alias on every object that has an `id` field.
 *
 * Why: the React client was originally written for MongoDB and references
 *      `._id` throughout. Prisma returns `id`. Adding `_id` as an alias on
 *      the way out lets the client stay untouched.
 *
 * Also strips `password` if present so credentials never leak to the wire.
 */
export function toClient(obj) {
  if (obj == null) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(toClient);
  if (typeof obj !== 'object') return obj;

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'password') continue;
    out[k] = toClient(v);
  }
  if (out.id != null && out._id == null) out._id = out.id;
  return out;
}

/**
 * Convenience: shape a user for the public API (drops password, keeps
 * brand/influencer fields nested under a profile sub-object so the client
 * keeps using `user.brandProfile.companyName` etc.).
 */
export function publicUser(user) {
  if (!user) return null;
  const {
    password, companyName, website, industry, description,
    bio, location, niches, totalFollowers, handles,
    ...rest
  } = user;
  return toClient({
    ...rest,
    brandProfile: rest.role === 'brand'
      ? { companyName, website, industry, description }
      : undefined,
    influencerProfile: rest.role === 'influencer'
      ? { bio, location, niches: niches || [], totalFollowers: totalFollowers || 0, handles: handles || [] }
      : undefined,
  });
}
