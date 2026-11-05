"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";

const CatalogContext = createContext({ categories: [], collections: [], lookbook: [], banners: [], refreshCatalog: () => {} });

/**
 * Categories, collections and lookbook posts come from the database.
 * The root layout loads them on the server, but Next.js does NOT re-render a layout on client-side
 * navigation — so we also re-fetch on every page change and when the tab becomes visible again.
 * (That is why collections added in the admin panel did not show up before.)
 */
export function CatalogProvider({
  initialCategories = [],
  initialCollections = [],
  initialLookbook = [],
  initialBanners = [],
  children,
}) {
  const pathname = usePathname();
  const [categories, setCategories] = useState(initialCategories);
  const [collections, setCollections] = useState(initialCollections);
  const [lookbook, setLookbook] = useState(initialLookbook);
  const [banners, setBanners] = useState(initialBanners);

  const refreshCatalog = useCallback(async () => {
    try {
      const [c, col, lb, bn] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/collections", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/lookbook", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/banners", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (c.success) setCategories(c.data);
      if (col.success) setCollections(col.data);
      if (lb.success) setLookbook(lb.data);
      if (bn.success) setBanners(bn.data);
    } catch (e) {
      /* keep old values */
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [pathname, refreshCatalog]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && refreshCatalog();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshCatalog]);

  const value = useMemo(
    () => ({ categories, collections, lookbook, banners, refreshCatalog }),
    [categories, collections, lookbook, banners, refreshCatalog]
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
