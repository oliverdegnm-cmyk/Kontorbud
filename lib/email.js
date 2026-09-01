import { Resend } from "resend";

let resend = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendVerificationEmail(toEmail, toName, token, origin) {
  const client = getResend();
  if (!client) {
    console.error("RESEND_API_KEY mangler - kan ikke sende bekræftelsesmail.");
    return;
  }
  const verifyUrl = `${origin}/bekraeft?token=${token}`;
  try {
    await client.emails.send({
      // "onboarding@resend.dev" virker uden videre opsætning til test - når I har
      // verificeret eget domæne hos Resend, kan I skifte til f.eks. noreply@kontorbud.dk.
      from: process.env.RESEND_FROM_EMAIL || "Kontorbud <onboarding@resend.dev>",
      to: toEmail,
      subject: "Bekræft din email hos Kontorbud",
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto;">
          <h2 style="color:#14213D;">Hej ${toName}!</h2>
          <p style="color:#5B6478; line-height:1.6;">Klik på knappen nedenfor for at bekræfte din email og aktivere din konto på Kontorbud.</p>
          <a href="${verifyUrl}" style="display:inline-block; background:#2A55E5; color:#fff; padding:12px 22px; border-radius:10px; text-decoration:none; font-weight:700; margin:16px 0;">Bekræft min email</a>
          <p style="color:#9AA2B1; font-size:12px;">Virker knappen ikke? Kopiér dette link: ${verifyUrl}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Kunne ikke sende bekræftelsesmail:", err);
  }
}
