# Invoice Generator

## Overview
This project is a web-based Invoice Generator designed to help users create, view, and manage invoices efficiently. It features user authentication, invoice creation, previous bills management, and a clean, scrollable UI for reviewing past invoices.

## Features
- **User Authentication:** Secure login system for authorized access.
- **Invoice Creation:** Generate invoices with customer details, itemized billing, and automatic calculation of totals.
- **Month & Year Selection:** Select billing month and year; correct month names are displayed in invoices.
- **Previous Bills Modal:** View all previously generated invoices in a scrollable modal table, sorted by ID in ascending order.
- **Print & Save:** Print invoices directly from the app and save them for future reference.
- **Responsive UI:** Clean, modern interface with scrollable tables and modals for easy navigation.

## Folder Structure
```
Invoice_generator/
  public/
    login.css         # Styles for login and modal UI
    login.html        # Login page
    logo.png          # App logo
    main.css          # Main app styles
    main.html         # Main app page
    js/
      main.js         # Core client-side logic
  auth.js             # Authentication logic
  db.js               # Database connection and queries
  package.json        # Project dependencies and scripts
  server.js           # Express server setup
```

## Requirements
- **Node.js** (v14+ recommended)
- **npm** (v6+ recommended)
- **Express** (for server)
- **Database:** MongoDB or compatible (see `db.js` for details)

## Installation
1. **Clone the repository:**
   ```powershell
   git clone <repo-url>
   cd Invoice_generator
   ```
2. **Install dependencies:**
   ```powershell
   npm install
   ```
3. **Set up the database:**
   - Configure your MongoDB connection in `db.js`.
   - Ensure MongoDB is running locally or remotely.
4. **Start the server:**
   ```powershell
   node server.js
   ```

## Usage
- Open `http://localhost:3000` in your browser.
- Log in using your credentials.
- Create new invoices, view previous bills, and print as needed.
- Use the month/year selectors to filter and generate invoices for specific periods.

## Project Manual
### Authentication
- Login page (`login.html`) handles user authentication.
- Credentials are verified via server-side logic in `auth.js`.

### Invoice Creation
- Fill in customer and billing details in the main app page (`main.html`).
- Items and amounts are entered; totals are calculated automatically.
- Month and year selection ensures correct billing period.

### Previous Bills Modal
- Access previous invoices via the modal.
- Table is scrollable and sorted by ID.
- Print logic and buttons are removed for a cleaner view.

### Printing & Saving
- Invoices can be printed directly from the app.
- Saved invoices are retrievable from the previous bills modal.

### UI/UX
- Styles are managed in `login.css` and `main.css`.
- Modal and table layouts are optimized for usability.


## License
This project is for educational and internal use. Please contact the author for licensing details.

## Author
- PRINCE RAJ SINGH
- Contact: SILENCE11444@GMAIL.COM
