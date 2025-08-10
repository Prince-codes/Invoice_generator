// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        // Step 1: Connect without DB
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT
        });

        // Step 2: Create DB if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`📂 Database "${process.env.DB_NAME}" ready`);

        // Step 3: Connect to DB
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });

        // Step 4: Create tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS monthly_invoices (
                month_id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                month_year DATE NOT NULL,
                total_amount DECIMAL(10, 2),
                total_amount_words TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS daily_amounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                month_id INT,
                bill_date DATE NOT NULL,
                amount VARCHAR(20),
                FOREIGN KEY (month_id) REFERENCES monthly_invoices(month_id) ON DELETE CASCADE
            )
        `);

        console.log("✅ Tables ready");
        global.db = db;

    } catch (error) {
        console.error("❌ DB init error:", error);
    }
})();
