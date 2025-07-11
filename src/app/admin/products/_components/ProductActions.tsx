"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import {
  deleteProduct,
  toogleProductAvailability,
} from "../../_action/product";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ActiveToggleDropdownItemProps = {
  id: string;
  isAvailableForPurchase: boolean;
};

export function ActiveToggleDropdownItem({
  id,
  isAvailableForPurchase,
}: ActiveToggleDropdownItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await toogleProductAvailability(
            id,
            !isAvailableForPurchase
          );
          if ("status" in result && result.status?.error) {
            toast.error(result.status.message);
          } else {
            toast.success("Prouct availability updated");
          }
          router.refresh();
        });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}

type DeleteDropdownItemProps = {
  id: string;
  disabled: boolean;
};
export function DeleteDropdownItem({ id, disabled }: DeleteDropdownItemProps) {
  const [ispending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={disabled || ispending}
      onClick={() => {
        startTransition(async () => {
          const result = await deleteProduct(id);
          if ("status" in result && result.status?.error) {
            toast.error(result.status.message);
          } else {
            toast.success(result.message);
          }
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
