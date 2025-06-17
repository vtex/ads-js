import { NavigationContext } from "../clients/adServer";

export interface GetAdServerContextParams {
  term?: string;
  category?: string;
  brand?: string;
  skuId?: string;
}

/**
 * Determines the navigation context based on provided parameters.
 */
export const getAdServerContext: (
  _: GetAdServerContextParams,
) => NavigationContext = ({ term, category, brand, skuId }) => {
  if (term) {
    return "search";
  }

  if (category) {
    return "category";
  }

  if (brand) {
    return "brand_page";
  }

  if (skuId) {
    return "product_page";
  }

  return "home";
};
