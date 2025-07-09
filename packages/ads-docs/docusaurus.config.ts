import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "VTEX Ads JS SDK",
  tagline: "Integrate VTEX Ads into your storefront with ease",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://vtex.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/ads-js/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "vtex", // Usually your GitHub org/user name.
  projectName: "ads-js", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/vtex/ads-js/tree/main/packages/ads-docs/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/vtex/ads-js/tree/main/packages/ads-docs/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Ads JavaScript SDK",
      logo: {
        alt: "VTEX Ads SDK Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "adsSidebar",
          position: "left",
          label: "Guide",
        },
        {
          type: "docSidebar",
          sidebarId: "adsCore",
          position: "left",
          label: "Core API",
        },
        {
          type: "docSidebar",
          sidebarId: "adsReact",
          position: "left",
          label: "React API",
        },
        {
          href: "https://vtex.github.io/ads-js/playground",
          label: "Playground",
          position: "right",
        },
        {
          href: "https://github.com/vtex/ads-js",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "VTEX Community",
              href: "https://community.vtex.com",
            },
            {
              label: "Developer Portal",
              href: "https://developers.vtex.com",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/vtex/ads-js",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} VTEX. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        id: "adsCore",
        entryPoints: ["../core/src/index.ts"],
        tsconfig: "../core/tsconfig.json",
        sidebar: { autoConfiguration: true, typescript: true },
        out: "docs/api/core",
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        id: "adsReact",
        entryPoints: ["../react/src/index.ts"],
        tsconfig: "../react/tsconfig.json",
        sidebar: { autoConfiguration: true, typescript: true },
        out: "docs/api/react",
      },
    ],
  ],
};

export default config;
