"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { useCatalog } from "@/context/CatalogContext";
import { localized } from "@/lib/utils";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";

function CatalogContent({ initialProducts }) {
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();
  const { categories, collections } = useCatalog();

  const initialCat = searchParams.get("category") || "all";
  const initialCol = searchParams.get("collection") || "all";
  const initialSearch = searchParams.get("search") || "";

  // the server already rendered the unfiltered list: show it immediately (good for SEO and speed)
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const skipFirstFetch = useRef(Boolean(initialProducts));

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedCollection, setSelectedCollection] = useState(initialCol);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOption, setSortOption] = useState("popular");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync with URL params if they change
  useEffect(() => {
    const c = searchParams.get("category");
    const col = searchParams.get("collection");
    const s = searchParams.get("search");
    setSelectedCategory(c || "all");
    setSelectedCollection(col || "all");
    setSearchQuery(s || "");
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.append("category", selectedCategory);
    }
    if (selectedCollection && selectedCollection !== "all") {
      params.append("collection", selectedCollection);
    }
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    if (sortOption && sortOption !== "popular") params.append("sort", sortOption);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          let list = d.data;
          if (inStockOnly) {
            list = list.filter((p) => p.inStock && p.stockCount > 0);
          }
          setProducts(list);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedCollection, searchQuery, sortOption, inStockOnly]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedCollection("all");
    setSearchQuery("");
    setInStockOnly(false);
  };

  const categoryOptions = [
    { id: "all", name: t("filter_all") },
    ...categories.map((c) => ({ id: c.id, name: localized(c, "name", lang) })),
  ];

  const selectedCollectionObj = collections.find((c) => c.id === selectedCollection);
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);


  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />

      {/* Catalog Banner */}
      <div className="bg-gradient-to-r from-[#FAF3EC] via-[#F7D6D0]/40 to-[#FAF3EC] py-10 border-b border-[#EFE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
            {t("catalog_subtitle")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif-vintage text-[#3D332A] mt-1">
            {selectedCollection !== "all"
              ? t("catalog_collection_title", {
                  name: selectedCollectionObj ? localized(selectedCollectionObj, "name", lang) : selectedCollection,
                })
              : t("catalog_title")}
          </h1>
          <p className="text-xs sm:text-sm text-[#7E6F62] mt-2 max-w-xl mx-auto">
            {t("catalog_banner_desc")}
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar: Search, Category pills, Sort */}
        <div className="space-y-4 mb-8">
          {/* Top Row: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Live Search input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-full text-xs bg-white border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-[#3D332A] shadow-xs"
              />
              <FiSearch className="absolute left-3 top-3 text-[#9E8C7E]" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[#9E8C7E] hover:text-[#3D332A]"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* In stock toggle & Sort */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#5E5044] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#D47A75] cursor-pointer"
                />
                <span>{t("catalog_in_stock_only")}</span>
              </label>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DDD0] text-xs font-semibold text-[#3D332A] focus:border-[#D47A75] focus:outline-hidden shadow-xs cursor-pointer"
              >
                <option value="popular">{t("sort_popular")}</option>
                <option value="price-asc">{t("sort_price_asc")}</option>
                <option value="price-desc">{t("sort_price_desc")}</option>
                <option value="rating">{t("sort_rating")}</option>
                <option value="newest">{t("sort_newest")}</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? "bg-[#D47A75] text-white shadow-xs"
                      : "bg-white/90 hover:bg-white text-[#5E5044] border border-[#EFE6DC] hover:border-[#D47A75]/40"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Collection Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="font-semibold text-[#8C7A6B] mr-1 shrink-0">
              {t("nav_collections")}:
            </span>
            <button
              onClick={() => setSelectedCollection("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedCollection === "all"
                  ? "bg-[#3D332A] text-white"
                  : "bg-white text-[#5E5044] border border-[#E8DDD0]"
              }`}
            >
              {t("catalog_all")}
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCollection === col.id
                    ? "bg-[#D47A75] text-white shadow-xs"
                    : "bg-white text-[#5E5044] border border-[#E8DDD0] hover:border-[#D47A75]/50"
                }`}
              >
                {localized(col, "name", lang)}
              </button>
            ))}
          </div>

          {/* Active Filter Tags */}
          {(selectedCategory !== "all" ||
            selectedCollection !== "all" ||
            searchQuery ||
            inStockOnly) && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#7E6F62] pt-1">
              <span className="font-semibold text-[#3D332A]">{t("catalog_filters")}</span>
              {selectedCategory !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#FAF3EC] border border-[#E8DDD0] flex items-center gap-1">
                  {t("catalog_category")} {selectedCategoryObj ? localized(selectedCategoryObj, "name", lang) : selectedCategory}
                  <button onClick={() => setSelectedCategory("all")} className="font-bold hover:text-red-500 ml-1">
                    ×
                  </button>
                </span>
              )}
              {selectedCollection !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#FAF3EC] border border-[#E8DDD0] flex items-center gap-1">
                  {t("catalog_collection")} {selectedCollectionObj ? localized(selectedCollectionObj, "name", lang) : selectedCollection}
                  <button onClick={() => setSelectedCollection("all")} className="font-bold hover:text-red-500 ml-1">
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 rounded-full bg-[#FAF3EC] border border-[#E8DDD0] flex items-center gap-1">
                  {t("catalog_search")} "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="font-bold hover:text-red-500 ml-1">
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-[#D47A75] hover:underline font-semibold ml-2"
              >
                {t("filter_clear")}
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="mb-4 text-xs text-[#8C7A6B]">
          <span>{t("catalog_found")} </span>
          <strong className="text-[#3D332A]">{products.length}</strong>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white/60 rounded-2xl p-4 border border-[#EFE6DC] animate-pulse space-y-3"
              >
                <div className="aspect-square bg-[#E8DDD0]/40 rounded-xl" />
                <div className="h-4 bg-[#E8DDD0]/50 rounded-md w-3/4" />
                <div className="h-3 bg-[#E8DDD0]/30 rounded-md w-1/2" />
                <div className="h-8 bg-[#E8DDD0]/40 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-[#EFE6DC] p-8 space-y-3">
            <div className="text-4xl text-[#D47A75]">🌸</div>
            <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
              {t("empty_catalog")}
            </h3>
            <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">
              {t("empty_catalog_desc")}
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 rounded-full bg-[#D47A75] text-white text-xs font-semibold shadow-xs hover:bg-[#C46863]"
            >
              {t("filter_clear")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CatalogFallback() {
  const { t } = useLanguage();
  return <div className="min-h-screen bg-[#FAF6F0] p-8 text-center text-xs">{t("catalog_loading")}</div>;
}

export default function CatalogView({ initialProducts }) {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent initialProducts={initialProducts} />
    </Suspense>
  );
}
