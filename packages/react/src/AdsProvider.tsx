import React, { PropsWithChildren, ReactElement } from "react";
import { AdsContext, AdsContextType } from "./AdsContext";
import { ProductMatchesOffer } from "@vtex/ads-core";
import { logErrorSync } from "./utils/logs";

/**
 * Props for the AdsProvider component
 * @public
 */
export type AdsProviderProps<TProduct extends object> = PropsWithChildren<
  AdsContextType<TProduct> & {
    /**
     * Environment where the app is running
     * If set to "production", logs will be sent to the observability endpoint
     * @default "development"
     */
    environment?: "development" | "production";
  }
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
 * @param props - The provider props including children, identity,
 * hydration strategy, and environment
 *
 * @returns A ReactNode that provides ads context to its children
 *
 * @example
 * ```tsx
 * // Type is usually inferred from fetcher/matcher
 * interface MyProduct \{
 *   id: string;
 *   name: string;
 *   price: number;
 * \}
 *
 * const fetcher: ProductFetcher<MyProduct> = // ...
 * const matcher: ProductMatchesOffer<MyProduct> = // ...
 *
 * <AdsProvider
 *   identity=\{\{
 *     accountName: "myaccount",
 *     publisherId: "pub123",
 *     sessionId: "session456"
 *   \}\}
 *   hydrationStrategy=\{\{ fetcher, matcher \}\}
 *   environment="production"
 * >
 *   <MyApp />
 * </AdsProvider>
 * ```
 *
 * @public
 */
export function AdsProvider<TProduct extends object>({
  identity,
  hydrationStrategy,
  children,
  environment = "production",
}: AdsProviderProps<TProduct>): ReactElement {
  if (!identity) {
    const errorMessage =
      "AdsProvider requires identity prop with accountName, publisherId, and sessionId";
    logErrorSync(
      errorMessage,
      {
        component: "AdsProvider",
        missingProp: "identity",
      },
      environment,
    );
    throw new Error(errorMessage);
  }

  if (!identity?.publisherId) {
    const errorMessage = "AdsProvider requires publisherId prop";
    logErrorSync(
      errorMessage,
      {
        component: "AdsProvider",
        missingProp: "publisherId",
      },
      environment,
    );
  }

  if (!hydrationStrategy) {
    const errorMessage =
      "AdsProvider requires hydrationStrategy prop with fetcher and matcher";
    logErrorSync(
      errorMessage,
      {
        component: "AdsProvider",
        missingProp: "hydrationStrategy",
      },
      environment,
    );
    throw new Error(errorMessage);
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
