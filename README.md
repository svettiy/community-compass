# Community Compass — GitHub Pages Project

Community Compass is an interactive prototype for discovering neighborhood businesses and exploring how owners could manage listings, offers, and customer reviews. The project uses fictional or illustrative entries, including the Home Slice Pizza and Hair Cuttery examples. These entries do **not** represent verified hours, addresses, customer ratings, endorsements, or active offers by the named businesses.

## What's included

- Search, category and subcategory filters, favorites, deals, and rating/name sorting
- Business listing cards and review forms
- Editor for adding, updating, and removing listings and offers
- Optional address, website, phone, and business-hours fields
- Starter directory loaded from `db.json` and editor/review changes saved only within the visitor's browser

## Publishing on GitHub Pages

Upload the **contents** of this folder into the `main` branch of your `community-compass` repository. Keep `index.html`, `db.json`, and `js/` at the repository root. Choose **Settings → Pages → Deploy from a branch → main → /(root)**. Your website should appear at:

https://svettiy.github.io/community-compass/

If updates are not visible, first check deployment status in **Actions**, then refresh with **Ctrl + Shift + R**.

## Data and Editor behavior

`db.json` is publicly readable and cannot be edited by GitHub Pages visitors. When someone adds or edits a listing, leaves a review, or deletes an item using the Editor, those changes are stored in that visitor's browser. They are not shared with other visitors or committed to GitHub. **Reset local changes** clears the visitor's local edits and reviews, restoring the current public `db.json` content.

To update the public listings for everyone, edit `db.json` in the GitHub repository and commit it. The website can then load those changes without a separate database server. Persistent shared editing would require authenticated accounts and a backend.

For continuity, code can read browser changes saved under older storage identifiers and migrate them automatically. No previous browser edits are intentionally discarded by this update.

## Current scope and future concept

The current website lets users discover and compare listed businesses and try owner-facing listing management. Scheduled promotion start/end times, automatically hiding expired offers, shared cross-business campaigns, actual redemption tracking, and secure shared owner accounts are future product ideas, **not implemented features**.

## Files

- `index.html` — responsive interface
- `db.json` — illustrative directory data
- `js/main.js` — search, filters, and Editor actions
- `js/api.js` — loading public data and saving browser-local changes
- `js/categories.js`, `js/filters.js`, `js/ui.js`, `js/reviews.js`, `js/storage.js` — application modules
