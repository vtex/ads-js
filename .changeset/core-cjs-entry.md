---
"@vtex/ads-core": patch
---

Fix `require("@vtex/ads-core")`, `require("@vtex/ads-core/search")` and `require("@vtex/ads-core/adServer")`: the CommonJS entry points named files the build doesn't emit (`.cjs.js` and `.js` instead of `.cjs`), so they failed with `MODULE_NOT_FOUND`. ES module imports were not affected.
