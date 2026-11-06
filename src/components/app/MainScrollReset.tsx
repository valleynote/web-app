"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The app shell scrolls inside a persistent <main>. Without a reset, client
 * navigations keep the previous page's scrollTop and mid-page content looks clipped.
 */
export default function MainScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname]);

  return null;
}
