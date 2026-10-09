# ARPA invitation generator

Static, browser-only Arabic and English invitations. Open with `npm run preview`. Run validation checks with `npm test` and `npm run check`.

Excel import accepts .xlsx/.xls, a required `Name` column, and optional `Language` (`ar`/`en`). Blank languages inherit the selection when imported. Multi-sheet files have a worksheet selector. Imports are limited to 10 MB, 500 guest rows, and reasonable worksheet dimensions. Review rows inline; invalid rows remain visible and are excluded from export. ZIPs contain up to 25 invitations each to bound browser memory on mobile. Duplicate names retain separate, indexed filenames. Everything runs locally; no names or files are uploaded or stored.

## Artwork
Original JPGs are retained in `dist/assets/original-ar.jpg` and `original-en.jpg`. Built-in imagegen removed only the sample names in the generated assets `clean-ar.png` and `clean-en.png`. Runtime compositing takes only the recipient rectangles from those generated assets and feathers the edges over the originals, preserving original pixels outside those rectangles. Recipient bounds at 1280 × 1600: Arabic (260,322,780,150), English (330,325,630,135). Export uses the same drawing function as the preview, at 2× scale. Artwork remains limited to original JPG detail; names render at export resolution.

Arabic edit prompt: Remove only the Arabic sample recipient line; reconstruct the warm luminous cream/gold church background. Preserve every other text line, logo, church architecture, border, color, and composition. Preserve 4:5 framing.

English edit prompt: Remove only “Mr. John Doe”; reconstruct the warm luminous cream/gold church background. Preserve every other text line, logo, church architecture, border, color, and composition. Preserve 4:5 framing.

## Dependencies

Recipient names in both Arabic and English now use **Thmanyah Serif Display Bold**, supplied by the user in `Thmanyah-Font-Family.zip`. Its unmodified WOFF2 is included as a data URL in the product stylesheet `dist/thmanyah.css`; it is not exposed as a separate font download. The original fonts below remain for the website's interface headings. Preview, single export, and Excel batch export all share the same Thmanyah canvas rendering and font readiness checks.
Bundled Aref Ruqaa Bold and Libre Baskerville fonts from Google Fonts (SIL Open Font License), SheetJS Community Edition 0.20.3 (Apache-2.0), and JSZip 3.10.1 (MIT). Assets are served locally, without runtime CDN requests. Feature-detected WebMCP exposes `set_invitation` and `export_invitation_png`; ordinary browsers need no WebMCP support. Registration and state updates were tested with a mock registry; native WebMCP validation was unavailable in the local browser.
