---
"@vtex/ads-stories": minor
---

The ESM build bundles Lit, lowered to ES2018 like the rest of the package, so bundlers that read `module` instead of `exports`, such as webpack 4 on VTEX IO, can import `@vtex/ads-stories` directly. `lit` stays a dependency for the type declarations.
