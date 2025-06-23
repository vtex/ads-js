import { AdsByPlacement, getProductIds } from "../../clients/adServer/mappers";
import { Product as SearchProduct } from "../../clients/search";
import { getProductsByIds } from "../../clients/search/search";
import { Identity } from "../../types";
import { ProductFetcher } from "../types";
import { filterProductsWithValidItems } from "./helpers/filters";

/**
 * Fetches products from Intelligent Search (IS) based on provided SKUs
 * and sellers.
 *
 * Implements `ProductFetcher` interface to fetch products.
 *
 * It changes the IS response to ensure the products to include only
 * those that match the specified SKUs and sellers.
 */
export const fetchWithIS: ProductFetcher<SearchProduct> = async (
  ads: AdsByPlacement[],
  { accountName }: Identity,
) => {
  const ids = getProductIds(ads);

  const searchProducts = (await getProductsByIds(accountName, ids)).products;

  return filterProductsWithValidItems(searchProducts, ads);
};
