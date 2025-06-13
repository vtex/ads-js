import { AdRequest } from "../clients/adServer";
import { getParametersFromFacets } from "../clients/adServer/facetsAdapter";
import { GetAdsArgs } from "../types";
import { getAdServerContext } from "./getNavigationContext";

/**
 * Converts the library ad request arguments into the format expected by the
 * internal ad server.
 *
 * This function adapts high-level input such as selected facets and user
 * context into the lower-level Ad Server parameter structure.
 *
 * @param args - The input arguments provided by the ads SDK consumer.
 * @returns The adapted argument object compatible with the Ad Server.
 */
export const toAdServerArgs: (_: GetAdsArgs) => AdRequest = (
  args: GetAdsArgs,
): AdRequest => {
  const { category, brand, tags } = getParametersFromFacets(
    args.selectedFacets,
  );

  const context = getAdServerContext({
    term: args.term,
    category,
    brand,
    skuId: args.skuId,
  });

  return {
    brand_name: brand,
    category_name: category,
    tags,
    context,

    placements: args.placements,
    channel: args.channel,
    term: args.term,
    session_id: args.sessionId,
    user_id: args.userId,
    product_sku: args.skuId,
  };
};
