# ARPA invitations

Private Arabic and English generator. `npm run preview` starts a loopback-only preview with username `arpa` and the test-only password `local-test-password!`. Production credentials are Sites runtime secrets; the production password is never included in source or browser bundles. Verify with `npm test`, `npm run check`, and `npm run build`.

## Artwork and exports

Unmodified electronic invitation originals are retained in `artwork/`. Both are 4000 × 5000 (4:5). Delivery JPGs retain those dimensions and are compressed for deployment. Named designs define the layout; no-name designs supplied visual references for clearing sample recipient lines. Only localized feathered patches cover the recipient areas; other fixed details remain intact.

Preview, single PNG and Excel batch PNG share one canvas routine. Names use supplied Thmanyah Serif Display Bold with Arabic shaping and adaptive one-line fitting. Exports normally use 4000 × 5000; devices unable to allocate that canvas retry 3200 × 4000 and 2560 × 3200, reporting actual size. Mobile users receive a save-image dialog.

## Excel

Import .xlsx/.xls with Name and optional Language (ar/en). Blank languages use the selection at import. Multi-sheet workbooks have a selector. Review, edit or remove rows; invalid rows cannot export. Limits: 10 MB, 500 guests, bounded worksheet dimensions, 100 sheets and bounded XLSX decompression. Parsing runs in a dedicated Worker terminated after 20 seconds. ZIP groups contain at most 2 invitations on touch devices or 5 on desktop; only the latest ZIP remains in memory. Names and workbooks are never uploaded or persisted.

## Private server

Sites access is owner-only and the app requires admin login. The Worker protects the generator, fonts and invitation artwork with no static bypass; only the login page and its explicit branding assets/password-eye script bypass the app login. D1 stores hashed session identifiers, CSRF tokens, expirations, credential fingerprints and hashed-IP throttles; no guest names. Deployment applies `drizzle/` migrations. Bindings: DB, ADMIN_USERNAME, ADMIN_PASSWORD_HASH (secret), APP_ORIGIN. Credential rotation invalidates sessions.

The supplied gold logo preserves its exact lettering in navigation and login. Interface English headings prefer a locally installed Algerian face, with bundled Libre Baskerville fallback; no commercial font is redistributed. Arabic studio headings and poster names use supplied Thmanyah. The supplied concert cover is optimized for the responsive login panel.

Build output is `dist/server/index.js` with `.openai/hosting.json`. Original artwork is not exposed by the server. Bundled local dependencies: SheetJS CE 0.20.3 (Apache-2.0), JSZip 3.10.1 (MIT), Aref Ruqaa and Libre Baskerville interface fonts (SIL OFL), supplied Thmanyah. Feature-detected WebMCP uses the same validation and drawing routine.
