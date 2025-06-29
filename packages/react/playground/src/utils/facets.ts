import { Facet } from "@vtex/ads-core";

export interface FacetFormFields {
  categoryPath: string;
  brand: string;
  productClusterId: string;
}

/**
 * Builds a Facet array from form input fields
 * @param fields - Form fields containing category path, brand, and product cluster ID
 * @returns Array of Facet objects
 */
export const buildSelectedFacets = (fields: FacetFormFields): Facet[] => {
  const facets: Facet[] = [];

  // Handle category path: "Electronics > Phones > Smartphones" ->
  // multiple category facets
  if (fields.categoryPath.trim()) {
    const categories = fields.categoryPath
      .split(">")
      .map((cat) => cat.trim())
      .filter(Boolean);
    categories.forEach((category, index) => {
      facets.push({
        key: `category-${index + 1}`,
        value: category,
      });
    });
  }

  // Handle brand
  if (fields.brand.trim()) {
    facets.push({
      key: "brand",
      value: fields.brand.trim(),
    });
  }

  // Handle product cluster ID
  if (fields.productClusterId.trim()) {
    facets.push({
      key: "productClusterIds",
      value: fields.productClusterId.trim(),
    });
  }

  return facets;
};

/**
 * Reconstructs form fields from a selectedFacets array
 * @param selectedFacets - Array of Facet objects
 * @returns Form fields object with category path, brand, and product cluster ID
 */
export const getFacetFormFields = (
  selectedFacets: Facet[],
): FacetFormFields => {
  let categoryPath = "";
  let brand = "";
  let productClusterId = "";

  selectedFacets.forEach((facet) => {
    if (facet.key === "brand") {
      brand = facet.value;
    } else if (facet.key === "productClusterIds") {
      productClusterId = facet.value;
    } else if (facet.key.startsWith("category-")) {
      // Reconstruct category path from category facets
      categoryPath = categoryPath
        ? `${categoryPath} > ${facet.value}`
        : facet.value;
    }
  });

  return { categoryPath, brand, productClusterId };
};
