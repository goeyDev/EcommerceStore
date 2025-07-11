// prisma
// const getMostPopularProducts = {
//   return db.product.findMany({
//     where: { isAvailableForPurchase: true },
//     orderBy: { orders: { _count: "desc" } },
//     take: 6,
//   });
// };

// drizzle-orm : relations method:
// export async function getMostPopularProducts() {
//   const products = await db.query.productsTable.findMany({
//     where: eq(productsTable.isAvailableForPurchase, true),
//     with: {
//       orders: true, // assuming you defined this relation
//     },
//   });

//   // Manually sort by order count (in JS)
//   const sorted = products
//     .sort((a, b) => (b.orders?.length ?? 0) - (a.orders?.length ?? 0))
//     .slice(0, 6); // take top 6

//   return sorted;
// }

// export async function getMostPopularProducts() {
//   const result = await db
//     .select({
//       product: productsTable,
//       orderCount: sql<number>`COUNT(${ordersTable.id})`.as("orderCount"),
//     })
//     .from(productsTable)
//     .leftJoin(ordersTable, eq(productsTable.id, ordersTable.productId))
//     .where(eq(productsTable.isAvailableForPurchase, true))
//     .groupBy(productsTable.id)
//     .orderBy(desc(sql`COUNT(${ordersTable.id})`))
//     .limit(6);

//   return result;
// }

// export async function getMostPopularProducts() {
//   const result = await db
//     .select({
//       product: productsTable,
//     })
//     .from(productsTable)
//     .leftJoin(ordersTable, eq(productsTable.id, ordersTable.productId))
//     .where(eq(productsTable.isAvailableForPurchase, true))
//     // .groupBy(productsTable.id)
//     .orderBy(desc(sql`${ordersTable.createdAt}`))
//     .limit(6);

//   // Return only the product field if that's all you need
//   return result.map((row) => row.product);
// }

// without cache
// export async function getMostPopularProducts() {
//   const result = await db
//     .select({
//       product: productsTable,
//       lastOrderedAt: sql<Date>`MAX(${ordersTable.createdAt})`.as(
//         "lastOrderedAt"
//       ),
//     })
//     .from(productsTable)
//     .leftJoin(ordersTable, eq(productsTable.id, ordersTable.productId))
//     .where(eq(productsTable.isAvailableForPurchase, true))
//     .groupBy(productsTable.id)
//     .orderBy(desc(sql`MAX(${ordersTable.createdAt})`))
//     .limit(6);

//   return result.map((row) => row.product);
// }

// const getMostPopularProducts = cache(() => {
//   const result = db
//     .select({
//       product: productsTable,
//       lastOrderedAt: sql<Date>`MAX(${ordersTable.createdAt})`.as(
//         "lastOrderedAt"
//       ),
//     })
//     .from(productsTable)
//     .leftJoin(ordersTable, eq(productsTable.id, ordersTable.productId))
//     .where(eq(productsTable.isAvailableForPurchase, true))
//     .groupBy(productsTable.id)
//     .orderBy(desc(sql`MAX(${ordersTable.createdAt})`))
//     .limit(6);

//   return result.map((row) => row.product);
// }, ["/", "getMostPopularProducts"]);

// prisma

// const getNewestProducts = cache(() => {
//   return db.product.findMany({
//     where: { isAvailableForPurchase: true },
//     orderBy: { createdAt: "desc" },
//     take: 6,
//   })

// relatios method:
// export async function getNewestProducts() {
//   const result = await db.query.productsTable.findMany({
//     where: eq(productsTable.isAvailableForPurchase, true),
//     with: {
//       orders: true, // optional
//     },
//     orderBy: (products, { desc }) => [desc(products.createdAt)],
//     limit: 6,
//   });

//   return result;
// }

// without cache
// export async function getNewestProducts() {
//   const result = await db
//     .select()
//     .from(productsTable)
//     .where(eq(productsTable.isAvailableForPurchase, true))
//     .groupBy(productsTable.id)
//     .orderBy(desc(productsTable.createdAt))
//     .limit(6);

//   return result;
// }

import { getCurrentUser } from "@/auth/nextjs/currentUser";
import Link from "next/link";
import Guest from "@/components/guess";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  ordersTable,
  productsTable,
  productsTableInferSelect,
} from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { desc, eq, sql } from "drizzle-orm";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Suspense } from "react";
import { cache } from "@/lib/cache";

const getMostPopularProducts = cache(
  async () => {
    const result: {
      product: productsTableInferSelect;
      lastOrderedAt: Date | null;
    }[] = await db
      .select({
        product: productsTable,
        lastOrderedAt: sql<Date>`MAX(${ordersTable.createdAt})`.as(
          "lastOrderedAt"
        ),
      })
      .from(productsTable)
      .leftJoin(ordersTable, eq(productsTable.id, ordersTable.productId))
      .where(eq(productsTable.isAvailableForPurchase, true))
      .groupBy(productsTable.id)
      .orderBy(desc(sql`MAX(${ordersTable.createdAt})`))
      .limit(6);

    return result.map((row) => row.product);
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 24 }
);

const getNewestProducts = cache(async () => {
  const result = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isAvailableForPurchase, true))
    .groupBy(productsTable.id)
    .orderBy(desc(productsTable.createdAt))
    .limit(6);

  return result;
}, ["/", "getNewestProducts"]);

// ({
//   searchParams,
// }: {
//   searchParams: Promise<{ page: string }>;
// }
export default async function Home() {
  const user = await getCurrentUser({ withFullUser: true });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to Sleep Tracker</h1>
            <div className="flex space-x-4 mb-4">
              <Link
                href="/sign-in"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
        {/* Guess */}
        <div className="">
          <Guest />
        </div>
      </div>
    );
  }

  return (
    <main className="container space-y-12">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
      <ProductGridSection
        title="Most Populsr"
        productsFetcher={getMostPopularProducts}
      />
      <ProductGridSection title="Newest" productsFetcher={getNewestProducts} />
      {/* </div> */}
    </main>
  );
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<productsTableInferSelect[]>;
};

function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      {/* <div className="w-20 h-20 overflow-hidden border">
        <p>
          This is a long paragraph that will not be fully visible because
          overflow is hidden.
        </p>
      </div> */}

      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline">
          <Link href="/products" className="space-x-2">
            <span className="">View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<productsTableInferSelect[]>;
}) {
  return (await productsFetcher()).map((product) => (
    <ProductCard
      key={product.id}
      {...product}
      description={product.description ?? ""}
    /> // convert null to ""
  ));
}
