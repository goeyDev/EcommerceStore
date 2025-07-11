import { requireUserId } from "@/auth/nextjs/currentUser";
import { db } from "@/drizzle/db";
import { productsTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase"; // your Firebase setup

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUserId();
  const product = await db.query.productsTable.findFirst({
    columns: { filePath: true, name: true },
    where: and(eq(productsTable.id, id), eq(productsTable.userId, user.id)),
  });

  if (product == null) return notFound();

  try {
    // Create a reference to the file in Firebase Storage
    const fileRef = ref(storage, product.filePath);

    // Get the download URL
    const downloadURL = await getDownloadURL(fileRef);

    // Fetch the file from the download URL
    const response = await fetch(downloadURL);
    const fileBlob = await response.blob();
    const fileBuffer = await fileBlob.arrayBuffer();

    // Get the file extension from the path
    const extension = product.filePath.split(".").pop();

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
        "Content-Length": fileBlob.size.toString(),
        "Content-Type": fileBlob.type,
      },
    });
  } catch (error) {
    console.error("Error downloading file from Firebase Storage:", error);
    return notFound();
  }
}
