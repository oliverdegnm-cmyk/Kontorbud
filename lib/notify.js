import { pool } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";

const EMAIL_SUBJECTS = {
  new_bid: "Nyt bud på din opgave",
  bid_accepted: "Dit bud er valgt!",
  new_message: "Ny besked på Kontorbud",
  task_completed: "Opgaven er markeret som udført",
  task_cancelled: "En opgave er annulleret",
  new_review: "Du har fået en ny anmeldelse",
};

export async function notify(recipientName, type, taskId, body, origin) {
  if (!recipientName) return;
  try {
    await pool.query(
      "INSERT INTO notifications (recipient_name, type, task_id, body) VALUES ($1, $2, $3, $4)",
      [recipientName, type, taskId, body]
    );
  } catch (err) {
    console.error("Kunne ikke oprette notifikation:", err.message);
  }

  // Send også en email, hvis modtageren har bekræftet sin email og ikke har slået det fra.
  try {
    const { rows } = await pool.query(
      "SELECT email, email_verified, email_notifications FROM users WHERE name = $1",
      [recipientName]
    );
    const user = rows[0];
    if (user?.email_verified && user?.email_notifications) {
      const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://kontorbud.vercel.app";
      await sendNotificationEmail(user.email, recipientName, EMAIL_SUBJECTS[type] || "Notifikation fra Kontorbud", body, siteUrl);
    }
  } catch (err) {
    console.error("Kunne ikke sende email-notifikation:", err.message);
  }
}
