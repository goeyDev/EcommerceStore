"use server";

import { db } from "@/drizzle/db";
import { ordersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function deleteOrder(id: string) {
  const [order] = await db
    .delete(ordersTable)
    .where(eq(ordersTable.id, id))
    .returning();

  if (!order) return notFound();

  return order;
}
