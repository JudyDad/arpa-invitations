# Security review — October 10, 2026

## Controls

- Server-side admin login protects the generator, dashboard and records. The current Sites audience makes the login page reachable by everyone. Salted PBKDF2-SHA256 secret, 100000 iterations (supported Worker runtime limit), constant-time comparison.
- Random 256-bit opaque sessions; Secure, HttpOnly, SameSite=Strict, __Host cookie in production. Only token hashes are stored. Eight-hour expiration, logout revocation and credential-rotation invalidation.
- Exact Origin checks for login; Origin plus CSRF token for logout. Atomic durable IP/account throttles. Unknown users and wrong passwords have identical responses.
- Generator scripts, fonts, invitation artwork, dashboard and history API require authentication. The login page explicitly allows only its CSS, password-eye script and supplied logo/cover branding. Private/no-store responses, restrictive CSP, framing denial, no credential in browser bundles.
- The requested dashboard persists generated names and metadata in D1. Draft names, workbook files and image bytes are not stored. Server-side name validation, CSRF/Origin checks, bounded bodies/batches, parameterized SQL, atomic idempotent writes and paginated authenticated reads protect invitation history. Stored names are rendered with textContent. Reports are exported as typed Excel cells.
- Bounded login bodies. Excel size, format, row, column, sheet, decompression and time limits. Imported text uses DOM text/value APIs. Script/name validation blocks invalid export.
- Competing export/import edits locked. Logout clears names, previews and object URLs; a single export completed after logout is discarded. ZIP memory retained for only one small group.

## Review scope

Automated tests cover name validation, accents, Arabic diacritics, Excel fallback, filenames, anonymous asset/history denial, cookie flags, CSRF, cross-origin rejection, logout replay, durable throttling, expiry, forged sessions, credential rotation, fail-closed configuration, atomic history validation, idempotency conflicts, counts, search escaping, pagination and Damascus date boundaries. Browser checks cover login, retained language inputs, native PNG dimensions, mixed Excel validation, multi-sheet switching, ZIP dimensions, dashboard counts after actual exports, filtering, report contents, empty/error recovery, narrow layout and logout.

This code and scenario review is not a third-party penetration test or a guarantee that every possible bug is absent. Actual iOS/Android testing remains necessary for platform-specific saving and memory behavior. Preserve the server-side authentication checks when changing Sites sharing. Downloaded images remain on the user's device after sign-out.
