// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// Trigger DB initialization
require('./db');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded login credentials
const LOGIN_USER = "admin";
const LOGIN_PASS = "12345";

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === LOGIN_USER && password === LOGIN_PASS) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// Save invoice
app.post('/save-invoice', async (req, res) => {
    try {
        const { customerName, monthYear, dailyAmounts, totalAmount, totalWords } = req.body;
        const [result] = await global.db.query(
            `INSERT INTO monthly_invoices (customer_name, month_year, total_amount, total_amount_words) VALUES (?, ?, ?, ?)`,
            [customerName, monthYear, totalAmount, totalWords]
        );
        const monthId = result.insertId;

        for (const entry of dailyAmounts) {
            // Always insert a string for amount, even if null
            let amountValue = entry.amount;
            if (amountValue === null || amountValue === undefined) amountValue = '';
            await global.db.query(
                `INSERT INTO daily_amounts (month_id, bill_date, amount) VALUES (?, ?, ?)`,
                [monthId, entry.date, amountValue]
            );
        }

        res.json({ success: true, message: "Invoice saved" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Database error" });
    }
});

// Get all invoices (for listing)
app.get('/get-invoices', async (req, res) => {
    try {
        const [rows] = await global.db.query(`
            SELECT month_id, customer_name, DATE_FORMAT(month_year, '%Y-%m') AS month_year, total_amount
            FROM monthly_invoices
            ORDER BY month_year DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.json([]);
    }
});

// Get a specific invoice by ID
app.get('/get-invoice/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [[invoice]] = await global.db.query(`
            SELECT month_id, customer_name, DATE_FORMAT(month_year, '%Y-%m') AS month_year, total_amount, total_amount_words
            FROM monthly_invoices
            WHERE month_id = ?
        `, [id]);

        const [dailyAmounts] = await global.db.query(`
            SELECT bill_date, amount
            FROM daily_amounts
            WHERE month_id = ?
            ORDER BY bill_date
        `, [id]);

        res.json({ invoice, dailyAmounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// Default route
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
});
