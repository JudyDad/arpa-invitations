# ARPA invitations

Private Arabic and English generator. `npm run preview` starts a loopback-only preview with username `arpa` and the test-only password `local-test-password!`. Production credentials are Sites runtime secrets; the production password is never included in source or browser bundles. Verify with `npm test`, `npm run check`, and `npm run build`.

## Artwork and exports

Unmodified electronic invitation originals are retained in `artwork/`. Both are 4000 × 5000 (4:5). Delivery JPGs retain those dimensions and are compressed for deployment. Named designs define the layout; no-name designs supplied visual references for clearing sample recipient lines. Only localized feathered patches cover the recipient areas; other fixed details remain intact.

Preview, single PNG and Excel batch PNG share one canvas routine. Names use supplied Thmanyah Serif Display Bold with Arabic shaping and adaptive one-line fitting. Exports normally use 4000 × 5000; devices unable to allocate that canvas retry 3200 × 4000 and 2560 × 3200, reporting actual size. Mobile users receive a save-image dialog.

## Excel

Import .xlsx/.xls with Name and optional Language (ar/en). Blank languages use the selection at import. Multi-sheet workbooks have a selector. Review, edit or remove rows; invalid rows cannot export. Limits: 10 MB, 500 guests, bounded worksheet dimensions, 100 sheets and bounded XLSX decompression. Parsing runs in a dedicated Worker terminated after 20 seconds. ZIP groups contain at most 2 invitations on touch devices or 5 on desktop; only the latest ZIP remains in memory. Workbook files and images remain in the browser. Successful generation records recipient names, languages, timestamps, source and output dimensions in the private dashboard database.

## Private server

The current Sites audience allows everyone to reach the login page; the app requires admin login for the generator and dashboard. The Worker protects fonts, invitation artwork and history with no static bypass; only the login page and its explicit branding assets/password-eye script bypass the app login. D1 stores authentication metadata and invitation history. Deployment applies `drizzle/` migrations. Bindings: DB, ADMIN_USERNAME, ADMIN_PASSWORD_HASH (secret), APP_ORIGIN. Credential rotation invalidates sessions.

## Dashboard

Visit `/dashboard` for all-time total, Arabic, English and distinct-recipient counts. The history starts with this feature; previous browser-only exports cannot be recovered. One generated image is one invitation, including individual images inside a completed ZIP. Re-generating an invitation counts again; retrying an identical record request does not. Counts indicate generated images, not verified saves or delivery to guests. Draft names, invalid inputs and cancelled ZIPs before recording are excluded. A cancellation/sign-out after the server has committed a record may leave that generated image in history even if no download is presented.

Search by name, filter by language and inclusive dates (Damascus time), browse pages of 50, and export matching records to Excel (maximum 10000 per report). History and exports require an authenticated admin. POST records require CSRF plus exact Origin, shared server-side name validation, bounded batch sizes and idempotent operation identifiers. No image data or workbook files are stored.

The supplied gold logo preserves its exact lettering in navigation and login. Interface English headings prefer a locally installed Algerian face, with bundled Libre Baskerville fallback; no commercial font is redistributed. Arabic studio headings and poster names use supplied Thmanyah. The supplied concert cover is optimized for the responsive login panel.

Build output is `dist/server/index.js` with `.openai/hosting.json`. Original artwork is not exposed by the server. Bundled local dependencies: SheetJS CE 0.20.3 (Apache-2.0), JSZip 3.10.1 (MIT), Aref Ruqaa and Libre Baskerville interface fonts (SIL OFL), supplied Thmanyah. Feature-detected WebMCP uses the same validation and drawing routine.
Each dashboard row has a Delete button. A confirmation names the recipient and identifies the language/date. Confirming removes the record and recalculates totals, language counts and distinct recipients; downloaded images are unaffected. Deletion requires an authenticated admin, CSRF and exact Origin. Only the deleted record's identifier/timestamp are retained to prevent delayed generation retries from recreating it; recipient details are removed from invitation history. Repeated deletes are safe and last-page pagination is clamped automatically.

Arabic posters accept Arabic, Latin, or mixed recipient names, including accented Latin letters. English posters accept Latin names. Diacritics must match the preceding letter script; digits and other symbols remain rejected. Input and canvas direction follow the name’s first letter.
