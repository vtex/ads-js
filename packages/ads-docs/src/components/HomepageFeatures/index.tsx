import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import undrawMountain from "@site/static/img/undraw_docusaurus_mountain.svg";
import undrawReact from "@site/static/img/undraw_docusaurus_react.svg";
import undrawTree from "@site/static/img/undraw_docusaurus_tree.svg";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Quick Integration",
    Svg: undrawMountain,
    description: (
      <>
        Add sponsored products to your storefront in minutes using our
        lightweight JavaScript SDK, with zero-config defaults and sensible
        TypeScript typings.
      </>
    ),
  },
  {
    title: "Relevant Sponsored Products",
    Svg: undrawTree,
    description: (
      <>
        Leverage VTEX&apos;s Ads platform to display products that match your
        shopper&apos;s intent, boosting revenue while preserving the shopping
        experience.
      </>
    ),
  },
  {
    title: "Framework Agnostic",
    Svg: undrawReact,
    description: (
      <>
        Use the core package in any JavaScript environment or opt-in to our
        React bindings for a declarative developer experience.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
