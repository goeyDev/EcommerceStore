import { db } from "@/drizzle/db";
import { ordersTable, productsTable, userTable } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

export async function getSalesData() {
  const data = await db
    .select({
      _sum: sql<number>`SUM(${ordersTable.pricePaidInCents})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(ordersTable);

  const salesTotal = Number(data[0]?._sum ?? 0);
  const salesCount = Number(data[0]?.count ?? 0);

  return {
    numberOfSales: salesCount,
    amount: salesCount === 0 ? 0 : salesTotal / 100,
  };
}

export async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(userTable),
    db
      .select({ _sum: sql<number>`SUM(${ordersTable.pricePaidInCents})` })
      .from(ordersTable),
  ]);

  const countUser = Number(userCount[0]?.count ?? 0);
  const dataOrder = Number(orderData[0]?._sum ?? 0);

  return {
    countUser,
    averageValuePerUser:
      countUser === 0 ? 0 : (dataOrder || 0) / countUser / 100,
  };
}

export async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(productsTable)
      .where(eq(productsTable.isAvailableForPurchase, true)),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(productsTable)
      .where(eq(productsTable.isAvailableForPurchase, false)),
  ]);

  const countActive = Number(activeCount[0]?.count ?? 0);
  const countInactive = Number(inactiveCount[0]?.count ?? 0);

  return {
    countActive,
    countInactive,
  };
}
