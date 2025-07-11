import { db } from "@/drizzle/db";
import {
  downloadVerificationTable,
  ordersTable,
  productsTable,
} from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const productId = charge.metadata.productId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;
    const userId = charge.metadata.loggedInId;

    // const product = await db.product.findUnique({ where: { id: productId } })
    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
    });
    if (product == null || email == null) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // const userId = product.userId;
    // console.log("userId from webhooks", userId);

    // ✅ 1. Insert new order for logged-in user
    await db.insert(ordersTable).values({
      userId, // already authenticated,from matadata,purchase page
      productId,
      pricePaidInCents,
    });

    // ✅ 2. Fetch latest order for this user
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(1);

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const [downloadVerification] = await db
      .insert(downloadVerificationTable)
      .values({
        productId,
        expiresAt,
      })
      .returning();

    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Order Confirmation",
      react: (
        <PurchaseReceiptEmail
          order={order}
          product={product}
          downloadVerificationId={downloadVerification.id}
        />
      ),
    });
  }

  return new NextResponse();
}

// return inserted row(s)

// const userFields = {
//   email,
//   orders: { create: { productId, pricePaidInCents } },
// };
// const {
//   orders: [order],
// } = await db.user.upsert({
//   where: { email },
//   create: userFields,
//   update: userFields,
//   select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
// });

// const downloadVerification = await db.downloadVerification.create({
//   data: {
//     productId,
//     expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
//   },
// });
