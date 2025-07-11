import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { db } from "@/drizzle/db";
import { downloadVerificationTable, productsTable } from "@/drizzle/schema";
import { and, eq, gt } from "drizzle-orm";

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
    const { size } = await fs.stat(data.filePath);
    const file = await fs.readFile(data.filePath);
    const extension = data.filePath.split(".").pop() ?? "bin"; // fallback extension

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.name}.${extension}"`,
        "Content-Length": size.toString(),
        "Content-Type": "application/octet-stream", // optionally set based on extension
      },
    });
  } catch (err) {
    console.error("File read error:", err);
    return NextResponse.redirect(new URL("/products/download/error", req.url));
  }
}
