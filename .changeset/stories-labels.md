---
"@vtex/ads-stories": minor
---

The element's texts follow its language: the buttons, "Esgotado" and the names screen readers read out come in Portuguese, Spanish and English, picked from the closest `lang` attribute like the prices (`es-AR` gets Spanish). Without a `lang`, or with another language, they stay in Portuguese.

New attributes, also in the React JSX types: `label-add-to-cart` and `label-view-product` replace the product panel's button texts in any language. Missing or blank, the language's default shows. Changing them doesn't request the Stories again.
