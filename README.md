# Community Compass — GitHub Pages Portfolio Demo

A local business discovery website built with HTML, Bootstrap, JavaScript ES modules, dynamic category/subcategory filtering, favorites, deals, and a review and business editor **demo**.

This is an adapted static deployment of the original Community Compass project. The original project used JSON Server for writable `/businesses` and `/reviews` endpoints. GitHub Pages cannot run that backend, so this edition reads `db.json` and stores all changes locally in each visitor's browser.

## What's functional

- Read sample businesses from the published `db.json`
- Category dropdown and dependent subcategory dropdown derived from actual records
- Search by name/description/address, filter favorites and deals
- Favorite businesses in browser storage
- Display stored written reviews and submit demo reviews with 1–5 rating and arithmetic CAPTCHA
- Demo Editor for adding, editing and removing businesses/deals
- Reset local demo changes

**Important limitations:** Data entered in Demo Editor or reviews is saved only to that visitor's browser via `localStorage`. The changes aren't added to `db.json`, don't reach other visitors, and can be lost when storage is cleared. This is not a secure admin backend or a production public review system. The CAPTCHA is a UI demonstration, not server-side bot defense. `db.json` includes summary ratings and counts for some example businesses but no historical review text, so those summaries are displayed without invented individual reviews.

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
5. Visit `https://YOUR_USERNAME.github.io/community-compass/` after deployment. Allow GitHub time to publish changes.
6. Test category, subcategory, search, favorites, review submission, editor, reset and refresh in an incognito browser window.

GitHub Pages only serves static resources; to share newly posted reviews and business edits across visitors, connect a database/backend (for example Supabase with Row Level Security and authenticated writes) instead of browser-only storage.

## Source files

- `index.html` — Bootstrap markup and interactive controls
- `db.json` — starter business/review data
- `js/api.js` — static JSON loader and local demo-data persistence
- `js/categories.js` — dynamic dropdown generation
- `js/filters.js` — search and selection filters
- `js/ui.js` — safely escaped business card display and bookmarks
- `js/reviews.js` — reviews, pagination and rating updates
- `js/main.js` — app startup and demo editor
- `js/storage.js` — favorites storage

## Admissions presentation

Use the published URL as the live prototype in the Michigan Ross artifact and link this repository as supporting source code. Clearly label the site as a prototype; do not claim public, permanent shared review/admin persistence.
