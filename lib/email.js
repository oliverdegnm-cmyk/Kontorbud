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

export async function sendNotificationEmail(toEmail, toName, subject, body, origin) {
  const client = getResend();
  if (!client) return;
  try {
    await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Kontorbud <onboarding@resend.dev>",
      to: toEmail,
      subject,
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto;">
          <h2 style="color:#14213D;">Hej ${toName}!</h2>
          <p style="color:#5B6478; line-height:1.6;">${body}</p>
          <a href="${origin}" style="display:inline-block; background:#2A55E5; color:#fff; padding:12px 22px; border-radius:10px; text-decoration:none; font-weight:700; margin:16px 0;">Åbn Kontorbud</a>
          <p style="color:#9AA2B1; font-size:12px;">Du kan slå email-notifikationer fra under Indstillinger.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Kunne ikke sende notifikationsmail:", err);
  }
}

export async function sendContactEmail(toEmail, fromName, fromEmail, message) {
  const client = getResend();
  if (!client) return false;
  try {
    await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Kontorbud <onboarding@resend.dev>",
      to: toEmail,
      replyTo: fromEmail,
      subject: `Ny besked fra ${fromName} via kontaktformularen`,
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto;">
          <h2 style="color:#14213D;">Ny besked fra kontaktformularen</h2>
          <p style="color:#5B6478;"><b>Navn:</b> ${fromName}</p>
          <p style="color:#5B6478;"><b>Email:</b> ${fromEmail}</p>
          <p style="color:#5B6478; line-height:1.6; white-space:pre-wrap;">${message}</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Kunne ikke sende kontakt-mail:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(toEmail, toName, token, origin) {
  const client = getResend();
  if (!client) {
    console.error("RESEND_API_KEY mangler - kan ikke sende nulstillingsmail.");
    return;
  }
  const resetUrl = `${origin}/nulstil-adgangskode?token=${token}`;
  try {
    await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Kontorbud <onboarding@resend.dev>",
      to: toEmail,
      subject: "Nulstil din adgangskode hos Kontorbud",
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto;">
          <h2 style="color:#14213D;">Hej ${toName}!</h2>
          <p style="color:#5B6478; line-height:1.6;">Vi har modtaget en anmodning om at nulstille din adgangskode. Klik på knappen nedenfor for at vælge en ny — linket er gyldigt i 1 time.</p>
          <a href="${resetUrl}" style="display:inline-block; background:#2A55E5; color:#fff; padding:12px 22px; border-radius:10px; text-decoration:none; font-weight:700; margin:16px 0;">Vælg ny adgangskode</a>
          <p style="color:#9AA2B1; font-size:12px;">Har du ikke selv bedt om dette, kan du roligt ignorere denne mail. Virker knappen ikke? Kopiér dette link: ${resetUrl}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Kunne ikke sende nulstillingsmail:", err);
  }
}
