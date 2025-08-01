"use server";

import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/config/authOptions";
import { revalidatePath } from "next/cache";
import type { UploadResponse } from "@/lib/types/upload";

type UploadImageParams = {
  filename: string;
  blob: Blob | ArrayBuffer | Buffer;
  description?: string;
  tags?: string;
  size?: number;
  mimeType?: string;
};

export async function uploadImage(file: File): Promise<string> {
  const response = await fetch(`/api/upload?filename=${file.name}`, {
    method: "POST",
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = (await response.json()) as UploadResponse;
  return data.url;
}
