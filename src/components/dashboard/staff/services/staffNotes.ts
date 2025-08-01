"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/config/authOptions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function checkAuthorization() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentStaff = await prisma.staff.findUnique({
    where: {
      email: session.user.email!,
    },
  });

  if (!currentStaff || !["admin"].includes(currentStaff.role)) {
    throw new Error("Unauthorized");
  }

  return currentStaff;
}

export async function getStaffNotes(staffId: string) {
  try {
    // await checkAuthorization();

    const notes = await prisma.note.findMany({
      where: {
        staffId: staffId,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the notes to ensure non-null values
    return {
      notes: notes.map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        author: {
          firstName: note.author?.firstName || "Unknown",
          lastName: note.author?.lastName || "User",
          profileImage: note.author?.profileImage || null,
        },
      })),
    };
  } catch (error) {
    console.error("[GET_STAFF_NOTES]", error);
    throw new Error("Failed to fetch staff notes");
  }
}

export async function addStaffNote(staffId: string, content: string) {
  try {
    const currentStaff = await checkAuthorization();

    const note = await prisma.note.create({
      data: {
        title: "Staff Note",
        content,
        staffId,
        authorId: currentStaff.id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/staff/profile");
    revalidatePath(`/dashboard/staff/profile/${staffId}`);

    return { note };
  } catch (error) {
    console.error("[ADD_STAFF_NOTE]", error);
    throw new Error("Failed to add staff note");
  }
}

export async function updateStaffNote(noteId: number, content: string) {
  try {
    await checkAuthorization();

    const note = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        content,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/staff/profile");
    revalidatePath(`/dashboard/staff/profile/${note.staffId}`);

    return { note };
  } catch (error) {
    console.error("[UPDATE_STAFF_NOTE]", error);
    throw new Error("Failed to update staff note");
  }
}

export async function deleteStaffNote(noteId: number) {
  try {
    await checkAuthorization();

    const note = await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    revalidatePath("/dashboard/staff/profile");
    revalidatePath(`/dashboard/staff/profile/${note.staffId}`);

    return { success: true };
  } catch (error) {
    console.error("[DELETE_STAFF_NOTE]", error);
    throw new Error("Failed to delete staff note");
  }
}
