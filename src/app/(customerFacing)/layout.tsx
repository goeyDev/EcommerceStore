import { LogOutButton } from "@/auth/nextjs/components/LogOutButton";
import { getCurrentUser } from "@/auth/nextjs/currentUser";
import { Nav, NavLink } from "@/components/Nav";
import { ReactNode } from "react";

export const dynamic = "force-dynamic"; //instruct Nextjs not to cache

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser({ withFullUser: true });

  if (user) {
    return (
      <>
        <Nav>
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/orders">orders</NavLink>
          <LogOutButton />
        </Nav>
        <div className="container mx-auto my-12">{children}</div>;
      </>
    );
  }
  return <div className="container mx-auto my-12">{children}</div>;
}
