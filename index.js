require('dotenv').config();
const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let db = null;
if (process.env.DATABASE_URL) {
    db = new Client({ connectionString: process.env.DATABASE_URL });
    db.connect()
        .then(() => {
            console.log('✅ БД подключена');
            return initDB();
        })
        .catch(err => console.error('⚠️ БД:', err.message));
}

async function initDB() {
    if (!db) return;
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                telegram_id BIGINT PRIMARY KEY,
                balance INTEGER DEFAULT 10000,
                banned BOOLEAN DEFAULT FALSE
            );
        `);
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;`);

        await db.query(`
            CREATE TABLE IF NOT EXISTS deposits (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT,
                amount INTEGER,
                charge_id TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await db.query(`ALTER TABLE deposits ADD COLUMN IF NOT EXISTS charge_id TEXT;`);

        await db.query(`
            CREATE TABLE IF NOT EXISTS withdrawals (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT,
                amount INTEGER,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        const defaults = {
            'game.win_chance': '50',
            'mines.mine_chance': '30',
            'admin.always_win': 'off',
            'mines.multiplier': '1.3',
            'mines.max_mines': '24',
            'mines.min_bet': '1',
            'hl.min_bet': '1',
            'global.min_deposit': '50',
            'global.min_withdraw': '100'
        };
        for (const [key, value] of Object.entries(defaults)) {
            await db.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, [key, value]);
        }
        console.log('✅ Таблицы готовы');
    } catch (err) { console.error('Ошибка таблиц:', err.message); }
}

async function getSetting(key) {
    if (!db) return null;
    const r = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return r.rows.length ? r.rows[0].value : null;
}

async function setSetting(key, value) {
    if (!db) return;
    await db.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`, [key, value]);
}

const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
function isAdmin(userId) { return ADMIN_IDS.includes(String(userId)); }

const BOT_TOKEN = process.env.BOT_TOKEN;

app.get('/api/balance/:userId', async (req, res) => {
    if (!db) return res.json({ balance: 10000 });
    const { userId } = req.params;
    try {
        const result = await db.query('SELECT balance, banned FROM users WHERE telegram_id = $1', [userId]);
        if (result.rows.length === 0) {
            await db.query('INSERT INTO users (telegram_id, balance) VALUES ($1, $2)', [userId, 10000]);
            return res.json({ balance: 10000 });
        }
        if (result.rows[0].banned) return res.status(403).json({ error: 'Вы забанены' });
        res.json({ balance: result.rows[0].balance });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/settings', async (req, res) => {
    if (!db) return res.json({});
    try {
        const r = await db.query('SELECT key, value FROM settings');
        const obj = {};
        r.rows.forEach(row => obj[row.key] = row.value);
        res.json(obj);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bet', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amount } = req.body;
    try {
        const result = await db.query('SELECT balance, banned FROM users WHERE telegram_id = $1', [userId]);
        if (result.rows.length === 0 || result.rows[0].balance < amount) return res.status(400).json({ error: 'Недостаточно средств' });
        if (result.rows[0].banned) return res.status(403).json({ error: 'Вы забанены' });
        await db.query('UPDATE users SET balance = balance - $1 WHERE telegram_id = $2', [amount, userId]);
        res.json({ success: true, balance: result.rows[0].balance - amount });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/win', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amount } = req.body;
    try {
        await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amount, userId]);
        const result = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [userId]);
        res.json({ success: true, balance: result.rows[0].balance });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/create-invoice-link', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amount } = req.body;

    if (!BOT_TOKEN) return res.status(500).json({ error: 'BOT_TOKEN не задан' });

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Пополнение баланса',
                description: `Пополнение на ${amount} Stars`,
                payload: JSON.stringify({ userId, amount }),
                currency: 'XTR',
                prices: [{ label: 'Пополнение', amount: amount }]
            })
        });

        const result = await response.json();
        if (result.ok) {
            await db.query(
                'INSERT INTO deposits (telegram_id, amount, status) VALUES ($1, $2, $3)',
                [userId, amount, 'pending']
            );
            res.json({ invoiceLink: result.result });
        } else {
            console.error('Telegram API error:', result);
            res.status(500).json({ error: result.description || 'Ошибка создания ссылки' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/withdraw-stars', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amount } = req.body;

    try {
        const balanceRes = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [userId]);
        if (balanceRes.rows.length === 0 || balanceRes.rows[0].balance < amount) {
            return res.status(400).json({ error: 'Недостаточно средств' });
        }

        await db.query('UPDATE users SET balance = balance - $1 WHERE telegram_id = $2', [amount, userId]);
        await db.query(
            'INSERT INTO withdrawals (telegram_id, amount, status) VALUES ($1, $2, $3)',
            [userId, amount, 'pending']
        );

        console.log(`📤 Заявка на вывод Stars: ${userId} | ${amount} ⭐`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/telegram/webhook', async (req, res) => {
    const update = req.body;

    if (update.pre_checkout_query) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pre_checkout_query_id: update.pre_checkout_query.id,
                    ok: true
                })
            });
        } catch (err) { console.error('pre_checkout error:', err); }
    }

    if (update.message?.successful_payment) {
        const payment = update.message.successful_payment;
        const payload = JSON.parse(payment.invoice_payload);
        const { userId, amount } = payload;

        try {
            await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amount, userId]);
            await db.query(
                'UPDATE deposits SET status = $1, charge_id = $2 WHERE telegram_id = $3 AND amount = $4 AND status = $5',
                ['paid', payment.telegram_payment_charge_id, userId, amount, 'pending']
            );
            console.log(`✅ Stars: ${userId} пополнил на ${amount} ⭐`);
        } catch (err) {
            console.error('Ошибка начисления:', err);
        }
    }

    res.sendStatus(200);
});

app.get('/api/admin/check/:userId', (req, res) => {
    res.json({ isAdmin: isAdmin(req.params.userId) });
});

app.get('/api/admin/config/:userId', async (req, res) => {
    if (!isAdmin(req.params.userId)) return res.status(403).json({ error: 'Нет доступа' });
    try {
        const r = await db.query('SELECT key, value FROM settings');
        const obj = {};
        r.rows.forEach(row => obj[row.key] = row.value);
        res.json({ config: obj });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/config', async (req, res) => {
    const { adminId, config } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    try {
        for (const [key, value] of Object.entries(config)) {
            await setSetting(key, String(value));
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/give-money', async (req, res) => {
    const { adminId, amount } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    try {
        await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amount, adminId]);
        const r = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [adminId]);
        res.json({ success: true, balance: r.rows[0].balance });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/withdrawals/:userId', async (req, res) => {
    if (!isAdmin(req.params.userId)) return res.status(403).json({ error: 'Нет доступа' });
    try {
        const r = await db.query(`SELECT * FROM withdrawals ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 50`);
        res.json({ withdrawals: r.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/withdrawal-status', async (req, res) => {
    const { adminId, withdrawalId, status } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    try {
        if (status === 'rejected') {
            const w = await db.query('SELECT telegram_id, amount, status FROM withdrawals WHERE id = $1', [withdrawalId]);
            if (w.rows.length && w.rows[0].status === 'pending') {
                await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [w.rows[0].amount, w.rows[0].telegram_id]);
            }
        }
        await db.query('UPDATE withdrawals SET status = $1 WHERE id = $2', [status, withdrawalId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`👑 Админы: ${ADMIN_IDS.join(', ') || 'не заданы'}`);
});
