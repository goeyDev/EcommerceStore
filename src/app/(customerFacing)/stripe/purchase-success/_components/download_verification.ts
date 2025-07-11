import { db } from "@/drizzle/db";
import { downloadVerificationTable } from "@/drizzle/schema";

export async function createDownloadVerification(productId: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const [inserted] = await db
    .insert(downloadVerificationTable)
    .values({
      productId,
      expiresAt,
    })
    .returning({ id: downloadVerificationTable.id });

  return inserted.id;
}
