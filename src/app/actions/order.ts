"use server";

import { db } from "@/drizzle/db";
import { eq, and } from "drizzle-orm";
import { ordersTable, userTable } from "@/drizzle/schema";

// export async function userOrderExists(email: string, productId: string) {
//   const result = await db
//     .select({ id: ordersTable.id })
//     .from(ordersTable)
//     .leftJoin(userTable, eq(ordersTable.userId, userTable.id))
//     .where(
//       and(eq(userTable.email, email), eq(ordersTable.productId, productId))
//     )
//     .limit(1);

//   // If result found, user owns it → return false
//   //   result.length is like comaparison with the result query from DB. if found then result is 1 and result.lenght === 0 is false.
//   // return result.length === 0;
//   return result.length > 0;
// }

// email for production
// export async function userOrderExists(email: string, productId: string) {
//   const result = await db
//     .select({ id: ordersTable.id })
//     .from(ordersTable)
//     .leftJoin(userTable, eq(ordersTable.userId, userTable.id))
//     .where(
//       and(eq(userTable.email, email), eq(ordersTable.productId, productId))
//     )
//     .limit(1);

//   return result.length > 0;
// }

// userId for Development
// export async function userOrderExists(userId: string, productId: string) {
//   const result = await db
//     .select({ id: ordersTable.id })
//     .from(ordersTable)
//     .leftJoin(userTable, eq(ordersTable.userId, userTable.id))
//     .where(and(eq(userTable.id, userId), eq(ordersTable.productId, productId)))
//     .limit(1);

//   return result.length > 0;
// }

export async function userOrderExists(email: string, productId: string) {
  const result = await db
    .select({ orderId: ordersTable.id, email: userTable.email })
    .from(ordersTable)
    .innerJoin(userTable, eq(ordersTable.userId, userTable.id)) // 1️⃣ Join orders with users
    .where(
      and(
        eq(userTable.email, email), // 2️⃣ Match user by email
        eq(ordersTable.productId, productId) // 3️⃣ Match productId
      )
    )
    .limit(1);

  return result.length > 0; // 4️⃣ Return true if a match is found
}
