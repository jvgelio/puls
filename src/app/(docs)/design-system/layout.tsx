"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Visão Geral", href: "/design-system" },
  { name: "Cores", href: "/design-system/cores" },
  { name: "Tipografia", href: "/design-system/tipografia" },
  {
    name: "Componentes",
    href: "/design-system/componentes",
    children: [
      { name: "Button", href: "/design-system/componentes/button" },
      { name: "Card", href: "/design-system/componentes/card" },
      { name: "Badge", href: "/design-system/componentes/badge" },
      { name: "Patterns", href: "/design-system/componentes/patterns" },
    ],
  },
];

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/design-system" className="font-bold text-xl">
            PULS Design System
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar ao app
            </Link>
          </div>
        </div>
      </header>

      <div className="container flex gap-10 py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-colors",
                          pathname === child.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
