"use client";

import { emailOrderHistory, formState } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

export default function MyOrdersPage() {
  const formStatus: formState = {
    status: {
      error: "",
      message: "",
    },
  };
  const [data, action, isPending] = useActionState(
    emailOrderHistory,
    formStatus
  );

  return (
    <form action={action} className="max-2-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Enter your email and we will email you your order history and
            download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              required
              name="email"
              id="email"
              disabled={isPending}
            />
            {data.status.error && (
              <div className="text-destructive">{data.status.error}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-start w-full">
          {data.status.message && (
            <p className="text-green-600 text-sm">{data.status.message}</p>
          )}
          <SubmitButton isPending={isPending} />
        </CardFooter>
      </Card>
    </form>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button className="w-full" size="lg" disabled={isPending} type="submit">
      {isPending ? "Sending..." : "Send"}
    </Button>
  );
}
