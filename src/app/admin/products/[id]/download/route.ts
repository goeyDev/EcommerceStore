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
    const extension = product.filePath.split(".").pop() ?? "bin";
    const filename = `${product.name}.${extension}`;

    // Get Firebase Storage download URL
    const storageRef = ref(storage, product.filePath);
    const downloadUrl = await getDownloadURL(storageRef);

    // Append forced download behavior
    const redirectUrl = new URL(downloadUrl);
    redirectUrl.searchParams.set(
      "response-content-disposition",
      `attachment; filename="${filename}"`
    );

    // Redirect browser to Firebase-hosted file (download will be triggered)
    return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
  } catch (err) {
    console.error("Firebase download error:", err);
    return NextResponse.redirect(new URL("/products/download/error", req.url));
  }
}

// const { size } = await fs.stat(product.filePath);
// const file = await fs.readFile(product.filePath);
// const extension = product.filePath.split(".").pop();

// return new NextResponse(file, {
//   headers: {
//     "Content-Disposition": `attachment:filename="${product.name}.${extension}"`,
//     "Content-Length": size.toString(),
//   },
// });
