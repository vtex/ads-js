import { ProductFetcher, ProductMatchesOffer } from "@vtex/ads-core";
import { UnknownProduct } from "@vtex/ads-react/dist/AdsContext";

// Simple mock product interface for easy identification
export interface SimpleMockProduct extends UnknownProduct {
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
