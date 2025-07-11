"use server";

// Firebase
import { uploadFileToFirebase } from "@/lib/uploadtofirebase";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";

// Firebase
import { getCurrentUser, requireUserId } from "@/auth/nextjs/currentUser";
import { db } from "@/drizzle/db";
import { productsTable } from "@/drizzle/schema";
import { inputFormState } from "@/types/shareType";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

// function getFirebasePath(fullUrl: string): string {
//   const bucket = process.env.FIREBASE_STORAGE_BUCKET!;
//   const prefix = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/`;

//   // Strip prefix and query params
//   return decodeURIComponent(fullUrl.replace(prefix, "").split("?")[0]);
// }

function getFirebasePath(url: string) {
  const base = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/`;
  return decodeURIComponent(url.replace(base, "").split("?")[0]);
}

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});

export async function addProduct(
  prevState: inputFormState,
  formData: FormData
): Promise<inputFormState> {
  const userInfo = await getCurrentUser({ withFullUser: true });

  if (!userInfo) {
    return {
      status: {
        error: true,
        message: "Please log In and try again",
      },
    };
  }

  const userId = userInfo.id;

  //   const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  //    This method only work without file object as it will turn all field to string

  const name = formData.get("name");
  const description = formData.get("description");
  const priceInCents = formData.get("priceInCents");
  const file = formData.get("filePath");
  const image = formData.get("imagePath");

  // ⛔ These might be strings or File objects, so check:
  if (!(file instanceof File) || !(image instanceof File)) {
    return {
      status: {
        error: true,
        message: "Both file and image are required",
      },
    };
  }

  const result = addSchema.safeParse({
    name,
    description,
    priceInCents,
    file,
    image,
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const fallbackMessage =
      fieldErrors.name?.[0] ||
      fieldErrors.description?.[0] ||
      fieldErrors.priceInCents?.[0] ||
      fieldErrors.file?.[0] ||
      fieldErrors.image?.[0] ||
      "Invalid input";

    return {
      status: {
        error: true,
        message: fallbackMessage,
      },
      fieldErrors,
    };
  }

  const data = result.data;

  //   File and Image during development stage - Local
  // await fs.mkdir("fileProducts", { recursive: true });
  // const filePath = `fileProducts/${crypto.randomUUID()}-${data.file.name}`;
  // await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  // await fs.mkdir("public/products", { recursive: true });
  // const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  // await fs.writeFile(
  //   `public${imagePath}`,
  //   Buffer.from(await data.image.arrayBuffer())
  // );

  // await db.insert(productsTable).values({
  //   userId: userId,
  //   name: data.name,
  //   description: data.description,
  //   priceInCents: data.priceInCents,
  //   isAvailableForPurchase: false,
  //   filePath,
  //   imagePath,
  // });

  const uploadedFile = await uploadFileToFirebase(data.file, "productFiles");
  const uploadedImage = await uploadFileToFirebase(data.image, "productImages");

  await db.insert(productsTable).values({
    userId,
    name: data.name,
    description: data.description,
    priceInCents: data.priceInCents,
    isAvailableForPurchase: false,
    filePath: uploadedFile.url,
    imagePath: uploadedImage.url,
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return {
    status: {
      success: true,
      message: "Product added to database.",
    },
  };
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(
  id: string,
  _prevState: inputFormState,
  formData: FormData
): Promise<inputFormState> {
  const user = await requireUserId();

  //   const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  //    This method only work without file object as it will turn all field to string

  const name = formData.get("name");
  const description = formData.get("description");
  const priceInCents = formData.get("priceInCents");
  const file = formData.get("filePath");
  const image = formData.get("imagePath");

  // ⛔ These might be strings or File objects, so check:
  // if (!(file instanceof File) || !(image instanceof File)) {
  //   return {
  //     status: {
  //       error: true,
  //       message: "Both file and image are required",
  //     },
  //   };
  // }

  const result = editSchema.safeParse({
    name,
    description,
    priceInCents,
    file,
    image,
  });

  // console.log("result", result.success);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const fallbackMessage =
      fieldErrors.name?.[0] ||
      fieldErrors.description?.[0] ||
      fieldErrors.priceInCents?.[0] ||
      fieldErrors.file?.[0] ||
      fieldErrors.image?.[0] ||
      "Invalid input";

    return {
      status: {
        error: true,
        message: fallbackMessage,
      },
      fieldErrors,
    };
  }

  const data = result.data;

  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, id),
  });

  //notFound();
  if (product == null)
    return {
      status: { error: true, message: "no product found." },
    };

  //   File and Image during development stage - Local
  // let filePath = product.filePath;
  // if (data.file != null && data.file.size > 0) {
  //   await fs.unlink(product.filePath);
  //   filePath = `fileProducts/${crypto.randomUUID()}-${data.file.name}`;
  //   await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  // }

  // let imagePath = product.imagePath;
  // if (data.image != null && data.image.size > 0) {
  //   await fs.unlink(`public/${product.imagePath}`);
  //   imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  //   await fs.writeFile(
  //     `public${imagePath}`,
  //     Buffer.from(await data.image.arrayBuffer())
  //   );
  // }

  // 🔁 Handle file replacement
  let filePath = product.filePath;
  if (data.file && data.file.size > 0) {
    if (product.filePath) {
      const fileRef = ref(storage, getFirebasePath(product.filePath));
      await deleteObject(fileRef).catch(() => {});
    }
    const uploaded = await uploadFileToFirebase(data.file, "productFiles");
    filePath = uploaded.url;
  }

  // 🔁 Handle image replacement
  let imagePath = product.imagePath;
  if (data.image && data.image.size > 0) {
    if (product.imagePath) {
      const imageRef = ref(storage, getFirebasePath(product.imagePath));
      await deleteObject(imageRef).catch(() => {});
    }
    const uploaded = await uploadFileToFirebase(data.image, "productImages");
    imagePath = uploaded.url;
  }

  await db
    .update(productsTable)
    .set({
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      isAvailableForPurchase: false,
      filePath,
      imagePath,
    })
    .where(and(eq(productsTable.id, id), eq(productsTable.userId, user.id)));

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return {
    status: {
      success: true,
      message: "Product added to database.",
    },
  };
}

export async function toogleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  try {
    const user = await requireUserId();
    await db
      .update(productsTable)
      .set({ isAvailableForPurchase })
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, user.id)));

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    return {
      status: {
        error: true,
        message: err instanceof Error ? err.message : "Unknown error",
      },
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const user = await requireUserId();
    const [product] = await db
      .delete(productsTable)
      .where(and(eq(productsTable.id, id), eq(productsTable.userId, user.id)))
      .returning();

    // Local
    // await fs.unlink(product.filePath);
    // await fs.unlink(`public/${product.imagePath}`);

    if (product.filePath) {
      const fileRef = ref(storage, getFirebasePath(product.filePath));
      await deleteObject(fileRef).catch(() => {});
    }

    if (product.imagePath) {
      const imageRef = ref(storage, getFirebasePath(product.imagePath));
      await deleteObject(imageRef).catch(() => {});
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return {
      success: true,
      message: `${product.name} was delete successfully.`,
    };
  } catch (err) {
    return {
      status: {
        error: true,
        message: err instanceof Error ? err.message : "Unknow error",
      },
    };
  }
}
