require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const { CryptoPay } = require('@foile/crypto-pay-api');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Подключение к БД (не падаем, если её нет)
let db = null;
if (process.env.DATABASE_URL) {
    db = new Client({ connectionString: process.env.DATABASE_URL });
    db.connect()
        .then(() => console.log('✅ База данных подключена'))
        .catch(err => console.error('⚠️ Ошибка БД:', err.message));
} else {
    console.log('⚠️ DATABASE_URL не задан — сервер работает без БД');
}

// Crypto Pay (не падаем, если токена нет)
let cryptoPay = null;
if (process.env.CRYPTO_PAY_TOKEN) {
    cryptoPay = new CryptoPay(process.env.CRYPTO_PAY_TOKEN);
    console.log('✅ Crypto Pay подключён');
} else {
    console.log('⚠️ CRYPTO_PAY_TOKEN не задан');
}

// Тестовый маршрут
app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Баланс
app.get('/api/balance/:userId', async (req, res) => {
    if (!db) return res.json({ balance: 10000 });
    const { userId } = req.params;
    try {
        const result = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [userId]);
        if (result.rows.length === 0) {
            await db.query('INSERT INTO users (telegram_id, balance) VALUES ($1, $2)', [userId, 10000]);
            return res.json({ balance: 10000 });
        }
        res.json({ balance: result.rows[0].balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Пополнение
app.post('/api/deposit', async (req, res) => {
    if (!cryptoPay) return res.status(500).json({ error: 'Crypto Pay не настроен' });
    if (!db) return res.status(500).json({ error: 'База данных не подключена' });

    const { userId, amountRub } = req.body;
    const amountUsdt = (amountRub / 95).toFixed(2);

    try {
        const invoice = await cryptoPay.createInvoice('USDT', amountUsdt, {
            description: `Пополнение баланса на ${amountRub} RUB`,
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

// Вывод
app.post('/api/withdraw', async (req, res) => {
    if (!db) return res.status(500).json({ error: 'База данных не подключена' });
    const { userId, amountRub } = req.body;

    try {
        const balanceRes = await db.query('SELECT balance FROM users WHERE telegram_id = $1', [userId]);
        if (balanceRes.rows.length === 0 || balanceRes.rows[0].balance < amountRub) {
            return res.status(400).json({ error: 'Недостаточно средств' });
        }
        res.json({ success: true, message: 'Заявка на вывод создана' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Вебхук от Crypto Pay
app.post('/crypto/webhook', async (req, res) => {
    if (!db) return res.sendStatus(200);

    const { update_type, payload } = req.body;

    if (update_type === 'invoice_paid') {
        try {
            const invoiceData = JSON.parse(payload.payload);
            const { userId, amountRub } = invoiceData;

            await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amountRub, userId]);
            await db.query('UPDATE invoices SET status = $1 WHERE invoice_id = $2', ['paid', payload.invoice_id]);
            console.log(`✅ Пользователь ${userId} пополнил на ${amountRub} RUB`);
        } catch (err) {
            console.error('Ошибка вебхука:', err);
        }
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});