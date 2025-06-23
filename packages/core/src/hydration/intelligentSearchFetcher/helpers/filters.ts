import { AdsByPlacement } from "../../../clients/adServer/mappers";
import {
  Product as SearchProduct,
  Item as SearchSku,
} from "../../../clients/search";
import { OffersMap } from "../../types";
import { extractOffersFromAds, buildOffersMap } from "./mappers";

const filterItemsByOffers = (
  items: SearchSku[],
  offersMap: OffersMap,
): SearchSku[] => {
  return items
    .map((item) => {
      const allowedSellers = offersMap.get(item.itemId);
      if (!allowedSellers) return null;

      const filteredSellers = item.sellers.filter((seller) =>
        allowedSellers.includes(seller.sellerId),
      );

      if (filteredSellers.length === 0) return null;

      return {
        ...item,
        sellers: filteredSellers,
      };
    })
    .filter((item) => item !== null);
};

export const filterProductsWithValidItems = (
  products: SearchProduct[],
  ads: AdsByPlacement[],
): SearchProduct[] => {
  const offersMap = buildOffersMap(extractOffersFromAds(ads));

  return products
    .map((product) => {
      const filteredItems = filterItemsByOffers(product.items, offersMap);

      if (filteredItems.length === 0) return null;

      return {
        ...product,
        items: filteredItems,
      } as SearchProduct;
    })
    .filter((product) => product !== null);
};
