
import "./tailwind.css";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CatalogProvider } from "@/context/CatalogContext";

import {
  listCategories,
  listCollections,
  listLookbook,
  listBanners,
} from "@/lib/store";

import { SITE_URL } from "@/lib/site";

import {
  SITE_NAME,
  TELEGRAM_URL,
  INSTAGRAM_URL,
  PHONE_E164,
} from "@/lib/config";

// Data comes from the database -> never prerender at build time
export const dynamic = "force-dynamic";

const TITLE =
  "Flower Knows Uzbekistan — Косметика в Ташкенте | Kosmetika O'zbekistonda";

const DESCRIPTION =
  "Официальный интернет-магазин Flower Knows в Узбекистане: нежные пастельные тона, винтажный стиль рококо, доставка по Ташкенту и всей стране. " +
  "Flower Knows O'zbekiston rasmiy do'koni: original pardoz vositalari, butun O'zbekiston bo'ylab yetkazib berish.";

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: TITLE,
    template: "%s | Flower Knows Uzbekistan",
  },

  description: DESCRIPTION,

  applicationName: SITE_NAME,

  // Favicon and website logo
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/logo.png",
    apple: [
      {
        url: "/logo.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },

  keywords: [
    "Flower Knows",
    "Flower Knows Uzbekistan",
    "Flower Knows Ташкент",
    "косметика Ташкент",
    "румяна с тиснением",
    "помада Flower Knows",
    "kosmetika Toshkent",
    "pardoz vositalari",
    "Flower Knows O'zbekiston",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "ru_RU",
    alternateLocale: ["uz_UZ"],
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Flower Knows Uzbekistan",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  formatDetection: {
    telephone: true,
  },

  category: "beauty",
};

export const viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
};

async function safe(promise) {
  try {
    return await promise;
  } catch (e) {
    console.error("[layout] catalog data unavailable:", e?.message);
    return [];
  }
}

export default async function RootLayout({ children }) {
  const [categories, collections, lookbook, banners] = await Promise.all([
    safe(listCategories()),
    safe(listCollections()),
    safe(listLookbook()),
    safe(listBanners({ onlyActive: true })),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/logo.png`,
      telephone: PHONE_E164,
      description: DESCRIPTION,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tashkent",
        addressCountry: "UZ",
      },
      areaServed: {
        "@type": "Country",
        name: "Uzbekistan",
      },
      sameAs: [INSTAGRAM_URL, TELEGRAM_URL],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: ["ru", "uz"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/catalog?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html lang="ru" className="h-full antialiased">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          rel="preconnect"
          href="https://images.unsplash.com"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col font-sans bg-[#FAF6F0] text-[#3D332A] selection:bg-[#E8A598]/30 selection:text-[#3D332A]">
        <LanguageProvider>
          <CatalogProvider
            initialCategories={categories}
            initialCollections={collections}
            initialLookbook={lookbook}
            initialBanners={banners}
          >
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </CatalogProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
