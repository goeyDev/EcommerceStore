"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatter";
import { useActionState, useEffect, useState } from "react";
import { updateProduct } from "../../_action/product";
import { inputFormState } from "@/types/shareType";
import { useRouter } from "next/navigation";
import { productsTableInferSelect } from "@/drizzle/schema";
import Image from "next/image";

//  Omit<productsTableInferSelect,"id">
export default function EditProductForm({
  product,
}: {
  product: productsTableInferSelect;
}) {
  const initState: inputFormState = { status: {} };
  const [state, updateProductAction, isPending] = useActionState(
    updateProduct.bind(null, product.id),
    initState
  );
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status.success) {
      router.push("/admin/products");
    }
  }, [state.status.success]);

  if (!product || !product.id) {
    return <p className="text-red-600">Invalid product data</p>;
  }

  return (
    <form action={updateProductAction} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ""}
        />
        {state.fieldErrors?.name && (
          <p className="text-red-600 text-sm">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents ?? ""}
          onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
        />
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
        {state.fieldErrors?.priceInCents && (
          <p className="text-red-600 text-sm">
            {state.fieldErrors.priceInCents[0]}
          </p>
        )}
      </div>
      <div className="">
        <Label htmlFor="quantity">Quantity</Label>
        <Input type="number" id="quantity" name="quantity" required />
        {state.fieldErrors?.quantity && (
          <p className="text-red-600 text-sm">
            {state.fieldErrors.quantity[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description ?? ""}
        />
        {state.fieldErrors?.description && (
          <p className="text-red-600 text-sm">
            {state.fieldErrors.description[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="filePath">File</Label>
        <Input
          type="file"
          id="filePath"
          name="filePath"
          required={product == null}
        />
        {product !== null && (
          <div className="text-muted-foreground">{product?.filePath}</div>
        )}
        {state.fieldErrors?.file && (
          <p className="text-red-600 text-sm">{state.fieldErrors.file[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="imagePath">Image</Label>
        <Input
          type="file"
          id="imagePath"
          name="imagePath"
          required={product == null}
        />
        {/* {product !== null && (
          <div className="text-muted-foreground">{product?.imagePath}</div>
        )} */}
        {product !== null && product?.imagePath !== undefined && (
          <Image
            src={product.imagePath}
            height="400"
            width="400"
            alt="Product Image"
            className="border border-red-500"
          />
        )}
        {state.fieldErrors?.image && (
          <p className="text-red-600 text-sm">{state.fieldErrors.image[0]}</p>
        )}
      </div>

      <div className="">
        {state.status.error && (
          <p className="text-red-600">{state.status.message}</p>
        )}
        {state.status.success && (
          <p className="text-green-600">{state.status.success}</p>
        )}
      </div>
      <div className="">
        <Button disabled={isPending} type="submit">
          {isPending ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
