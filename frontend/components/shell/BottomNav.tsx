"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, SVGProps } from "react";
import {
  GamesIcon,
  HomeIcon,
  MoreIcon,
  WalletIcon,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/games", label: "Games", icon: GamesIcon },
  { href: "/wallet", label: "Wallet", icon: WalletIcon },
  { href: "/more", label: "More", icon: MoreIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-nim-border bg-nim-bg-deep/95 bg-nim-bg-deep/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-nim-primary"
                    : "text-nim-text-muted hover:text-nim-text-secondary"
                }`}
              >
                <Icon className="h-5.5 w-5.5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
