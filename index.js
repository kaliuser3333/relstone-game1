require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const { CryptoPay } = require('@foile/crypto-pay-api');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let db = null;
if (process.env.DATABASE_URL) {
    db = new Client({ connectionString: process.env.DATABASE_URL });
    db.connect()
        .then(() => {
            console.log('✅ База данных подключена');
            return initDB();
        })
        .catch(err => console.error('⚠️ Ошибка БД:', err.message));
}

async function initDB() {
    if (!db) return;
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                telegram_id BIGINT PRIMARY KEY,
                balance INTEGER DEFAULT 10000,
                banned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;`);
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();`);

        await db.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                invoice_id BIGINT PRIMARY KEY,
                telegram_id BIGINT,
                amount_rub INTEGER,
                status TEXT
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS withdrawals (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT,
                amount_rub INTEGER,
                bank TEXT,
                card TEXT,
                name TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await db.query(`ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS bank TEXT;`);
        await db.query(`ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS card TEXT;`);
        await db.query(`ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS name TEXT;`);

        // Настройки игр
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        // Значения по умолчанию
        const defaults = {
            'mines.multiplier_base': '1.1',      // базовый множитель за клетку
            'mines.win_chance_modifier': '100',  // 100 = честно, 50 = в 2 раза меньше шанс выиграть
            'mines.max_mines': '24',
            'mines.min_bet': '10',
            'mines.max_bet': '100000',
            'hl.min_bet': '10',
            'hl.max_bet': '100000',
            'hl.win_chance_modifier': '100',     // 100 = честно, 70 = сложнее
            'hl.max_streak': '10',
            'global.maintenance': 'off',         // on = тех.работы
            'global.min_deposit': '100',
            'global.min_withdraw': '100'
        };
        for (const [key, value] of Object.entries(defaults)) {
            await db.query(
                `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
                [key, value]
            );
        }

        console.log('✅ Таблицы готовы');
    } catch (err) {
        console.error('Ошибка таблиц:', err.message);
    }
}

let cryptoPay = null;
if (process.env.CRYPTO_PAY_TOKEN) {
    cryptoPay = new CryptoPay(process.env.CRYPTO_PAY_TOKEN);
    console.log('✅ Crypto Pay подключён');
}

// ===== ПОЛУЧЕНИЕ НАСТРОЕК =====
async function getSetting(key) {
    if (!db) return null;
    const r = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return r.rows.length ? r.rows[0].value : null;
}

async function setSetting(key, value) {
    if (!db) return;
    await db.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2) 
         ON CONFLICT (key) DO UPDATE SET value = $2`,
        [key, value]
    );
}

// ===== ПРОВЕРКА АДМИНА =====
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

function isAdmin(userId) {
    return ADMIN_IDS.includes(String(userId));
}

// ===== БАЛАНС =====
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== НАСТРОЙКИ ДЛЯ КЛИЕНТА =====
app.get('/api/settings', async (req, res) => {
    if (!db) return res.json({});
    try {
        const r = await db.query('SELECT key, value FROM settings');
        const obj = {};
        r.rows.forEach(row => obj[row.key] = row.value);
        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== СТАВКА =====
app.post('/api/bet', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amount } = req.body;
    try {
        const result = await db.query('SELECT balance, banned FROM users WHERE telegram_id = $1', [userId]);
        if (result.rows.length === 0 || result.rows[0].balance < amount) {
            return res.status(400).json({ error: 'Недостаточно средств' });
        }
        if (result.rows[0].banned) return res.status(403).json({ error: 'Вы забанены' });
        await db.query('UPDATE users SET balance = balance - $1 WHERE telegram_id = $2', [amount, userId]);
        res.json({ success: true, balance: result.rows[0].balance - amount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ВЫИГРЫШ =====
app.post('/api/win', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amount } = req.body;
    try {
        await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amount, userId]);
        const result = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [userId]);
        res.json({ success: true, balance: result.rows[0].balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ПОПОЛНЕНИЕ =====
app.post('/api/deposit', async (req, res) => {
    if (!cryptoPay) return res.status(500).json({ error: 'Crypto Pay не настроен' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    const { userId, amountRub } = req.body;
    const amountUsdt = (amountRub / 95).toFixed(2);

    try {
        const invoice = await cryptoPay.createInvoice('USDT', amountUsdt, {
            description: `Пополнение на ${amountRub} RUB`,
            payload: JSON.stringify({ userId, amountRub }),
            paid_btn_name: 'openBot',
            paid_btn_url: 'https://t.me/твой_бот'
        });
        await db.query(
            'INSERT INTO invoices (invoice_id, telegram_id, amount_rub, status) VALUES ($1, $2, $3, $4)',
            [invoice.invoice_id, userId, amountRub, 'pending']
        );
        res.json({ payUrl: invoice.bot_invoice_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка создания счета' });
    }
});

// ===== ВЫВОД =====
app.post('/api/withdraw', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'БД не подключена' });
    const { userId, amountRub, bank, card, name } = req.body;

    try {
        const balanceRes = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [userId]);
        if (balanceRes.rows.length === 0 || balanceRes.rows[0].balance < amountRub) {
            return res.status(400).json({ error: 'Недостаточно средств' });
        }
        await db.query('UPDATE users SET balance = balance - $1 WHERE telegram_id = $2', [amountRub, userId]);
        await db.query(
            `INSERT INTO withdrawals (telegram_id, amount_rub, bank, card, name, status) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, amountRub, bank || 'не указан', card || 'не указан', name || 'не указан', 'pending']
        );
        console.log(`📤 Заявка: ${userId} | ${amountRub} ₽ | ${bank} | ${card} | ${name}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ВЕБХУК CRYPTO PAY =====
app.post('/crypto/webhook', async (req, res) => {
    if (!db) return res.sendStatus(200);
    const { update_type, payload } = req.body;

    if (update_type === 'invoice_paid') {
        try {
            const invoiceData = JSON.parse(payload.payload);
            const { userId, amountRub } = invoiceData;
            await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amountRub, userId]);
            await db.query('UPDATE invoices SET status = $1 WHERE invoice_id = $2', ['paid', payload.invoice_id]);
            console.log(`✅ ${userId} пополнил на ${amountRub} RUB`);
        } catch (err) {
            console.error('Ошибка вебхука:', err);
        }
    }
    res.sendStatus(200);
});

// =========================================================
// ===== АДМИН API =========================================
// =========================================================

// Проверка, админ ли
app.get('/api/admin/check/:userId', (req, res) => {
    res.json({ isAdmin: isAdmin(req.params.userId) });
});

// Дашборд — общая статистика
app.get('/api/admin/dashboard/:userId', async (req, res) => {
    if (!isAdmin(req.params.userId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const totalBalance = await db.query('SELECT COALESCE(SUM(balance), 0) as sum FROM users');
        const pendingWithdrawals = await db.query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'");
        const totalWithdrawn = await db.query("SELECT COALESCE(SUM(amount_rub), 0) as sum FROM withdrawals WHERE status = 'done'");
        const totalDeposited = await db.query("SELECT COALESCE(SUM(amount_rub), 0) as sum FROM invoices WHERE status = 'paid'");

        res.json({
            users: parseInt(usersCount.rows[0].count),
            totalBalance: parseInt(totalBalance.rows[0].sum),
            pendingWithdrawals: parseInt(pendingWithdrawals.rows[0].count),
            totalWithdrawn: parseInt(totalWithdrawn.rows[0].sum),
            totalDeposited: parseInt(totalDeposited.rows[0].sum)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Список заявок на вывод
app.get('/api/admin/withdrawals/:userId', async (req, res) => {
    if (!isAdmin(req.params.userId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        const r = await db.query(
            `SELECT * FROM withdrawals ORDER BY 
             CASE WHEN status = 'pending' THEN 0 ELSE 1 END, 
             created_at DESC LIMIT 100`
        );
        res.json({ withdrawals: r.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Изменить статус заявки
app.post('/api/admin/withdrawal-status', async (req, res) => {
    const { adminId, withdrawalId, status } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        // Если отклоняем — возвращаем баланс
        if (status === 'rejected') {
            const w = await db.query('SELECT telegram_id, amount_rub, status FROM withdrawals WHERE id = $1', [withdrawalId]);
            if (w.rows.length && w.rows[0].status === 'pending') {
                await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', 
                    [w.rows[0].amount_rub, w.rows[0].telegram_id]);
            }
        }
        await db.query('UPDATE withdrawals SET status = $1 WHERE id = $2', [status, withdrawalId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получить все настройки
app.get('/api/admin/settings/:userId', async (req, res) => {
    if (!isAdmin(req.params.userId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        const r = await db.query('SELECT key, value FROM settings');
        const obj = {};
        r.rows.forEach(row => obj[row.key] = row.value);
        res.json({ settings: obj });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновить настройки
app.post('/api/admin/settings', async (req, res) => {
    const { adminId, settings } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        for (const [key, value] of Object.entries(settings)) {
            await setSetting(key, String(value));
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Поиск игрока по ID
app.get('/api/admin/user/:adminId/:targetId', async (req, res) => {
    if (!isAdmin(req.params.adminId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        const r = await db.query('SELECT telegram_id, balance, banned, created_at FROM users WHERE telegram_id = $1', [req.params.targetId]);
        if (r.rows.length === 0) return res.status(404).json({ error: 'Не найден' });
        res.json({ user: r.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Изменить баланс игрока
app.post('/api/admin/user-balance', async (req, res) => {
    const { adminId, targetId, balance } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        await db.query('UPDATE users SET balance = $1 WHERE telegram_id = $2', [balance, targetId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Бан/разбан
app.post('/api/admin/user-ban', async (req, res) => {
    const { adminId, targetId, banned } = req.body;
    if (!isAdmin(adminId)) return res.status(403).json({ error: 'Нет доступа' });
    if (!db) return res.status(500).json({ error: 'БД не подключена' });

    try {
        await db.query('UPDATE users SET banned = $1 WHERE telegram_id = $2', [banned, targetId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`👑 Админы: ${ADMIN_IDS.join(', ') || 'не заданы'}`);
});
