"use server";
import { db } from "@/drizzle/db";
import { userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function deleteUser(id: string) {
  const [user] = await db
    .delete(userTable)
    .where(eq(userTable.id, id))
    .returning();
  if (!user) return notFound();
  return user;
}
