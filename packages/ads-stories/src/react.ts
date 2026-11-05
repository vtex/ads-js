/**
 * React JSX types for <vtex-ads-story>. Types only: the JS output is empty.
 *
 * Opt in once per project, so non-React projects never need @types/react:
 *
 *   import type {} from "@vtex/ads-stories/react";
 *
 * or add "@vtex/ads-stories/react" to `compilerOptions.types` in tsconfig.
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { Channel } from "@vtex/ads-core";
import type { VtexAdsStoryElement } from "./story";

/**
 * The element's own attributes. The required ones match the README: without
 * them, the element requests nothing and renders nothing.
 */
export interface VtexAdsStoryAttributes {
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
}

export type VtexAdsStoryProps = DetailedHTMLProps<
  HTMLAttributes<VtexAdsStoryElement>,
  VtexAdsStoryElement
> &
  VtexAdsStoryAttributes;

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "vtex-ads-story": VtexAdsStoryProps;
    }
  }
}
