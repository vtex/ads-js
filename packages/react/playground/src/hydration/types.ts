import { ProductFetcher, ProductMatchesOffer } from "@vtex/ads-core";

// Simple mock product interface for easy identification
export interface SimpleMockProduct {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  inStock: boolean;
  description: string;
  skuId: string;
  sellerId: string;
}

// Hydration strategy interface
export interface HydrationStrategy {
  name: string;
  fetcher: ProductFetcher<SimpleMockProduct>;
  matcher: ProductMatchesOffer<SimpleMockProduct>;
}
