"use server";

import { requireUserId } from "@/auth/nextjs/currentUser";
import { db } from "@/drizzle/db";
import { downloadVerificationTable, userTable } from "@/drizzle/schema";
import OrderHistoryEmail from "@/email/OrderHistory";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export type statusType = {
  message?: string;
  error?: string;
};

export type formState = {
  status: statusType;
};

//  message?: string; error?: string
export async function emailOrderHistory(
  _prevState: formState,
  formData: FormData
): Promise<formState> {
  const result = emailSchema.safeParse(formData.get("email"));

  const userInfo = await requireUserId();
  const loggedInId = userInfo.id;

  if (result.success === false) {
    return { status: { error: "Invalid email address" } };
  }

  const userEmail = result.data;

  const user = await db.query.userTable.findFirst({
    where: and(eq(userTable.email, userEmail), eq(userTable.id, loggedInId)),
    with: {
      orders: {
        columns: {
          id: true,
          pricePaidInCents: true,
          createdAt: true,
        },
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
    columns: {
      email: true,
    },
  });

  console.log("All orders found:", user?.orders);
  if (user == null) {
    return {
      status: {
        message:
          "Check your email to view your order history and download your products.user == null",
      },
    };
  }

  const orders = await Promise.all(
    user.orders.map(async (order) => {
      const [verification] = await db
        .insert(downloadVerificationTable)
        .values({
          productId: order.product.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs
        })
        .returning({ id: downloadVerificationTable.id });

      return {
        // <-- Add return here
        ...order,
        downloadVerificationId: verification.id,
        product: {
          ...order.product,
          description: order.product.description ?? "", // fallback for null
        },
      };
    })
  );

  // console.log("Orders to send in email:", orders);
  // console.log("Number of orders:", orders.length);

  // orders={await Promise.all(orders)}
  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Order History",
    react: <OrderHistoryEmail orders={orders} />,
  });

  if (data.error) {
    return {
      status: {
        error:
          "There was an error sending your email. Please try again. data.error",
      },
    };
  }

  return {
    status: {
      message:
        "Check your email to view your order history and download your products. success",
    },
  };
}

// prisma
// const user = await db.user.findUnique({
//   where: { email: result.data },
//   select: {
//     email: true,
//     orders: {
//       select: {
//         pricePaidInCents: true,
//         id: true,
//         createdAt: true,
//         product: {
//           select: {
//             id: true,
//             name: true,
//             imagePath: true,
//             description: true,
//           },
//         },
//       },
//     },
//   },
// });

// const orders = user.orders.map(async (order) => {
//   return {
//     ...order,
//     downloadVerificationId: (
//       await db.downloadVerification.create({
//         data: {
//           expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
//           productId: order.product.id,
//         },
//       })
//     ).id,
//   };
// });

// const orders = await createDownloadLinksForOrders(user);

// async function getUserWithOrdersByEmail(email: string, loggedInId: string) {
//   const user = await db.query.userTable.findFirst({
//     where: and(eq(userTable.email, email), eq(userTable.id, loggedInId)),
//     with: {
//       orders: {
//         columns: {
//           id: true,
//           pricePaidInCents: true,
//           createdAt: true,
//         },
//         with: {
//           product: {
//             columns: {
//               id: true,
//               name: true,
//               imagePath: true,
//               description: true,
//             },
//           },
//         },
//       },
//     },
//     columns: {
//       email: true,
//     },
//   });

//   return user;
// }

// async function createDownloadLinksForOrders(user: any) {
//   const now = Date.now();

//   const orders = await Promise.all(
//     user.orders.map(async (order: any) => {
//       const [verification] = await db
//         .insert(downloadVerificationTable)
//         .values({
//           productId: order.product.id,
//           expiresAt: new Date(now + 24 * 60 * 60 * 1000), // 24 hours from now
//         })
//         .returning({ id: downloadVerificationTable.id });

//       return {
//         ...order,
//         downloadVerificationId: verification.id,
//       };
//     })
//   );

//   return orders;
// }
