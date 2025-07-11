import { requireUserId } from "@/auth/nextjs/currentUser";
import { db } from "@/drizzle/db";
import { productsTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import fs from "fs/promises";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

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

  const { size } = await fs.stat(product.filePath);
  const file = await fs.readFile(product.filePath);
  const extension = product.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment:filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
