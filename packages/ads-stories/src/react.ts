/**
 * React JSX types for <vtex-ads-story-carousel>. Types only: the JS output
 * is empty.
 *
 * Opt in once per project, so non-React projects never need @types/react:
 *
 *   import type {} from "@vtex/ads-stories/react";
 *
 * or add "@vtex/ads-stories/react" to `compilerOptions.types` in tsconfig.
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { Channel } from "@vtex/ads-core";
import type { TAG_NAME, VtexAdsStoryCarouselElement } from "./story";

/**
 * The element's own attributes. The required ones match the README: without
 * them, the element requests nothing and renders nothing.
 */
export interface VtexAdsStoryCarouselAttributes {
  /** The publisher the ads are requested for. */
  "publisher-id": string;
  /** The store's session, also used to deduplicate events. */
  "session-id": string;
  /** The Story placement configured for the publisher. */
  placement: string;
  "user-id"?: string;
  "account-name"?: string;
  /** `site` or `app`. */
  channel?: Channel;
  /** Time limit for the ad request, in milliseconds (default 2000). */
  timeout?: number;
  /** How many Stories to ask for: the carousel positions (default 8). */
  quantity?: number;
  /** Currency of the prices, ISO 4217 ("BRL"). Default BRL. */
  currency?: string;
  /** The add to cart button's text. Default in the element's language. */
  "label-add-to-cart"?: string;
  /** The view product button's text. Default in the element's language. */
  "label-view-product"?: string;
  /**
   * "none": no product request. To set a strategy, assign the element's
   * `hydration` property. Missing: Intelligent Search with `account-name`.
   */
  hydration?: "none";
  /** Time limit for the product request, in milliseconds (default 5000). */
  "hydration-timeout"?: number;
  /**
   * "none": no product request. To set a strategy, assign the element's
   * `hydration` property. Missing: Intelligent Search with `account-name`.
   */
  hydration?: "none";
  /** Time limit for the product request, in milliseconds (default 5000). */
  "hydration-timeout"?: number;
  /**
   * With more than one Story, the cards without the highlight also play
   * their video, muted. Off by default.
   */
  "inactive-autoplay"?: boolean;
}

export type VtexAdsStoryCarouselProps = DetailedHTMLProps<
  HTMLAttributes<VtexAdsStoryCarouselElement>,
  VtexAdsStoryCarouselElement
> &
  VtexAdsStoryCarouselAttributes;

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [TAG_NAME]: VtexAdsStoryCarouselProps;
    }
  }
}
