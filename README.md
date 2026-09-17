Latest local implementation and first-use staff sign-in: [LOCAL-UPDATES.md](LOCAL-UPDATES.md). The research report below describes the original 16 September snapshot.

# MCCIA Director’s media coverage — local research preview

This is a separate, read-only local archive. It does not alter the main MCCIA website or the separately developed `dg-media-archive` project.

Start with `node server.mjs` from this folder, then open http://127.0.0.1:3005/. It listens on this computer only. No packages are required for the website. Stop its terminal process to stop the preview.

The public collection is in `public/records.json`. The research register, source audit, uncertain records, totals and television report are in `exports/`. Read `RESEARCH-REPORT.md` for the limits of this verification pass. Nothing in `research/` or `exports/` is served by the preview server. Only the verified CSV is downloadable through the UI.

Filters, view, sort, page and record detail selection use query parameters and survive reload. Name search recognises English and Marathi spellings. Chart totals always use the full filtered collection before pagination. Missing publication dates remain explicit and are not replaced with upload dates. Partial publication dates match overlapping date ranges.

`build-data.py` builds the isolated public dataset from the researched evidence and reads the four original catalogue files without editing them. Run it only when intentionally updating the research package. `tests.mjs` checks filtering, data integrity, URL state and original-file fingerprints. `export-workbook.mjs` creates the optional Excel research register using the bundled document runtime.

Design: restrained editorial archive, compact masthead, readable 17–18px body, MCCIA logo and blue accents, native filters and accessible focus states. No decorative full-screen hero, tracker accounts or internal team notes.

This is a manual research snapshot. Automatic discovery, OCR and upload integrations are not configured here. It has not been committed, pushed or deployed.
