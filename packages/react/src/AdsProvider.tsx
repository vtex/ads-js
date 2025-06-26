import { ReactNode } from "react";
import { AdsContext, AdsContextType } from "./AdsContext";

type AdsProviderProps<TProduct extends object> = React.PropsWithChildren<
  AdsContextType<TProduct>
>;

export const AdsProvider: <TProduct extends object>(
  props: AdsProviderProps<TProduct>,
) => ReactNode = ({ children, ...props }) => {
  return (
    <AdsContext.Provider
      value={{
        ...props,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
};
