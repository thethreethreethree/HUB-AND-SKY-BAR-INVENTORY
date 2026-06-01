# HUB AND SKY BAR INVENTORY

A simple browser-based inventory management system for Hub & Skybar.

## Files included

- `index.html` — inventory app user interface
- `styles.css` — styling for the dashboard
- `app.js` — inventory state, CSV/JSON import-export, image OCR, and login
- `sample-inventory.csv` — example CSV file using the same inventory schema

## Features

- password-protected access (default password: `hubandsky`)
- add, edit, delete inventory items
- search items and filter by category
- sort any column by clicking its header
- import and export inventory via CSV and JSON
- paste CSV/JSON directly into the interface
- image upload OCR to auto-populate inventory rows from photos
- local browser persistence using `localStorage`

## Usage

1. Open `index.html` in a browser.
2. Enter the password: `hubandsky`.
3. Add items manually or import data from CSV/JSON.
4. Use `Export CSV` or `Export JSON` to save backups and share records.
5. Store exported files in your local repo or share them with staff.

## Notes

- The app stores records locally in the browser; exporting is required for repo-backed sharing.
- For production, change the password hash in `app.js` and use a secure login flow.
- `sample-inventory.csv` demonstrates the required format for data import.
