# HUB AND SKY BAR INVENTORY

A simple browser-based inventory management system for Hub & Skybar.

## Files included

- `index.html` — desktop inventory dashboard (table view)
- `mobile.html` — mobile-optimized page (card view, bottom sheets, camera capture)
- `styles.css` — styling for the desktop dashboard
- `mobile.css` — styling for the mobile page
- `inventory-core.js` — shared logic: storage, CSV/JSON parsing, OCR, default dataset
- `app.js` — desktop page controller (table, search/sort/filter, forms)
- `mobile.js` — mobile page controller (cards, bottom-sheet forms, camera/photo OCR)
- `sample-inventory.csv` — full Hub & Skybar inventory in the import schema

## Features

- password-protected access (default password: `hubandsky`)
- add, edit, delete inventory items — on both the desktop and mobile pages
- search items and filter by category
- sort any column by clicking its header (desktop)
- import and export inventory via CSV and JSON
- paste CSV/JSON directly into the interface (desktop)
- one-click "Load full list" to seed the full Hub & Skybar inventory
- image OCR to auto-populate rows from photos (printed text reads best)
- mobile "Take a picture" camera capture that feeds OCR
- desktop and mobile share the same `localStorage` data, so edits stay in sync
- local browser persistence using `localStorage`

## Usage

1. Open `index.html` (desktop) or `mobile.html` (phone) in a browser.
2. Enter the password: `hubandsky`.
3. Add items manually, tap "Load full list", or import data from CSV/JSON.
4. On a phone, use "Take a picture" or "Upload image" to scan a list with OCR.
5. Use `Export CSV` / `Export JSON` to save backups and share records.
6. Store exported files in your local repo or share them with staff.

## Notes

- The app stores records locally in the browser; exporting is required for repo-backed sharing.
- For production, change the password (`PASSWORD` in `inventory-core.js`) and use a secure login flow.
- `sample-inventory.csv` demonstrates the required format for data import.
- OCR (Tesseract.js) reads **printed** text well but cannot reliably read
  handwriting — the handwritten "Min on hand" counts on scanned sheets should be
  reviewed and corrected after importing.
