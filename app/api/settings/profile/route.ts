import { getCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, avatarUrl } = body;

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        fullName: fullName !== undefined ? fullName : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        name: updatedUser.fullName || "User",
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl || "",
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
