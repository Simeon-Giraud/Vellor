import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Vellor <hello@vellor.com>"; // Replace with your verified domain

export async function sendTrialExpiryEmail(email: string, daysLeft: number) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Vellor trial expires in ${daysLeft} days`,
      html: `<p>Hi there,</p>
      <p>Your trial of Vellor is expiring in ${daysLeft} days. Don't lose access to your AI analytics!</p>
      <p>Please upgrade your plan to continue tracking your brand's performance across AI models.</p>
      <p><a href="https://vellor.com/dashboard/settings">Upgrade Now</a></p>
      <p>Thanks,<br>The Vellor Team</p>`,
    });

    if (error) {
      console.error("Failed to send trial expiry email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending trial expiry email:", error);
    return { success: false, error };
  }
}

export async function sendWeeklyDigestEmail(email: string, projectName: string, summaryHtml: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Weekly AI Performance Digest: ${projectName}`,
      html: `<p>Hi there,</p>
      <p>Here is your weekly AI performance digest for <strong>${projectName}</strong>:</p>
      <div>${summaryHtml}</div>
      <p><a href="https://vellor.com/dashboard/projects">View Full Report</a></p>
      <p>Thanks,<br>The Vellor Team</p>`,
    });

    if (error) {
      console.error("Failed to send weekly digest email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending weekly digest email:", error);
    return { success: false, error };
  }
}
