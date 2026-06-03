import { getCurrentDbUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const prompt = await prisma.prompt.findFirst({
      where: {
        id,
        project: {
          user: { supabaseId: userId }
        }
      }
    });

    if (!prompt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.prompt.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error deleting prompt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
