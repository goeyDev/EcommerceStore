import { LogOutButton } from "@/auth/nextjs/components/LogOutButton";
import { getCurrentUser } from "@/auth/nextjs/currentUser";
import { Nav, NavLink } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { ReactNode } from "react";

export const dynamic = "force-dynamic"; //instruct Nextjs not to cache

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser({ withFullUser: true });

  if (user?.role == "admin") {
    return (
      <>
        <Nav>
          <NavLink href="/admin/">Dashboard</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/users">Users</NavLink>
          <NavLink href="/admin/orders">orders</NavLink>
          <LogOutButton />
        </Nav>
        <div className="container mx-auto my-6">{children}</div>;
      </>
    );
  }
  return (
    <div>
      <p>Unauthorization to access the admin page</p>
      <Button asChild variant="default">
        <Link href="/">Customers Home</Link>
      </Button>
    </div>
  );
}
