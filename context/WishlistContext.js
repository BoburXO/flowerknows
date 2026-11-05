"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const WishlistContext = createContext();

const STORAGE_KEY = "fk_wishlist";

function sanitize(raw) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id) => typeof id === "string" && id))];
}

function readStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? sanitize(JSON.parse(saved)) : [];
  } catch (e) {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistReady, setWishlistReady] = useState(false);

  useEffect(() => {
    setWishlist(readStorage());
    setWishlistReady(true);
  }, []);

  // never save before the first load, otherwise the saved list would be wiped
  useEffect(() => {
    if (!wishlistReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      /* ignore */
    }
  }, [wishlist, wishlistReady]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setWishlist(e.newValue ? sanitize(JSON.parse(e.newValue)) : []);
      } catch (err) {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const value = useMemo(
    () => ({
      wishlist,
      wishlistReady,
      toggleWishlist,
      clearWishlist,
      isInWishlist: (productId) => wishlist.includes(productId),
      wishlistCount: wishlist.length,
    }),
    [wishlist, wishlistReady, toggleWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
