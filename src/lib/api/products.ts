import { apiRequest, isApiConfigured, resolveImageUrl } from "./client";
import { mockItemGroups, mockPromoBanners, mockPromoProducts, mockProducts } from "../mock-data";
import type { ItemGroup, Product, ProductPage, ProductQuery, PromoBanner, PromoProduct } from "../types";

function withResolvedImage<T extends { image: string }>(item: T): T {
  return { ...item, image: resolveImageUrl(item.image) };
}

export async function getProducts(query: ProductQuery): Promise<ProductPage> {
  if (!isApiConfigured()) {
    const search = query.search?.toLowerCase();
    let items = mockProducts.filter(
      (p) =>
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search),
    );
    if (query.sort === "price_asc") items = [...items].sort((a, b) => a.price - b.price);
    if (query.sort === "price_desc") items = [...items].sort((a, b) => b.price - a.price);
    const pageSize = query.pageSize ?? 12;
    const page = query.page ?? 1;
    const start = (page - 1) * pageSize;
    return { products: items.slice(start, start + pageSize), total: items.length };
  }

  const result = await apiRequest<ProductPage>("/api/mobile/products", {
    params: {
      search: query.search,
      itemGroup: query.itemGroup,
      itemGroupIsGroup: query.itemGroupIsGroup ? "1" : undefined,
      warehouse: query.warehouse,
      sort: query.sort,
      page: String(query.page ?? 1),
      pageSize: String(query.pageSize ?? 12),
    },
  });
  return { ...result, products: result.products.map(withResolvedImage) };
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isApiConfigured()) {
    return mockProducts.find((p) => p.id === id) ?? null;
  }
  const product = await apiRequest<Product | null>(`/api/mobile/products/${encodeURIComponent(id)}`);
  return product ? withResolvedImage(product) : null;
}

export async function getItemGroupChildren(parent?: string): Promise<ItemGroup[]> {
  if (!isApiConfigured()) {
    return parent ? [] : mockItemGroups;
  }
  return apiRequest<ItemGroup[]>("/api/mobile/item-groups", { params: { parent } });
}

export async function getPromoProducts(warehouse?: string): Promise<PromoProduct[]> {
  if (!isApiConfigured()) return mockPromoProducts;
  const products = await apiRequest<PromoProduct[]>("/api/mobile/promo-products", {
    params: { warehouse },
  });
  return products.map(withResolvedImage);
}

// Checked right before Cart hands off to Checkout, against whichever
// outlet is currently selected — one call for the whole cart instead of
// one per item, so a since-sold-out item at that specific outlet gets
// caught before checkout instead of only surfacing there.
export async function checkStock(itemCodes: string[], warehouse: string): Promise<string[]> {
  if (!isApiConfigured() || itemCodes.length === 0) return [];
  try {
    const res = await apiRequest<{ outOfStock: string[] }>("/api/mobile/products/check-stock", {
      method: "POST",
      body: { itemCodes, warehouse },
    });
    return res.outOfStock;
  } catch {
    // Best-effort: if the check itself fails, don't block checkout over it.
    return [];
  }
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  if (!isApiConfigured()) return mockPromoBanners;
  const banners = await apiRequest<PromoBanner[]>("/api/mobile/promo-banners");
  return banners.map(withResolvedImage);
}
