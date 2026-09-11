// AIbuds blog er tom for nu - Kontorbuds oprindelige blogindlæg handlede
// specifikt om Kontorbuds kategorier (bogføring, oversættelse osv.), som
// ikke findes her. Nye, AI-fokuserede indlæg kan tilføjes senere i samme
// struktur som Kontorbuds - se Kontorbuds lib/blogPosts.js for et eksempel
// på formatet.
export const POSTS = [];

export function getPostBySlug(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}
