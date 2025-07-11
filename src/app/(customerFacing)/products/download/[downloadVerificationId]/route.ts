import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { downloadVerificationTable, productsTable } from "@/drizzle/schema";
import { and, eq, gt } from "drizzle-orm";

import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase"; // your Firebase storage init
import { notFound } from "next/navigation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ downloadVerificationId: string }> }
) {
  const { downloadVerificationId } = await params;
  const now = new Date();

  const [data] = await db
    .select({
      filePath: productsTable.filePath,
      name: productsTable.name,
    })
    .from(downloadVerificationTable)
    .innerJoin(
      productsTable,
      eq(downloadVerificationTable.productId, productsTable.id)
    )
    .where(
      and(
        eq(downloadVerificationTable.id, downloadVerificationId),
        gt(downloadVerificationTable.expiresAt, now)
      )
    )
    .limit(1);

  if (!data) {
    return NextResponse.redirect(
      new URL("/products/download/expired", req.url)
    );
  }

  try {
    // Create a reference to the file in Firebase Storage
    const fileRef = ref(storage, data.filePath);

    // Get the download URL
    const downloadURL = await getDownloadURL(fileRef);

    // Fetch the file from the download URL
    const response = await fetch(downloadURL);
    const fileBlob = await response.blob();
    const fileBuffer = await fileBlob.arrayBuffer();

    // Get the file extension from the path
    const extension = data.filePath.split(".").pop();

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.name}.${extension}"`,
        "Content-Length": fileBlob.size.toString(),
        "Content-Type": fileBlob.type,
      },
    });
  } catch (error) {
    console.error("Error downloading file from Firebase Storage:", error);
    return notFound();
  }
  // try {
  //   const storageRef = ref(storage, data.filePath);
  //   const downloadUrl = await getDownloadURL(storageRef);

  //   const extension = data.filePath.split(".").pop() ?? "bin";
  //   const forcedName = `${data.name}.${extension}`;

  //   const redirectUrl = new URL(downloadUrl);
  //   redirectUrl.searchParams.set(
  //     "response-content-disposition",
  //     `attachment; filename="${forcedName}"`
  //   );

  //   // ⬇️ Force redirect to Firebase URL with download behavior
  //   return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
  // } catch (err) {
  //   console.error("Firebase read error:", err);
  //   return NextResponse.redirect(new URL("/products/download/error", req.url));
  // }
}
