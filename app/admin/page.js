"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice as _formatPrice, formatDate as _formatDate, BADGE_ADMIN_LABELS } from "@/lib/utils";

// the admin panel is Russian-only
const formatPrice = (n) => _formatPrice(n, "ru");
const formatDate = (d) => _formatDate(d, "ru");
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiArrowLeft,
  FiExternalLink,
  FiImage,
  FiTag,
  FiX,
  FiLayers,
  FiLogOut,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80";

const STATUS_LABELS = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  shipping: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const emptyProductForm = (categories, collections) => ({
  name: "",
  nameRu: "",
  nameUz: "",
  category: categories[0]?.id || "",
  collection: collections[0]?.id || "",
  price: "",
  oldPrice: "",
  stockCount: 20,
  inStock: true,
  badge: "YANGI",
  imagesText: DEFAULT_IMAGE,
  descriptionRu: "",
  descriptionUz: "",
  shades: [{ id: "s1", name: "01 Nude Pearl", nameRu: "", nameUz: "", hex: "#F9D5D3" }],
  featuresRu: "",
  featuresUz: "",
});

const emptyCategoryForm = { name: "", nameRu: "", nameUz: "", descriptionRu: "", descriptionUz: "" };
const emptyBannerForm = { image: "", title: "", link: "", active: true, sort: "" };
const emptyLookbookForm = { image: "", title: "", likes: 0, link: "", sort: "" };
const emptyCollectionForm = {
  name: "",
  nameRu: "",
  nameUz: "",
  descriptionRu: "",
  descriptionUz: "",
  image: DEFAULT_IMAGE,
  themeColor: "#F7D6D0",
  accent: "#D47A75",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);

  // access is checked by the server (signed httpOnly cookie), not by localStorage
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setStorageInfo(d.storage);
          setIsAuthenticated(true);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {}
    router.push("/admin/login");
  };

  const [activeTab, setActiveTab] = useState("overview"); // overview | products | orders | categories | collections | lookbook | banners
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [lookbook, setLookbook] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Search & Filter
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm([], []));

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  // Collection modal
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [collectionForm, setCollectionForm] = useState(emptyCollectionForm);

  // Banner modal (home page hero slider)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);

  // Lookbook modal
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [editingLookbookId, setEditingLookbookId] = useState(null);
  const [lookbookForm, setLookbookForm] = useState(emptyLookbookForm);

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // one place for every admin request: JSON, session expiry, readable errors
  const api = async (url, method = "GET", body) => {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      throw new Error("Сессия истекла. Войдите снова.");
    }
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (!res.ok || data.success === false) throw new Error(data.error || "Произошла ошибка");
    return data;
  };

  // Fetch all data (silent = background refresh, no spinner / no error toast)
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [s, p, o, c, col, lb, bn] = await Promise.all([
        api("/api/stats"),
        api("/api/products"),
        api("/api/orders"),
        api("/api/categories"),
        api("/api/collections"),
        api("/api/lookbook"),
        api("/api/banners?all=1"),
      ]);
      setStats(s.data);
      setProducts(p.data);
      setOrders(o.data);
      setCategories(c.data);
      setCollections(col.data);
      setLookbook(lb.data);
      setBanners(bn.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Ошибка загрузки данных админ-панели:", err);
      if (!silent) showNotification(err.message || "Не удалось загрузить данные", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // load after login + auto-refresh every 30 s so new orders appear without reloading the page
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchData(true);
    }, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  /* ------------------------------ products ------------------------------ */

  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm(categories, collections));
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      nameRu: product.nameRu || "",
      nameUz: product.nameUz || "",
      category: product.category,
      collection: product.collection,
      price: product.price,
      oldPrice: product.oldPrice || "",
      stockCount: product.stockCount !== undefined ? product.stockCount : 20,
      inStock: product.inStock !== false,
      badge: product.badge || "",
      imagesText: (product.images || []).join("\n"),
      descriptionRu: product.descriptionRu || "",
      descriptionUz: product.descriptionUz || product.description || "",
      shades: (product.shades || []).map((s) => ({ nameRu: "", nameUz: "", ...s })),
      featuresRu: (product.featuresRu || []).join("\n"),
      featuresUz: (product.featuresUz || product.features || []).join("\n"),
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showNotification("Укажите название и цену товара!", "error");
      return;
    }
    setFormLoading(true);
    try {
      const lines = (t) => t.split("\n").map((l) => l.trim()).filter(Boolean);
      const payload = {
        name: productForm.name,
        nameRu: productForm.nameRu,
        nameUz: productForm.nameUz,
        category: productForm.category,
        collection: productForm.collection,
        price: Number(productForm.price),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
        stockCount: Number(productForm.stockCount || 0),
        inStock: productForm.inStock,
        badge: productForm.badge,
        images: lines(productForm.imagesText),
        descriptionRu: productForm.descriptionRu,
        descriptionUz: productForm.descriptionUz,
        description: productForm.descriptionUz || productForm.descriptionRu,
        shades: productForm.shades,
        featuresRu: lines(productForm.featuresRu),
        featuresUz: lines(productForm.featuresUz),
        features: lines(productForm.featuresUz).length ? lines(productForm.featuresUz) : lines(productForm.featuresRu),
      };

      if (editingProductId) await api(`/api/products/${editingProductId}`, "PUT", payload);
      else await api("/api/products", "POST", payload);

      showNotification(editingProductId ? "Товар успешно обновлён!" : "Новый товар добавлен в магазин! 🌸");
      setIsProductModalOpen(false);
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Действительно удалить товар «${name}»?`)) return;
    try {
      await api(`/api/products/${id}`, "DELETE");
      showNotification("Товар удалён!");
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  /* ------------------------------- orders ------------------------------- */

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api(`/api/orders/${orderId}`, "PATCH", { status: newStatus });
      showNotification(`Статус заказа изменён: «${STATUS_LABELS[newStatus] || newStatus}»`);
      fetchData(true); // stock may change when an order is cancelled
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm(`Удалить заказ ${orderId} без возможности восстановления?`)) return;
    try {
      await api(`/api/orders/${orderId}`, "DELETE");
      showNotification("Заказ удалён");
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  /* ------------------------------ categories ----------------------------- */

  const openCategoryModal = (cat = null) => {
    setEditingCategoryId(cat ? cat.id : null);
    setCategoryForm(
      cat
        ? {
            name: cat.name || "",
            nameRu: cat.nameRu || "",
            nameUz: cat.nameUz || "",
            descriptionRu: cat.descriptionRu || "",
            descriptionUz: cat.descriptionUz || cat.description || "",
          }
        : emptyCategoryForm
    );
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.nameRu && !categoryForm.name) return;
    try {
      const payload = { ...categoryForm, name: categoryForm.name || categoryForm.nameRu };
      if (editingCategoryId) await api(`/api/categories/${editingCategoryId}`, "PUT", payload);
      else await api("/api/categories", "POST", payload);
      showNotification(editingCategoryId ? "Категория обновлена!" : "Новая категория добавлена!");
      setIsCategoryModalOpen(false);
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Удалить категорию «${cat.nameRu || cat.name}»?`)) return;
    try {
      await api(`/api/categories/${cat.id}`, "DELETE");
      showNotification("Категория удалена");
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  /* ------------------------------ collections ---------------------------- */

  const openCollectionModal = (col = null) => {
    setEditingCollectionId(col ? col.id : null);
    setCollectionForm(
      col
        ? {
            name: col.name || "",
            nameRu: col.nameRu || "",
            nameUz: col.nameUz || "",
            descriptionRu: col.descriptionRu || "",
            descriptionUz: col.descriptionUz || "",
            image: col.image || "",
            themeColor: col.themeColor || "#F7D6D0",
            accent: col.accent || "#D47A75",
          }
        : emptyCollectionForm
    );
    setIsCollectionModalOpen(true);
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!collectionForm.name) return;
    try {
      if (editingCollectionId) {
        await api(`/api/collections/${encodeURIComponent(editingCollectionId)}`, "PUT", collectionForm);
      } else {
        await api("/api/collections", "POST", collectionForm);
      }
      showNotification(editingCollectionId ? "Коллекция обновлена!" : "Новая коллекция добавлена!");
      setIsCollectionModalOpen(false);
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteCollection = async (col) => {
    if (!confirm(`Удалить коллекцию «${col.name}»?`)) return;
    try {
      await api(`/api/collections/${encodeURIComponent(col.id)}`, "DELETE");
      showNotification("Коллекция удалена");
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  /* ------------------------------- banners ------------------------------- */

  const openBannerModal = (banner = null) => {
    setEditingBannerId(banner ? banner.id : null);
    setBannerForm(
      banner
        ? {
            image: banner.image,
            title: banner.title || "",
            link: banner.link || "",
            active: banner.active !== false,
            sort: banner.sort ?? "",
          }
        : emptyBannerForm
    );
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...bannerForm };
      if (payload.sort === "") delete payload.sort;
      else payload.sort = Number(payload.sort);
      if (editingBannerId) await api(`/api/banners/${editingBannerId}`, "PUT", payload);
      else await api("/api/banners", "POST", payload);
      showNotification(editingBannerId ? "Баннер обновлён!" : "Баннер добавлен!");
      setIsBannerModalOpen(false);
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      await api(`/api/banners/${banner.id}`, "PUT", { active: banner.active === false });
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteBanner = async (banner) => {
    if (!confirm("Удалить этот баннер?")) return;
    try {
      await api(`/api/banners/${banner.id}`, "DELETE");
      showNotification("Баннер удалён");
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  /* ------------------------------- lookbook ------------------------------ */

  const openLookbookModal = (post = null) => {
    setEditingLookbookId(post ? post.id : null);
    setLookbookForm(
      post
        ? { image: post.image, title: post.title, likes: post.likes, link: post.link || "", sort: post.sort ?? "" }
        : emptyLookbookForm
    );
    setIsLookbookModalOpen(true);
  };

  const handleSaveLookbook = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...lookbookForm, likes: Number(lookbookForm.likes || 0) };
      if (payload.sort === "") delete payload.sort;
      else payload.sort = Number(payload.sort);
      if (editingLookbookId) await api(`/api/lookbook/${editingLookbookId}`, "PUT", payload);
      else await api("/api/lookbook", "POST", payload);
      showNotification(editingLookbookId ? "Пост обновлён!" : "Пост добавлен в лукбук!");
      setIsLookbookModalOpen(false);
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteLookbook = async (post) => {
    if (!confirm(`Удалить пост «${post.title}»?`)) return;
    try {
      await api(`/api/lookbook/${post.id}`, "DELETE");
      showNotification("Пост удалён");
      fetchData(true);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  // Shade helpers inside product form
  const handleAddShade = () => {
    const nextIdx = productForm.shades.length + 1;
    setProductForm({
      ...productForm,
      shades: [
        ...productForm.shades,
        { id: `s${Date.now()}`, name: `0${nextIdx} New Shade`, nameRu: "", nameUz: "", hex: "#E8DDD0" },
      ],
    });
  };

  const handleRemoveShade = (idx) => {
    setProductForm({
      ...productForm,
      shades: productForm.shades.filter((_, i) => i !== idx),
    });
  };

  const handleUpdateShade = (idx, field, value) => {
    const updated = [...productForm.shades];
    updated[idx] = { ...updated[idx], [field]: value };
    setProductForm({ ...productForm, shades: updated });
  };

  // Filtered Products
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.nameRu?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.collection?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered Orders
  const q = orderSearch.trim().toLowerCase();
  const filteredOrders = orders.filter(
    (o) =>
      (orderStatusFilter === "all" || o.status === orderStatusFilter) &&
      (!q ||
        o.id.toLowerCase().includes(q) ||
        (o.customer?.name || "").toLowerCase().includes(q) ||
        (o.customer?.phone || "").replace(/\D/g, "").includes(q.replace(/\D/g, "") || "~~"))
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#D47A75] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8C7A6B]">Проверка доступа администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D332A] flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-slideDown border ${
            notification.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-[#3D332A] text-white border-[#E8DDD0]/20"
          }`}
        >
          {notification.type === "error" ? (
            <FiAlertCircle size={18} />
          ) : (
            <FiCheckCircle className="text-[#D47A75]" size={18} />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#EFE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Admin Tag */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-serif-vintage text-xl font-bold tracking-widest uppercase text-[#3D332A] group-hover:text-[#D47A75] transition">
                  Flower Knows
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F5ECE3] text-[#D47A75] border border-[#E8DDD0]">
                  Admin Panel
                </span>
              </Link>
            </div>

            {/* Right: Store Link & Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF3EC] hover:bg-[#F2E5D9] text-[#5E5044] hover:text-[#3D332A] text-xs font-semibold border border-[#E8DDD0] transition"
              >
                <FiExternalLink size={14} className="text-[#D47A75]" />
                <span className="hidden sm:inline">В магазин</span>
              </Link>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#D47A75] to-[#E8A598] hover:from-[#C46863] hover:to-[#D47A75] text-white text-xs font-bold tracking-wider shadow-sm transition"
              >
                <FiPlus size={16} />
                <span>Добавить товар</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-[#FAF3EC] hover:bg-red-50 text-[#7E6F62] hover:text-red-600 transition"
                title="Выйти"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto text-xs font-bold border-t border-[#F5ECE3]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "overview"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiLayers size={14} />
            <span>Обзор</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "products"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiPackage size={14} />
            <span>Товары ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "orders"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiShoppingBag size={14} />
            <span>Заказы ({orders.length})</span>
            {stats?.pendingOrders > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#D47A75] text-white rounded-full text-[10px]">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "categories"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiTag size={14} />
            <span>Категории ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("collections")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "collections"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiLayers size={14} />
            <span>Коллекции ({collections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("banners")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "banners"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiImage size={14} />
            <span>Баннеры ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("lookbook")}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "lookbook"
                ? "border-[#D47A75] text-[#D47A75]"
                : "border-transparent text-[#7E6F62] hover:text-[#3D332A]"
            }`}
          >
            <FiImage size={14} />
            <span>Лукбук ({lookbook.length})</span>
          </button>

          <button
            onClick={() => fetchData()}
            className="ml-auto py-3 flex items-center gap-1.5 text-[#7E6F62] hover:text-[#D47A75] transition whitespace-nowrap"
            title="Обновить данные"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline font-medium">
              {lastUpdated ? `Обновлено ${lastUpdated.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` : "Обновить"}
            </span>
          </button>
        </div>
      </header>

      {storageInfo && !storageInfo.writable && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold px-4 py-3 text-center">
          ⚠️ Хранилище данных не подключено: изменения и новые заказы НЕ сохраняются. Подключите Upstash Redis
          (UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN) — инструкция в README.
        </div>
      )}
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW / STATS */}
        {/* ============================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8C7A6B] font-semibold uppercase">
                  <span>Общая выручка</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FAF3EC] text-[#D47A75] flex items-center justify-center">
                    <FiDollarSign size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif-vintage text-[#3D332A]">
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block">
                  Все неотменённые заказы
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8C7A6B] font-semibold uppercase">
                  <span>Всего заказов</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FAF3EC] text-[#D47A75] flex items-center justify-center">
                    <FiShoppingBag size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif-vintage text-[#3D332A]">
                  {stats?.totalOrders || 0}
                </div>
                <span className="text-[11px] text-[#7E6F62]">
                  Ожидают: <strong className="text-[#D47A75]">{stats?.pendingOrders || 0}</strong>
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8C7A6B] font-semibold uppercase">
                  <span>Товаров</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FAF3EC] text-[#D47A75] flex items-center justify-center">
                    <FiPackage size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif-vintage text-[#3D332A]">
                  {stats?.totalProducts || 0}
                </div>
                <span className="text-[11px] text-[#7E6F62]">
                  в {categories.length} категориях
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8C7A6B] font-semibold uppercase">
                  <span>Заканчивается</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiAlertCircle size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif-vintage text-[#3D332A]">
                  {stats?.lowStockCount || 0}
                </div>
                <span className="text-[11px] text-amber-700 font-semibold">
                  Остаток &le; 10 шт.
                </span>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#EFE6DC] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
                    Последние заказы
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#D47A75] font-semibold hover:underline"
                  >
                    Смотреть все →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#F5ECE3] text-[#8C7A6B] uppercase font-semibold">
                        <th className="pb-3">Заказ</th>
                        <th className="pb-3">Клиент</th>
                        <th className="pb-3">Сумма</th>
                        <th className="pb-3">Статус</th>
                        <th className="pb-3">Дата</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF6F0]">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF6F0]/60 transition">
                          <td className="py-3 font-bold text-[#3D332A]">{order.id}</td>
                          <td className="py-3">
                            <span className="font-semibold block">{order.customer?.name}</span>
                            <span className="text-[#8C7A6B] text-[11px]">{order.customer?.phone}</span>
                          </td>
                          <td className="py-3 font-semibold text-[#D47A75]">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                order.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : order.status === "shipping"
                                  ? "bg-blue-50 text-blue-700"
                                  : order.status === "cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="py-3 text-[#8C7A6B] text-[11px]">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <p className="text-center text-xs text-[#8C7A6B] py-8">Заказов пока нет. Новые заказы появятся здесь автоматически.</p>
                  )}
                </div>
              </div>

              {/* Collections Summary (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EFE6DC] shadow-xs space-y-4">
                <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
                  Коллекции
                </h3>
                <div className="space-y-3">
                  {collections.map((c) => {
                    const count = products.filter((p) => p.collection === c.id).length;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#EFE6DC]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shrink-0">
                            <img src={c.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#3D332A]">{c.name}</h4>
                            <span className="text-[10px] text-[#8C7A6B]">{c.nameRu}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#D47A75] px-2 py-0.5 rounded-full bg-white border border-[#E8DDD0]">
                          {count} шт.
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#EFE6DC]">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Название товара или коллекция..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD0] text-xs focus:outline-hidden focus:border-[#D47A75]"
                />
                <FiSearch className="absolute left-3 top-2.5 text-[#8C7A6B]" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <a
                  href="/api/admin/export?type=products"
                  download
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#5E5044] border border-[#E8DDD0] hover:border-[#D47A75] text-xs font-bold shadow-xs transition"
                  title="Скачать все товары одним JSON-файлом"
                >
                  <FiDownload size={16} className="text-[#D47A75]" />
                  <span>Скачать JSON</span>
                </a>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D47A75] to-[#E8A598] text-white text-xs font-bold shadow-xs hover:shadow-md transition"
                >
                  <FiPlus size={16} />
                  <span>Добавить товар</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-[#EFE6DC] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF3EC] border-b border-[#EFE6DC] text-[#7E6F62] uppercase font-semibold">
                    <tr>
                      <th className="p-4">Фото и название</th>
                      <th className="p-4">Категория / Коллекция</th>
                      <th className="p-4">Цена (сум)</th>
                      <th className="p-4">На складе</th>
                      <th className="p-4">Оттенки</th>
                      <th className="p-4">Бейдж</th>
                      <th className="p-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5ECE3]">
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-[#8C7A6B]">
                          Товаров не найдено
                        </td>
                      </tr>
                    )}
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF6F0]/50 transition">
                        {/* Image & Title */}
                        <td className="p-4">
                          <div className="flex items-center gap-3 max-w-xs">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#EFE6DC]">
                              <img
                                src={(p.images && p.images[0]) || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold font-serif-vintage text-sm text-[#3D332A] line-clamp-1">
                                {p.name}
                              </h4>
                              <span className="text-[10px] text-[#8C7A6B]">ID: {p.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Collection */}
                        <td className="p-4">
                          <span className="font-semibold block text-[#3D332A]">
                            {p.collection}
                          </span>
                          <span className="text-[11px] text-[#8C7A6B]">
                            {categories.find((c) => c.id === p.category)?.nameRu || p.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="p-4">
                          <span className="font-bold text-[#3D332A] block">
                            {formatPrice(p.price)}
                          </span>
                          {p.oldPrice && (
                            <span className="text-[10px] text-[#8C7A6B] line-through">
                              {formatPrice(p.oldPrice)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stockCount <= 10
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {p.stockCount} шт.
                          </span>
                        </td>

                        {/* Shades */}
                        <td className="p-4">
                          <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                            {(p.shades || []).map((sh, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                                style={{ backgroundColor: sh.hex || "#E8DDD0" }}
                                title={sh.name}
                              />
                            ))}
                          </div>
                        </td>

                        {/* Badge */}
                        <td className="p-4">
                          {p.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3EC] text-[#8B4844] border border-[#E8DDD0]">
                              {BADGE_ADMIN_LABELS[p.badge] || p.badge}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3EC] text-[#5E5044] hover:text-[#D47A75] transition border border-[#E8DDD0]"
                              title="Редактировать"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                              title="Удалить"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ORDERS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto bg-white p-3 rounded-3xl border border-[#EFE6DC]">
              <span className="text-xs font-semibold text-[#8C7A6B] ml-2">Статус:</span>
              {[
                { id: "all", label: "Все" },
                { id: "pending", label: "Ожидают" },
                { id: "confirmed", label: "Подтверждены" },
                { id: "shipping", label: "В доставке" },
                { id: "delivered", label: "Доставлены" },
                { id: "cancelled", label: "Отменены" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    orderStatusFilter === st.id
                      ? "bg-[#D47A75] text-white shadow-xs"
                      : "bg-[#FAF6F0] text-[#5E5044] hover:bg-[#F2EAE0]"
                  }`}
                >
                  {st.label}
                </button>
              ))}
              <input
                type="text"
                placeholder="Поиск: номер, имя, телефон"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="ml-auto min-w-[180px] px-3.5 py-1.5 rounded-full bg-[#FAF6F0] border border-[#E8DDD0] text-xs focus:outline-hidden focus:border-[#D47A75]"
              />
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE6DC] space-y-2">
                  <FiShoppingBag className="mx-auto text-[#D47A75]" size={32} />
                  <h4 className="font-serif-vintage text-lg font-bold text-[#3D332A]">
                    В этой категории заказов нет
                  </h4>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F5ECE3] gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-serif-vintage font-bold text-base text-[#3D332A]">
                          {order.id}
                        </span>
                        <span className="text-xs text-[#8C7A6B]">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      {/* Status Change Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8C7A6B]">Статус:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-[#E8DDD0] text-xs font-bold bg-[#FAF6F0] text-[#3D332A] focus:outline-hidden"
                        >
                          <option value="pending">Ожидает</option>
                          <option value="confirmed">Подтверждён</option>
                          <option value="shipping">В доставке</option>
                          <option value="delivered">Доставлен</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                          title="Удалить заказ"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Items Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                      {/* Customer info (5 cols) */}
                      <div className="md:col-span-5 space-y-1.5 bg-[#FAF6F0] p-4 rounded-2xl">
                        <div className="font-bold text-[#3D332A] text-sm">
                          {order.customer?.name}
                        </div>
                        <div className="text-[#66584C]">
                          Телефон: <strong>{order.customer?.phone}</strong>
                        </div>
                        <div className="text-[#66584C]">
                          Адрес: {order.customer?.city}, {order.customer?.address}
                        </div>
                        {order.customer?.note && (
                          <div className="text-[#8C7A6B] italic pt-1">
                            Комментарий: «{order.customer?.note}»
                          </div>
                        )}
                        <div className="pt-2 text-[11px] font-semibold text-[#8B4844]">
                          Оплата: {order.paymentMethod}
                        </div>
                      </div>

                      {/* Ordered items list (7 cols) */}
                      <div className="md:col-span-7 space-y-2">
                        <span className="font-bold text-[#5E5044] block mb-1">
                          Товары в заказе:
                        </span>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {(order.items || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-xl bg-[#FFFDFB] border border-[#EFE6DC]"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#3D332A] line-clamp-1">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-[#8C7A6B]">
                                    Оттенок: {item.shade || "—"} • {item.quantity} шт.
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-[#D47A75]">
                                {formatPrice(item.price * (item.quantity || 1))}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order total */}
                        {order.shippingCost > 0 && (
                          <div className="flex justify-between items-center text-[11px] text-[#8C7A6B]">
                            <span>Доставка:</span>
                            <span>{formatPrice(order.shippingCost)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-[#F5ECE3] font-bold text-sm">
                          <span>Итого:</span>
                          <span className="text-base text-[#D47A75]">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: CATEGORIES */}
        {/* ============================================================== */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-[#EFE6DC]">
              <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
                Существующие категории
              </h3>
              <button
                onClick={() => openCategoryModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold"
              >
                <FiPlus />
                <span>Новая категория</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif-vintage text-base font-bold text-[#3D332A]">
                        {cat.nameRu || cat.name}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF3EC] text-[#D47A75] font-bold">
                        {count} тов.
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C7A6B]">UZ: {cat.nameUz || cat.name}</p>
                    <p className="text-xs text-[#7E6F62] leading-relaxed">
                      {cat.descriptionRu || cat.description || "Эксклюзивный раздел Flower Knows"}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#FAF6F0]">
                      <span className="text-[10px] text-[#8C7A6B]">ID: {cat.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCategoryModal(cat)}
                          className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3EC] text-[#5E5044] hover:text-[#D47A75] transition border border-[#E8DDD0]"
                          title="Редактировать"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                          title="Удалить"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: COLLECTIONS */}
        {/* ============================================================== */}
        {activeTab === "collections" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-[#EFE6DC]">
              <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
                Коллекции магазина
              </h3>
              <button
                onClick={() => openCollectionModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold"
              >
                <FiPlus />
                <span>Новая коллекция</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => {
                const count = products.filter((p) => p.collection === col.id).length;
                return (
                  <div
                    key={col.id}
                    className="p-4 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#EFE6DC]">
                        <img src={col.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif-vintage text-base font-bold text-[#3D332A] truncate">
                          {col.name}
                        </h4>
                        <p className="text-[11px] text-[#8C7A6B] truncate">
                          {col.nameRu} / {col.nameUz}
                        </p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF3EC] text-[#D47A75] font-bold">
                          {count} тов.
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#7E6F62] leading-relaxed line-clamp-2">
                      {col.descriptionRu}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#FAF6F0]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: col.themeColor }} />
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: col.accent }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCollectionModal(col)}
                          className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3EC] text-[#5E5044] hover:text-[#D47A75] transition border border-[#E8DDD0]"
                          title="Редактировать"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(col)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                          title="Удалить"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* TAB 7: BANNERS (hero slider on the home page) */}
        {/* ============================================================== */}
        {activeTab === "banners" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-[#EFE6DC]">
              <div>
                <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">Баннеры главной страницы</h3>
                <p className="text-[11px] text-[#8C7A6B]">
                  Слайдер в верхней части главной. Слайды меняются каждые 3 секунды в заданном порядке.
                </p>
              </div>
              <button
                onClick={() => openBannerModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold"
              >
                <FiPlus />
                <span>Добавить баннер</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`rounded-3xl bg-white border border-[#EFE6DC] shadow-xs overflow-hidden ${
                    banner.active === false ? "opacity-60" : ""
                  }`}
                >
                  <div className="h-44 bg-[#FAF6F0] relative">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    {banner.active === false && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                        Скрыт
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs">
                      <p className="font-bold text-[#3D332A] truncate">{banner.title || "Без названия"}</p>
                      {banner.link && <p className="text-[10px] text-[#8C7A6B] truncate">→ {banner.link}</p>}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#FAF6F0]">
                      <span className="text-[10px] text-[#8C7A6B]">Порядок: {banner.sort}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBanner(banner)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3EC] text-[#5E5044] text-[10px] font-bold transition border border-[#E8DDD0]"
                        >
                          {banner.active === false ? "Показать" : "Скрыть"}
                        </button>
                        <button
                          onClick={() => openBannerModal(banner)}
                          className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3EC] text-[#5E5044] hover:text-[#D47A75] transition border border-[#E8DDD0]"
                          title="Редактировать"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                          title="Удалить"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="col-span-full text-center text-xs text-[#8C7A6B] py-10">
                  Баннеров нет — на главной показывается стандартное изображение
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: LOOKBOOK (Instagram posts on the home page) */}
        {/* ============================================================== */}
        {activeTab === "lookbook" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-[#EFE6DC]">
              <div>
                <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">Лукбук (посты Instagram)</h3>
                <p className="text-[11px] text-[#8C7A6B]">Показываются на главной странице. Если постов нет — блок скрывается.</p>
              </div>
              <button
                onClick={() => openLookbookModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold"
              >
                <FiPlus />
                <span>Добавить пост</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lookbook.map((post) => (
                <div key={post.id} className="rounded-3xl bg-white border border-[#EFE6DC] shadow-xs overflow-hidden">
                  <div className="aspect-square bg-[#FAF6F0]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#3D332A] truncate">{post.title}</span>
                      <span className="text-[#D47A75] font-semibold shrink-0">♥ {post.likes}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#FAF6F0]">
                      <span className="text-[10px] text-[#8C7A6B]">Порядок: {post.sort}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openLookbookModal(post)}
                          className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FAF3EC] text-[#5E5044] hover:text-[#D47A75] transition border border-[#E8DDD0]"
                          title="Редактировать"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteLookbook(post)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200"
                          title="Удалить"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {lookbook.length === 0 && (
                <p className="col-span-full text-center text-xs text-[#8C7A6B] py-10">Постов пока нет</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setIsProductModalOpen(false)} />

          <div className="relative bg-[#FAF6F0] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E8DDD0] z-10 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EFE6DC] bg-[#FAF3EC] flex items-center justify-between">
              <h2 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
                {editingProductId ? "Редактирование товара" : "Добавление нового товара Flower Knows"}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-white text-[#7E6F62] hover:text-[#3D332A]"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Название товара (основное) *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Swan Ballet Embossed Blush"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <input
                    type="text"
                    placeholder="Название на русском (необязательно)"
                    value={productForm.nameRu}
                    onChange={(e) => setProductForm({ ...productForm, nameRu: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden focus:border-[#D47A75]"
                  />
                  <input
                    type="text"
                    placeholder="Название на узбекском (необязательно)"
                    value={productForm.nameUz}
                    onChange={(e) => setProductForm({ ...productForm, nameUz: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden focus:border-[#D47A75]"
                  />
                </div>
              </div>

              {/* Category & Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Категория *</label>
                  <select
                    value={productForm.category}
                    required
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameRu || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Коллекция *</label>
                  <select
                    value={productForm.collection}
                    required
                    onChange={(e) => setProductForm({ ...productForm, collection: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                  >
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.nameRu})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Old Price, Stock, Badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Цена (сум) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="280000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Старая цена</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="340000"
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">На складе (шт.)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Бейдж</label>
                  <select
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold focus:outline-hidden focus:border-[#D47A75]"
                  >
                    <option value="">— без бейджа —</option>
                    {Object.entries(BADGE_ADMIN_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#5E5044] cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-4 h-4 rounded-md accent-[#D47A75] cursor-pointer"
                />
                <span>Товар в наличии (покупатели могут его заказать)</span>
              </label>

              {/* Image URLs & Preview */}
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">
                  Ссылки на изображения (по одной в строке, первая — главная)
                </label>
                <div className="flex gap-3 items-start">
                  <textarea
                    rows={3}
                    placeholder="https://..."
                    value={productForm.imagesText}
                    onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden focus:border-[#D47A75]"
                  />
                  <div className="flex gap-1.5 flex-wrap w-24 shrink-0">
                    {productForm.imagesText
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((url, i) => (
                        <div key={i} className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-[#E8DDD0]">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 items-center mt-2 text-[10px] text-[#8C7A6B] flex-wrap">
                  <span>Быстрые примеры:</span>
                  {[
                    ["Румяна", "photo-1596462502278-27bfdc403348"],
                    ["Помада", "photo-1586495777744-4413f21062fa"],
                    ["Тени", "photo-1512496015851-a90fb38ba796"],
                    ["Зеркало", "photo-1616683693504-3ea7e9ad6fec"],
                  ].map(([label, id]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          imagesText: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`,
                        })
                      }
                      className="text-[#D47A75] hover:underline"
                    >
                      [{label}]
                    </button>
                  ))}
                </div>
              </div>

              {/* Shades */}
              <div className="space-y-2 pt-2 border-t border-[#EFE6DC]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#5E5044]">Оттенки (цвета):</label>
                  <button
                    type="button"
                    onClick={handleAddShade}
                    className="text-xs text-[#D47A75] font-bold hover:underline flex items-center gap-1"
                  >
                    <FiPlus /> Добавить оттенок
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {productForm.shades.map((shade, idx) => (
                    <div
                      key={shade.id || idx}
                      className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E8DDD0]"
                    >
                      <input
                        type="color"
                        value={shade.hex || "#E8DDD0"}
                        onChange={(e) => handleUpdateShade(idx, "hex", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 shrink-0"
                        title="Выбрать цвет"
                      />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        <input
                          type="text"
                          value={shade.name}
                          onChange={(e) => handleUpdateShade(idx, "name", e.target.value)}
                          placeholder="Название (01 Nude Pearl)"
                          className="px-2.5 py-1 text-xs border border-[#EFE6DC] rounded-lg"
                        />
                        <input
                          type="text"
                          value={shade.nameRu || ""}
                          onChange={(e) => handleUpdateShade(idx, "nameRu", e.target.value)}
                          placeholder="Перевод RU"
                          className="px-2.5 py-1 text-xs border border-[#EFE6DC] rounded-lg"
                        />
                        <input
                          type="text"
                          value={shade.nameUz || ""}
                          onChange={(e) => handleUpdateShade(idx, "nameUz", e.target.value)}
                          placeholder="Перевод UZ"
                          className="px-2.5 py-1 text-xs border border-[#EFE6DC] rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveShade(idx)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description & Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EFE6DC]">
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Описание (RU)</label>
                  <textarea
                    rows={3}
                    value={productForm.descriptionRu}
                    onChange={(e) => setProductForm({ ...productForm, descriptionRu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Описание (UZ)</label>
                  <textarea
                    rows={3}
                    value={productForm.descriptionUz}
                    onChange={(e) => setProductForm({ ...productForm, descriptionUz: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">
                    Особенности (RU, каждая строка — один пункт)
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.featuresRu}
                    onChange={(e) => setProductForm({ ...productForm, featuresRu: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">
                    Особенности (UZ, каждая строка — один пункт)
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.featuresUz}
                    onChange={(e) => setProductForm({ ...productForm, featuresUz: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#EFE6DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white text-[#7E6F62] border border-[#E8DDD0] text-xs font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D47A75] to-[#E8A598] text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
                >
                  {formLoading ? "Сохранение..." : "Сохранить и опубликовать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ============================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsCategoryModalOpen(false)} />

          <div className="relative bg-[#FAF6F0] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DDD0] z-10 animate-scaleUp space-y-4">
            <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
              {editingCategoryId ? "Редактирование категории" : "Новая категория"}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Название (RU) *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Уход за кожей"
                  value={categoryForm.nameRu}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameRu: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Название (UZ) *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Teri parvarishi"
                  value={categoryForm.nameUz}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameUz: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Название (EN, необязательно)</label>
                <input
                  type="text"
                  placeholder="Skincare"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Краткое описание (RU)</label>
                <input
                  type="text"
                  value={categoryForm.descriptionRu}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descriptionRu: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Краткое описание (UZ)</label>
                <input
                  type="text"
                  value={categoryForm.descriptionUz}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descriptionUz: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white text-xs font-bold border border-[#E8DDD0]"
                >
                  Отмена
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-xs">
                  {editingCategoryId ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT COLLECTION */}
      {/* ============================================================== */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsCollectionModalOpen(false)} />

          <div className="relative bg-[#FAF6F0] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DDD0] z-10 animate-scaleUp space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
              {editingCollectionId ? "Редактирование коллекции" : "Новая коллекция"}
            </h3>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">
                  Название коллекции (EN) *{editingCollectionId ? " — изменить нельзя" : ""}
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingCollectionId)}
                  placeholder="Например: Velvet Garden"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden disabled:opacity-60"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Название (RU)</label>
                  <input
                    type="text"
                    value={collectionForm.nameRu}
                    onChange={(e) => setCollectionForm({ ...collectionForm, nameRu: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Название (UZ)</label>
                  <input
                    type="text"
                    value={collectionForm.nameUz}
                    onChange={(e) => setCollectionForm({ ...collectionForm, nameUz: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Описание (RU)</label>
                <input
                  type="text"
                  value={collectionForm.descriptionRu}
                  onChange={(e) => setCollectionForm({ ...collectionForm, descriptionRu: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Описание (UZ)</label>
                <input
                  type="text"
                  value={collectionForm.descriptionUz}
                  onChange={(e) => setCollectionForm({ ...collectionForm, descriptionUz: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Ссылка на изображение</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={collectionForm.image}
                    onChange={(e) => setCollectionForm({ ...collectionForm, image: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-[#E8DDD0] shrink-0">
                    <img src={collectionForm.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs font-bold text-[#5E5044]">
                <label className="flex items-center gap-2">
                  Фон
                  <input
                    type="color"
                    value={collectionForm.themeColor}
                    onChange={(e) => setCollectionForm({ ...collectionForm, themeColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                </label>
                <label className="flex items-center gap-2">
                  Акцент
                  <input
                    type="color"
                    value={collectionForm.accent}
                    onChange={(e) => setCollectionForm({ ...collectionForm, accent: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white text-xs font-bold border border-[#E8DDD0]"
                >
                  Отмена
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-xs">
                  {editingCollectionId ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT BANNER */}
      {/* ============================================================== */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsBannerModalOpen(false)} />
          <div className="relative bg-[#FAF6F0] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DDD0] z-10 animate-scaleUp space-y-4">
            <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
              {editingBannerId ? "Редактирование баннера" : "Новый баннер"}
            </h3>
            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Ссылка на изображение *</label>
                <input
                  type="text"
                  required
                  placeholder="https://...  или  /h1.jpg (файл из папки public)"
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
                {bannerForm.image && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden bg-white border border-[#E8DDD0]">
                    <img src={bannerForm.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Название (alt-текст для SEO)</label>
                <input
                  type="text"
                  placeholder="Flower Knows Swan Ballet"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Ссылка при клике (необязательно)</label>
                <input
                  type="text"
                  placeholder="/catalog?collection=Swan%20Ballet"
                  value={bannerForm.link}
                  onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Порядок</label>
                  <input
                    type="number"
                    placeholder="авто"
                    value={bannerForm.sort}
                    onChange={(e) => setBannerForm({ ...bannerForm, sort: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#5E5044] cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#D47A75] cursor-pointer"
                  />
                  <span>Показывать на сайте</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white text-xs font-bold border border-[#E8DDD0]"
                >
                  Отмена
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-xs">
                  {editingBannerId ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT LOOKBOOK POST */}
      {/* ============================================================== */}
      {isLookbookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsLookbookModalOpen(false)} />
          <div className="relative bg-[#FAF6F0] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DDD0] z-10 animate-scaleUp space-y-4">
            <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
              {editingLookbookId ? "Редактирование поста" : "Новый пост лукбука"}
            </h3>
            <form onSubmit={handleSaveLookbook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Ссылка на фото *</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={lookbookForm.image}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, image: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                  {lookbookForm.image && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-[#E8DDD0] shrink-0">
                      <img src={lookbookForm.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Заголовок *</label>
                <input
                  type="text"
                  required
                  placeholder="#SwanBalletLook"
                  value={lookbookForm.title}
                  onChange={(e) => setLookbookForm({ ...lookbookForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Лайки</label>
                  <input
                    type="number"
                    min="0"
                    value={lookbookForm.likes}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, likes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E5044] mb-1">Порядок</label>
                  <input
                    type="number"
                    placeholder="авто"
                    value={lookbookForm.sort}
                    onChange={(e) => setLookbookForm({ ...lookbookForm, sort: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5E5044] mb-1">Ссылка на пост (необязательно)</label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/p/..."
                  value={lookbookForm.link}
                  onChange={(e) => setLookbookForm({ ...lookbookForm, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8DDD0] text-xs focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLookbookModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white text-xs font-bold border border-[#E8DDD0]"
                >
                  Отмена
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-xs">
                  {editingLookbookId ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
