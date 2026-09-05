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

export default function Page() {
  return <TaskDetailClient />;
}
