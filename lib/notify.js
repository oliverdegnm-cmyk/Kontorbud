import { pool } from "@/lib/db";

export async function notify(recipientName, type, taskId, body) {
  if (!recipientName) return;
  try {
    await pool.query(
      "INSERT INTO notifications (recipient_name, type, task_id, body) VALUES ($1, $2, $3, $4)",
      [recipientName, type, taskId, body]
    );
  } catch (err) {
    // Notifikationer må aldrig vælte selve handlingen (bud, besked osv.), så vi sluger fejlen her.
    console.error("Kunne ikke oprette notifikation:", err.message);
  }
}
