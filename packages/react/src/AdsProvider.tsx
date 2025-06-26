import { ReactNode } from "react";
import { AdsContext, AdsContextType, UnknownProduct } from "./AdsContext";

type AdsProviderProps<TProduct extends object> = React.PropsWithChildren<
  AdsContextType<TProduct>
>;

export const AdsProvider: <TProduct extends UnknownProduct>(
  props: AdsProviderProps<TProduct>,
) => ReactNode = ({ children, ...props }) => {
  return (
    <AdsContext.Provider
      value={
        {
          ...props,
        } as AdsContextType<UnknownProduct>
      }
    >
      {children}
    </AdsContext.Provider>
  );
};
