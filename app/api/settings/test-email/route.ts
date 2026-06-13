import { getCurrentDbUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser || !dbUser.email) {
      return NextResponse.json({ error: "Unauthorized or missing email address" }, { status: 401 });
    }

    console.log(`[TestEmail] Sending test email to ${dbUser.email}...`);
    const result = await sendTestEmail(dbUser.email);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send email", details: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Test email triggered successfully", data: result.data });
  } catch (error) {
    console.error("[TEST_EMAIL_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
