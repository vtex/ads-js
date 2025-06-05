/**
 * Facets Adapter
 *
 * This module translates facet representations from Intelligent Search
 * (which uses raw key-value facets like `"c": "explosives"`, `"b": "acme"`)
 * into a normalized structure used by the Ad Server, which expects structured
 * attributes like category, brand, and tags.
 *
 * The adapter exposes utility functions to extract specific attributes from
 * the list of selected facets.
 */
import { Facet } from "../../types";

interface GetAttributeFromFacetsParams {
  selectedFacets?: Facet[];
  attributeSynonyms?: string[];
  attributePrefix?: string;
}

/**
 * Extracts facets that match a given attribute.
 *
 * This function supports both exact key matches via `attributeSynonyms` and
 * prefix-based matches via `attributePrefix`. It is intended for internal use
 * by specialized accessors like `getCategoryFromFacets`, `getBrandFromFacets`,
 * etc.
 *
 * @internal
 * @param params.selectedFacets - Array of facets from Intelligent Search
 * @param params.attributeSynonyms - Alternative keys to match exactly (e.g.,
 * ['c', 'categoria'])
 * @param params.attributePrefix - Prefix to match (e.g., 'category')
 * @returns Matching facets or `undefined` if none match
 */
export const getAttributeFromFacets: (
  params: GetAttributeFromFacetsParams,
) => Facet[] | undefined = ({
  selectedFacets,
  attributeSynonyms,
  attributePrefix,
}) => {
  if (!selectedFacets || !selectedFacets.length) {
    return undefined;
  }

  const attributes = selectedFacets.filter((facet) => {
    const key = facet.key.toLowerCase();

    return (
      attributeSynonyms?.map((s) => s.toLowerCase()).includes(key) ||
      (attributePrefix && key.startsWith(attributePrefix.toLowerCase()))
    );
  });

  if (attributes.length > 0) {
    return attributes;
  } else {
    return undefined;
  }
};

/**
 * Extracts and formats the category path from selected facets.
 *
 * This function finds facets related to category information (e.g., keys like
 * `"c"`, `"categoria"`, or `"category-1"`) and joins them using `' > '`.
 *
 * @param selectedFacets - Raw facets from Intelligent Search
 * @returns The formatted category path string, or `undefined` if not found
 */
export const getCategoryFromFacets = (selectedFacets?: Facet[]) => {
  return getAttributeFromFacets({
    selectedFacets,
    attributeSynonyms: ["categoria", "c"],
    attributePrefix: "category",
  })
    ?.map((facet) => facet.value)
    .join(" > ");
};

/**
 * Extracts brand values from selected facets.
 *
 * Recognizes keys such as `"brand"` or `"b"` and returns their values.
 *
 * @param selectedFacets - Raw facets from Intelligent Search
 * @returns The first brand value found, or `undefined` if not found.
 */
export const getBrandFromFacets = (selectedFacets?: Facet[]) => {
  return getAttributeFromFacets({
    selectedFacets,
    attributeSynonyms: ["brand", "b"],
  })?.map((facet) => facet.value)[0];
};

/**
 * Extracts tag values of product cluster IDs from selected facets.
 *
 * Ad Server implements product cluster IDs (collections) as tags, so we should
 * use it for correct targeting.
 *
 * Recognizes keys like `"productClusterIds"` and returns them formatted as
 * `"product_cluster/{value}"`.
 *
 * @param selectedFacets - Raw facets from Intelligent Search
 * @returns An array of tag strings, or `undefined` if not found
 */
export const getTagsFromFacets = (selectedFacets?: Facet[]) => {
  return getAttributeFromFacets({
    selectedFacets,
    attributeSynonyms: ["productClusterIds"],
  })?.map((facet) => `product_cluster/${facet.value}`);
};

export interface ParametersFromFacets {
  category?: string;
  brand?: string;
  tags?: string[];
}

export const getParametersFromFacets: (
  _: Facet[] | undefined,
) => ParametersFromFacets = (selectedFacets?: Facet[]) =>
  ({
    category: getCategoryFromFacets(selectedFacets),
    brand: getBrandFromFacets(selectedFacets),
    tags: getTagsFromFacets(selectedFacets),
  }) as ParametersFromFacets;
