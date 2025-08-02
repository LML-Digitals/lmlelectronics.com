"use server";

import prisma from "@/lib/prisma";
import { getSession } from "next-auth/react";

export async function logout() {
  const session = await getSession();
  if (session) {
    await prisma.session.updateMany({
      where: {
        staffId: session.user.userType === "staff" ? session.user.id : null,
        customerId:
          session.user.userType === "customer" ? session.user.id : null,
        isActive: true,
      },
      data: {
        logoutTime: new Date(),
        isActive: false,
      },
    });
  }
  return { message: "Logged out successfully" };
}
