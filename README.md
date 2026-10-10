# Community Compass — GitHub Pages Portfolio Demo

A local business discovery website built with HTML, Bootstrap, JavaScript ES modules, dynamic category/subcategory filtering, favorites, deals, and a review and business editor **demo**.

This is an adapted static deployment of the original Community Compass project. The original project used JSON Server for writable `/businesses` and `/reviews` endpoints. GitHub Pages cannot run that backend, so this edition reads `db.json` and stores changes **only in each visitor's browser**.

The updated `db.json` contains **50 fictional example businesses across Food (16), Retail (16), Service (18), and 25 subcategories**, to exercise the filtering and editor features. These are illustrative portfolio records, **not verified real businesses or public reviews**. The two original fictional sample records are preserved.

## What's functional

- Read sample businesses from the published `db.json`
- Category dropdown and dependent subcategory dropdown derived from actual records
- Search by name/description/address, filter favorites and deals
- Favorite businesses in browser storage
- Display stored written reviews and submit demo reviews with 1–5 rating and arithmetic CAPTCHA
- Demo Editor for adding, editing and removing businesses/deals **in the current browser**. Click **Open Demo Editor**, then **Add Business** or the **Edit/Delete** buttons shown on each business card
- Reset local demo changes

**Important limitations:** Data entered in Demo Editor or reviews is saved only to that visitor's browser via `localStorage`. The changes aren't added to `db.json`, don't reach other visitors, and can be lost when storage is cleared. The earlier hard-coded client-side admin password was intentionally removed: it was not real access control and would be public to anybody reading the JavaScript. This is not a secure admin backend or a production public review system. The CAPTCHA is a UI demonstration, not server-side bot defense. `db.json` includes summary ratings and counts for some example businesses but no historical review text, so those summaries are displayed without invented individual reviews.

## How the public database and editor work

- `db.json` is a **read-only starter dataset**. The published website fetches the current file whenever a visitor opens the site.
- Clicking **Open Demo Editor** enables edit/delete buttons and **Add Business**. There is **no password** because it is intentionally a public sandbox, not real administrator access.
- Edits, deletions and user-added records are stored as a small browser-local **overlay** under `community-compass-demo-overrides-v2`, instead of caching the entire starter database. New businesses published to `db.json` will appear even when the visitor has existing demo edits.
- A person who edits the demo will see their own changes on subsequent visits with the same browser, but no one else will see them.
- **Reset local demo** removes those edits and loads the published starter data again. Older v1 browser demo changes do not migrate to v2; those were browser-only temporary changes.
- To permanently publish new sample businesses to everyone, change `db.json` in the GitHub repo and commit it (or upload the updated file).
- To enable genuinely shared, password-protected administration, use a backend such as Supabase with authenticated write permissions and RLS. Do **not** embed administrator passwords or service keys in a public GitHub Pages site.

## Test locally

From this folder, run:

```bash
python -m http.server 5500
```

Open `http://localhost:5500/`. Alternatively use VS Code's **Live Server**. Don't double-click `index.html` using the `file://` protocol: browsers may block module imports and JSON fetches. **JSON Server is not needed for this GitHub Pages edition.**

## Publish free to GitHub Pages

1. Create/sign into the intended GitHub account at https://github.com/signup.
2. Create a **public** repository named `community-compass`. GitHub Pages is available for public repositories on GitHub Free.
3. **Unzip the project** and upload the *contents* — `index.html`, `db.json`, `js/`, and `README.md` — to the repository's **root**. Do not upload the ZIP alone or nest the project folder one directory down.
4. Open repository **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, branch **main**, directory **/(root)**, then Save.
5. Visit `https://svettiy.github.io/community-compass/` after deployment. Allow GitHub time to publish changes.
6. Test category, subcategory, search, favorites, review submission, editor, reset and refresh in an incognito browser window. For an existing repository, upload the **updated `db.json`, `index.html`, `js/api.js`, `js/main.js`, and `js/ui.js`** or replace all files using the complete ZIP contents (do not upload the ZIP itself).

GitHub Pages only serves static resources; to share newly posted reviews and business edits across visitors, connect a database/backend (for example Supabase with Row Level Security and authenticated writes) instead of browser-only storage.

## Source files

- `index.html` — Bootstrap markup and interactive controls
- `db.json` — starter business/review data
- `js/api.js` — static JSON loader and browser-local change overlays
- `js/categories.js` — dynamic dropdown generation
- `js/filters.js` — search and selection filters
- `js/ui.js` — safely escaped business card display and bookmarks
- `js/reviews.js` — reviews, pagination and rating updates
- `js/main.js` — app startup and demo editor
- `js/storage.js` — favorites storage

## Admissions presentation

Use the published URL as the live prototype in the Michigan Ross artifact and link this repository as supporting source code. Clearly label the site as a prototype; do not claim public, permanent shared review/admin persistence.
