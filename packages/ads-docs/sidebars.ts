import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";
import typedocCoreSidebar from "./docs/api/core/typedoc-sidebar";
import typedocReactSidebar from "./docs/api/react/typedoc-sidebar";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // VTEX Ads SDK documentation sidebar
  adsSidebar: [
    "intro",
    {
      type: "category",
      label: "Core Library",
      items: [
        "ads-core/quickstart",
        "ads-core/basic-usage",
        "ads-core/custom-hydration",
        "ads-core/examples",
      ],
    },
    {
      type: "category",
      label: "React Library",
      items: ["ads-react/quickstart"],
    },
  ],
  adsCore: [
    {
      type: "category",
      label: "Core API",
      link: {
        type: "doc",
        id: "api/core/index",
      },
      items: typedocCoreSidebar.items,
    },
  ],
  adsReact: [
    {
      type: "category",
      label: "React API",
      link: {
        type: "doc",
        id: "api/react/index",
      },
      items: typedocReactSidebar.items,
    },
  ],
};

export default sidebars;
