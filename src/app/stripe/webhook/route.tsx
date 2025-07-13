import { db } from "@/drizzle/db";
import {
  downloadVerificationTable,
  ordersTable,
  productsTable,
} from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/gSMTP";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  try {
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

      // ✅ 1. Insert new order for logged-in user
      await db.insert(ordersTable).values({
        userId, // already authenticated,from matadata,purchase page
        productId,
        pricePaidInCents,
      });

      console.log("ordersTable inserted");

      // ✅ 2. Fetch latest order for this user
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, userId))
        .orderBy(desc(ordersTable.createdAt))
        .limit(1);

      console.log("ordersTable calling");

      // Calculate expiry time (24 hours from now)
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      const [downloadVerification] = await db
        .insert(downloadVerificationTable)
        .values({
          productId,
          expiresAt,
        })
        .returning();

      //   await resend.emails.send({
      //     from: `Support <${process.env.SENDER_EMAIL}>`,
      //     to: email,
      //     subject: "Order Confirmation",
      //     react: (
      //       <PurchaseReceiptEmail
      //         order={order}
      //         product={product}
      //         downloadVerificationId={downloadVerification.id}
      //       />
      //     ),
      //   });
      // }

      await sendEmail({
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
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
