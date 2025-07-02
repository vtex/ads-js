import { ReactNode } from "react";
import { AdsContext, AdsContextType } from "./AdsContext";
import {ProductMatchesOffer} from "@vtex/ads-core";

export type AdsProviderProps<TProduct extends object> = React.PropsWithChildren<
  AdsContextType<TProduct>
>;

/**
 * A React context provider component that supplies ads-related
 * functionality to its child components.
 *
 * This provider wraps the application or component tree to make ads
 * context available throughout the component hierarchy. It accepts a
 * generic type parameter to ensure type consistency between fetcher and
 * matcher functions.
 *
 * @template TProduct - The product type that extends object, ensuring
 * the fetcher and matcher work with the same product type. Usually
 * inferred from props.
 *
 * @param props - The provider props including children and ads context
 * properties
 * @param props.children - React child components that will have access
 * to the ads context
 * @param props.* - All other props from AdsContextType<TProduct>
 * including ads configuration and methods
 *
 * @returns A ReactNode that provides ads context to its children
 *
 * @example
 * ```tsx
 * // Type is usually inferred from fetcher/matcher
 * interface MyProduct {
 *   id: string;
 *   name: string;
 *   price: number;
 * }
 *
 * const fetcher: ProductFetcher<MyProduct> = // ...
 * const matcher: ProductMatchesOffer<MyProduct> = // ...
 *
 * <AdsProvider
 *   hydrationStrategy={{ fetcher, matcher }}
 *   // ... other props
 * >
 *   <MyApp />
 * </AdsProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Explicit type parameter (rarely needed)
 * <AdsProvider<MyProduct>
 *   // ... ads context props
 * >
 *   <MyApp />
 * </AdsProvider>
 * ```
 */
export function AdsProvider<TProduct extends object>({
  identity,
  hydrationStrategy,
  children,
}: AdsProviderProps<TProduct>): ReactNode {
  if (!identity || !hydrationStrategy) {
    throw new Error(
      "AdsProvider requires both identity and hydrationStrategy props",
    );
  }

  return (
    <AdsContext.Provider
      value={{
        identity: identity,
        hydrationStrategy: {
          fetcher: hydrationStrategy.fetcher,
          matcher: hydrationStrategy.matcher as ProductMatchesOffer<object>,
          key: hydrationStrategy.key,
        },
      }}
    >
      {children}
    </AdsContext.Provider>
  );
}
