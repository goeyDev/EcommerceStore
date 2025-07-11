import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { productsTable } from "@/drizzle/schema";
import { formatCurrency } from "@/lib/formatter";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { createDownloadVerification } from "./_components/download_verification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent: string }>;
}) {
  if (!(await searchParams)?.payment_intent) return notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(
    (await searchParams).payment_intent
  );
  if (paymentIntent.metadata.productId == null) return notFound();

  const queryProduct = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, paymentIntent.metadata.productId));

  const product = queryProduct[0];

  // const product = await db.product.findUnique({
  //   where: { id: paymentIntent.metadata.productId },
  // })
  if (product == null) return notFound();

  const isSuccess = paymentIntent.status === "succeeded";

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? "Success!" : "Error!"}
      </h1>
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
