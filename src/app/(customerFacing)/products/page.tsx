import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { db } from "@/drizzle/db";
import { productsTable } from "@/drizzle/schema";
import { cache } from "@/lib/cache";
import { asc, eq } from "drizzle-orm";
import { Suspense } from "react";

// without cache
// function getProducts() {
//   return db
//     .select()
//     .from(productsTable)
//     .where(eq(productsTable.isAvailableForPurchase, true))
//     .orderBy(asc(productsTable.name));
// }

const getProducts = cache(() => {
  return db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isAvailableForPurchase, true))
    .orderBy(asc(productsTable.name));
}, ["/products", "getProducts"]);

export default function Products() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductsSuspense />
      </Suspense>
    </div>
  );
}

async function ProductsSuspense() {
  const products = await getProducts();
  return products.map((product) => (
    <ProductCard
      key={product.id}
      {...product}
      description={product.description ?? ""}
    />
  ));
}
