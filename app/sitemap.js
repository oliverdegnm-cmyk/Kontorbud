import { pool, ensureSchema } from "@/lib/db";
import { CATS } from "@/lib/categories";
import { POSTS } from "@/lib/blogPosts";

export default async function sitemap() {
  const base = "https://kontorbud.dk";

  const staticRoutes = ["", "/opgaver", "/hvordan-det-virker", "/kontakt", "/opret", "/login", "/blog"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = CATS.map((c) => ({
    url: `${base}/kategori/${c.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.publishedAt,
  }));

  let taskRoutes = [];
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      "SELECT id, created_at FROM tasks WHERE status != 'cancelled' ORDER BY created_at DESC LIMIT 500"
    );
    taskRoutes = rows.map((t) => ({
      url: `${base}/opgave/${t.id}`,
      lastModified: t.created_at,
    }));
  } catch (err) {
    // hvis databasen ikke kan nås under bygning, udelader vi bare opgaverne
  }

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...taskRoutes];
}
