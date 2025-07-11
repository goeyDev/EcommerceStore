import PageHeader from "@/app/admin/_comnponents/PageHeader";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { productsTable } from "@/drizzle/schema"; // adjust path as needed
import EditProductForm from "../../_components/EditProductForm";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, id),
  });

  if (!product) {
    return <div>Product not found</div>;
  }
  // console.log("product:", product);
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <EditProductForm product={product} />
    </>
  );
}
