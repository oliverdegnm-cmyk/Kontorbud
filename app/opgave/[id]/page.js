import { pool } from "@/lib/db";
import TaskDetailClient from "./TaskDetailClient";

export async function generateMetadata({ params }) {
  try {
    const { rows } = await pool.query("SELECT title, description, category FROM tasks WHERE id = $1", [params.id]);
    const task = rows[0];
    if (!task) return { title: "Opgave - Kontorbud" };

    const description = (task.description || "").slice(0, 155);
    return {
      title: `${task.title} - Kontorbud`,
      description: description || `${task.category} - se denne opgave og afgiv bud på Kontorbud.`,
      alternates: { canonical: `https://kontorbud.dk/opgave/${params.id}` },
    };
  } catch (err) {
    return { title: "Opgave - Kontorbud" };
  }
}

export default async function Page({ params }) {
  let task = null;
  try {
    const { rows } = await pool.query("SELECT title, category FROM tasks WHERE id = $1", [params.id]);
    task = rows[0];
  } catch (err) {
    // ingen strukturerede data, hvis opslaget fejler - selve siden virker stadig fint
  }

  const breadcrumb = task && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Kontorbud", item: "https://kontorbud.dk/" },
      { "@type": "ListItem", position: 2, name: "Opgaver", item: "https://kontorbud.dk/opgaver" },
      { "@type": "ListItem", position: 3, name: task.category, item: `https://kontorbud.dk/opgaver?category=${encodeURIComponent(task.category)}` },
      { "@type": "ListItem", position: 4, name: task.title, item: `https://kontorbud.dk/opgave/${params.id}` },
    ],
  };

  return (
    <>
      {breadcrumb && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />}
      <TaskDetailClient />
    </>
  );
}
