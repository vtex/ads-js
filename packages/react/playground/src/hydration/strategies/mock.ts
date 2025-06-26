import { ProductFetcher, ProductMatchesOffer } from "@vtex/ads-core";
import { SimpleMockProduct, HydrationStrategy } from "../types";

// Mock fetcher that returns simple, clearly different product data
export const mockFetcher: ProductFetcher<SimpleMockProduct> = async (
  offers,
) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const brands = ["MockBrand", "TestCorp", "DemoInc", "SampleCo", "FakeBrand"];
  const categories = [
    "Mock Electronics",
    "Test Clothing",
    "Demo Home",
    "Sample Sports",
  ];
  const adjectives = ["Amazing", "Fantastic", "Super", "Premium", "Ultimate"];

  // Generate simple mock products
  return offers.map((offer, index) => ({
    id: `mock-${offer.productId}`,
    name: `${adjectives[index % adjectives.length]} ${brands[index % brands.length]} Product ${index + 1}`,
    price: Math.floor(Math.random() * 500) + 50,
    brand: brands[index % brands.length],
    category: categories[index % categories.length],
    inStock: Math.random() > 0.2, // 80% chance of being in stock
    description: `This is a simple mock product for testing. SKU: ${offer.skuId}`,
    skuId: offer.skuId,
    sellerId: offer.sellerId,
  }));
};

// Simple mock matcher for the mock products
export const mockMatcher: ProductMatchesOffer<SimpleMockProduct> = (
  product,
  offer,
) => {
  return product.skuId === offer.skuId && product.sellerId === offer.sellerId;
};

export const mockStrategy: HydrationStrategy = {
  name: "Mocked Hydration",
  fetcher: mockFetcher as ProductFetcher<SimpleMockProduct>,
  matcher: mockMatcher as ProductMatchesOffer<SimpleMockProduct>,
};
