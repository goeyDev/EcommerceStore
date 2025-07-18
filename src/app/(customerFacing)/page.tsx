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
            <h1 className="text-3xl font-bold">Welcome to goeyDev Ecommerce</h1>
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
      <ProductGridSection
        title="Most Populsr"
        productsFetcher={getMostPopularProducts}
      />
      <ProductGridSection title="Newest" productsFetcher={getNewestProducts} />
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
    />
  ));
}
