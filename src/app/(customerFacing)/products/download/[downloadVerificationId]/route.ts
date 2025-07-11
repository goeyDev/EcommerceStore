import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { downloadVerificationTable, productsTable } from "@/drizzle/schema";
import { and, eq, gt } from "drizzle-orm";

import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase"; // your Firebase storage init

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
    const storageRef = ref(storage, data.filePath);
    const downloadUrl = await getDownloadURL(storageRef);

    const extension = data.filePath.split(".").pop() ?? "bin";
    const forcedName = `${data.name}.${extension}`;

    const redirectUrl = new URL(downloadUrl);
    redirectUrl.searchParams.set(
      "response-content-disposition",
      `attachment; filename="${forcedName}"`
    );

    // ⬇️ Force redirect to Firebase URL with download behavior
    return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
  } catch (err) {
    console.error("Firebase read error:", err);
    return NextResponse.redirect(new URL("/products/download/error", req.url));
  }
}
