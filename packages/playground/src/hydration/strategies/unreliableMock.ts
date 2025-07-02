import { ProductFetcher } from "@vtex/ads-core";
import { SimpleMockProduct, HydrationStrategy } from "../types";
import { mockMatcher } from "./mock";

// Unreliable mock fetcher that fails some items to showcase error handling
export const unreliableMockFetcher: ProductFetcher<SimpleMockProduct> = async (
  offers,
) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const brands = ["MockBrand", "TestCorp", "DemoInc", "SampleCo", "FakeBrand"];
  const categories = [
    "Mock Electronics",
    "Test Clothing",
    "Demo Home",
    "Sample Sports",
  ];
  const adjectives = ["Amazing", "Fantastic", "Super", "Premium", "Ultimate"];

  // Generate mock products but only for some offers (simulate missing products)
  return (
    offers
      // Skip every 2rd item to simulate missing products
      .filter((_, index) => index % 2 !== 1)
      .map((offer, index) => ({
        id: `mock-${offer.productId}`,
        name: `${adjectives[index % adjectives.length]} ${brands[index % brands.length]} Product ${index + 1}`,
        price: Math.floor(Math.random() * 500) + 50,
        brand: brands[index % brands.length],
        category: categories[index % categories.length],
        inStock: Math.random() > 0.3, // 70% chance of being in stock
        description: `This is a unreliable mock product for testing failures. SKU: ${offer.skuId}`,
        skuId: offer.skuId,
        sellerId: offer.sellerId,
      }))
  );
};

export const unreliableMockStrategy: HydrationStrategy<SimpleMockProduct> = {
  name: "Unreliable Mock (Missing Products)",
  fetcher: unreliableMockFetcher,
  matcher: mockMatcher,
};
