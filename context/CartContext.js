"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/config";

const CartContext = createContext();

const STORAGE_KEY = "fk_cart";

/** Only accept well-formed lines from localStorage (it can contain anything). */
function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") continue;
    const price = Number(it.price);
    const quantity = Math.round(Number(it.quantity));
    if (!it.cartItemId || !it.productId || !Number.isFinite(price) || price < 0) continue;
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    if (seen.has(it.cartItemId)) continue;
    seen.add(it.cartItemId);
    out.push({
      cartItemId: String(it.cartItemId),
      productId: String(it.productId),
      name: String(it.name || ""),
      nameRu: String(it.nameRu || ""),
      nameUz: String(it.nameUz || ""),
      collection: String(it.collection || ""),
      price,
      image: String(it.image || ""),
      shade: String(it.shade || ""),
      shadeRu: String(it.shadeRu || ""),
      shadeUz: String(it.shadeUz || ""),
      shadeId: String(it.shadeId || ""),
      shadeHex: String(it.shadeHex || "#D47A75"),
      stock: Number.isFinite(Number(it.stock)) ? Number(it.stock) : null,
      quantity: Math.min(quantity, 99),
    });
  }
  return out;
}

function readStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? sanitizeCart(JSON.parse(saved)) : [];
  } catch (e) {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  // `cartReady` becomes true after the saved cart was read from localStorage.
  // We must not write to localStorage before that, or an empty cart would overwrite the saved one.
  const [cartReady, setCartReady] = useState(false);
  const [cartNotice, setCartNotice] = useState(false);

  // 1) load once
  useEffect(() => {
    setCart(readStorage());
    setCartReady(true);
  }, []);

  // 2) save on every change (only after loading)
  useEffect(() => {
    if (!cartReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage full / private mode */
    }
  }, [cart, cartReady]);

  // 3) keep several tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setCart(e.newValue ? sanitizeCart(JSON.parse(e.newValue)) : []);
      } catch (err) {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 4) once per visit: compare the saved cart with the real catalog
  //    (price changed / product deleted / out of stock) — the server re-checks again on checkout.
  useEffect(() => {
    if (!cartReady) return;
    const ids = [...new Set(readStorage().map((i) => i.productId))];
    if (ids.length === 0) return;
    let cancelled = false;

    fetch(`/api/products?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled || !res.success) return;
        const byId = new Map(res.data.map((p) => [p.id, p]));
        let changed = false;

        setCart((prev) => {
          const next = [];
          for (const item of prev) {
            const p = byId.get(item.productId);
            if (!p || p.inStock === false || (p.stockCount ?? 0) <= 0) {
              changed = true;
              continue;
            }
            const shade = (p.shades || []).find((s) => s.id === item.shadeId) || (p.shades || []).find((s) => s.name === item.shade);
            if ((p.shades || []).length > 0 && !shade) {
              changed = true;
              continue;
            }
            const stock = Number(p.stockCount ?? 0);
            const quantity = Math.min(item.quantity, stock);
            const updated = {
              ...item,
              name: p.name,
              nameRu: p.nameRu || "",
              nameUz: p.nameUz || "",
              price: p.price,
              image: p.images?.[0] || item.image,
              collection: p.collection || item.collection,
              shade: shade?.name || item.shade,
              shadeRu: shade?.nameRu || "",
              shadeUz: shade?.nameUz || "",
              shadeId: shade?.id || item.shadeId,
              shadeHex: shade?.hex || item.shadeHex,
              stock,
              quantity,
            };
            if (updated.price !== item.price || updated.quantity !== item.quantity) changed = true;
            next.push(updated);
          }
          return next;
        });
        if (changed) setCartNotice(true);
      })
      .catch(() => {
        /* offline: keep what we have */
      });

    return () => {
      cancelled = true;
    };
  }, [cartReady]);

  const addToCart = useCallback((product, shade = null, quantity = 1) => {
    const selectedShade = shade || (product.shades && product.shades[0]) || null;
    const cartItemId = `${product.id}-${selectedShade?.id || selectedShade?.name || "std"}`;
    const stock = Number.isFinite(Number(product.stockCount)) ? Number(product.stockCount) : null;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        const max = stock ?? 99;
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, stock, quantity: Math.min(max, item.quantity + quantity, 99) }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          nameRu: product.nameRu || "",
          nameUz: product.nameUz || "",
          collection: product.collection || "",
          price: product.price,
          image: (product.images && product.images[0]) || "",
          shade: selectedShade?.name || "",
          shadeRu: selectedShade?.nameRu || "",
          shadeUz: selectedShade?.nameUz || "",
          shadeId: selectedShade?.id || "",
          shadeHex: selectedShade?.hex || "#D47A75",
          stock,
          quantity: Math.min(stock ?? 99, quantity, 99),
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.min(newQty, item.stock ?? 99, 99) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const dismissCartNotice = useCallback(() => setCartNotice(false), []);

  const value = useMemo(() => {
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = isFreeShipping || subtotal === 0 ? 0 : SHIPPING_COST;
    return {
      cart,
      cartReady,
      cartNotice,
      dismissCartNotice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItemsCount,
      subtotal,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      isFreeShipping,
      shippingCost,
      totalAmount: subtotal + shippingCost,
    };
  }, [cart, cartReady, cartNotice, dismissCartNotice, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
