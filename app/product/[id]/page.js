import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, listProducts, filterProducts } from "@/lib/store";
import { SITE_URL } from "@/lib/site";
import { SITE_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

const clip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  let product = null;
  try {
    product = await getProduct(id);
  } catch (e) {
    /* handled below */
  }
  if (!product) return { title: "Товар не найден", robots: { index: false, follow: false } };

  const name = product.nameRu || product.name;
  const price = new Intl.NumberFormat("ru-RU").format(product.price);
  const title = `${name} — купить в Ташкенте`;
  const description = clip(
    `${product.descriptionRu || product.description || ""} Цена: ${price} сум. ${product.collection}. Доставка по Узбекистану. / ${product.nameUz || product.name} — Flower Knows O'zbekiston.`,
    300
  );
  const images = (product.images || []).slice(0, 4).map((url) => ({ url, alt: name }));
  const url = `/product/${encodeURIComponent(product.id)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${name} | ${SITE_NAME}`,
      description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | ${SITE_NAME}`,
      description,
      images: images.map((i) => i.url),
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "UZS",
      "product:availability": product.inStock !== false && product.stockCount > 0 ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  let related = [];
  try {
    const all = await listProducts();
    related = filterProducts(all, { collection: product.collection, sort: "popular" })
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  } catch (e) {
    /* related products are optional */
  }

  const url = `${SITE_URL}/product/${encodeURIComponent(product.id)}`;
  const inStock = product.inStock !== false && product.stockCount > 0;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.nameRu || product.name,
      alternateName: [product.name, product.nameUz].filter(Boolean),
      sku: product.id,
      image: product.images,
      description: clip(product.descriptionRu || product.description, 500),
      brand: { "@type": "Brand", name: "Flower Knows" },
      category: product.collection,
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "UZS",
        price: product.price,
        availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: SITE_NAME },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Flower Knows", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE_URL}/catalog` },
        { "@type": "ListItem", position: 3, name: product.nameRu || product.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetail key={product.id} initialProduct={product} initialRelated={related} />
    </>
  );
}
