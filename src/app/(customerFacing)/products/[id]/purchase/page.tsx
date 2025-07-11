import { db } from "@/drizzle/db";
import { productsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";
import { requireUserId } from "@/auth/nextjs/currentUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
type purchaseProps = {
  params: Promise<{ id: string }>;
};

export default async function Purchase({ params }: purchaseProps) {
  const { id } = await params;

  const userInfo = await requireUserId();
  const loggedInId = userInfo.id;
  const userEmail = userInfo.email;

  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, id),
  });
  if (!product) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "SGD",
    metadata: {
      productId: product.id,
      loggedInId,
      userEmail,
    },
  });

  if (paymentIntent.client_secret == null) {
    throw Error("Stripe failed to create payment intent.");
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
      userEmail={userEmail}
    />
  );
}
// use select approach
// const product = await db
//   .select()
//   .from(productsTable)
//   .where(eq(productsTable.id, id));

// if (product.length == 0) return notFound();

// const selectedProduct = product[0];
// await stripe.paymentIntents.create({
//   amount: selectedProduct.priceInCents,
//   currency: "SGD",
//   metadata: { productId: selectedProduct.id },
// });
