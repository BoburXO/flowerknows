import HomeView from "@/components/HomeView";
import { listProducts, filterProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  let bestsellers = [];
  try {
    bestsellers = filterProducts(await listProducts(), { sort: "popular" }).slice(0, 4);
  } catch (e) {
    console.error("[home]", e?.message);
  }
  return <HomeView initialProducts={bestsellers} />;
}
