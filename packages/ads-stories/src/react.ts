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
import type { VtexAdsStoryElement } from "./story";

export type VtexAdsStoryProps = DetailedHTMLProps<
  HTMLAttributes<VtexAdsStoryElement>,
  VtexAdsStoryElement
>;

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "vtex-ads-story": VtexAdsStoryProps;
    }
  }
}
