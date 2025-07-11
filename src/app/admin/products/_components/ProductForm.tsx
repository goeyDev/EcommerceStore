"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatter";
import { useActionState, useEffect, useState } from "react";
import { addProduct } from "../../_action/product";
import { inputFormState } from "@/types/shareType";
import { useRouter } from "next/navigation";
export default function ProductForm() {
  const initState: inputFormState = { status: {} };
  const [state, addProductAction, isPending] = useActionState(
    addProduct,
    initState
  );
  const [priceInCents, setPriceInCents] = useState<number | undefined>(0);
  const router = useRouter();

  useEffect(() => {
    if (state.status.success) {
      router.push("/admin/products");
    }
  }, [state.status.success]);

  return (
    <form action={addProductAction} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
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
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
        {state.fieldErrors?.description && (
          <p className="text-red-600 text-sm">
            {state.fieldErrors.description[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="filePath">File</Label>
        <Input type="file" id="filePath" name="filePath" required />
        {state.fieldErrors?.file && (
          <p className="text-red-600 text-sm">{state.fieldErrors.file[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="imagePath">Image</Label>
        <Input type="file" id="imagePath" name="imagePath" required />
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
          {isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  );
}
