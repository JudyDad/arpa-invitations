# Security review — October 10, 2026

## Controls

- Owner-only Sites access plus server-side admin login. Salted PBKDF2-SHA256 secret, 100000 iterations (supported Worker runtime limit), constant-time comparison.
- Random 256-bit opaque sessions; Secure, HttpOnly, SameSite=Strict, __Host cookie in production. Only token hashes are stored. Eight-hour expiration, logout revocation and credential-rotation invalidation.
- Exact Origin checks for login; Origin plus CSRF token for logout. Atomic durable IP/account throttles. Unknown users and wrong passwords have identical responses.
- Every application asset requires authentication. Private/no-store responses, restrictive CSP, framing denial, no credential in browser bundles, no guest-name API or storage.
- Bounded login bodies. Excel size, format, row, column, sheet, decompression and time limits. Imported text uses DOM text/value APIs. Script/name validation blocks invalid export.
- Competing export/import edits locked. Logout clears names, previews and object URLs; a single export completed after logout is discarded. ZIP memory retained for only one small group.

## Review scope

Automated tests cover name validation, accents, Arabic diacritics, Excel fallback, filenames, anonymous asset denial, cookie flags, CSRF, cross-origin rejection, logout replay, durable throttling, expiry, forged sessions, credential rotation and fail-closed configuration. Browser checks cover login, retained language inputs, native PNG dimensions, mixed Excel validation, multi-sheet switching, ZIP dimensions, narrow layout and logout.

This code and scenario review is not a third-party penetration test or a guarantee that every possible bug is absent. Actual iOS/Android testing remains necessary for platform-specific saving and memory behavior. Keep Sites owner-only access enabled. Downloaded images remain on the user's device after sign-out.
