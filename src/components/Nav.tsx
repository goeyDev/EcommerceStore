"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="bg-primary text-primary-foreground flex justify-center items-center px-4">
      {children}
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();
  const activeClass = "bg-background text-foreground";
  const normalClass =
    "p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visibler:text-secondary-foreground";

  return (
    <Link
      {...props}
      className={cn(normalClass, pathname === props.href && activeClass)}
    />
  );
}
