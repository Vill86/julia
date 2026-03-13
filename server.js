const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Хранилище платежей (в памяти)
const payments = new Map();

// Создание платежа через YooKassa API
app.post('/api/create-payment', async (req, res) => {
    try {
        const { serviceName, amount, userId, userName, description } = req.body;
        
        console.log('📝 Новый платеж:', { serviceName, amount, userId, userName });

        // ТЕСТОВЫЙ РЕЖИМ - эмуляция без реального API
        if (process.env.TEST_MODE === 'true') {
            const paymentId = `test_${Date.now()}`;
            const payment = {
                id: paymentId,
                amount: amount,
                status: 'pending',
                serviceName: serviceName,
                createdAt: new Date().toISOString()
            };
            payments.set(paymentId, payment);
            
            const confirmationUrl = `${process.env.RETURN_URL || 'http://localhost:3000/payment-success.html'}?payment_id=${paymentId}&amount=${amount}&service=${encodeURIComponent(serviceName)}`;
            
            res.json({ payment_id: paymentId, confirmation_url: confirmationUrl });
            return;
        }

        // РЕАЛЬНЫЙ РЕЖИМ - YooKassa API
        const shopId = process.env.YOOKASSA_SHOP_ID;
        const secretKey = process.env.YOOKASSA_SECRET_KEY;

        if (!shopId || !secretKey) {
            throw new Error('YooKassa credentials not configured');
        }

        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': Date.now().toString(),
                'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`
            },
            body: JSON.stringify({
                amount: { value: amount.toString(), currency: 'RUB' },
                confirmation: { type: 'redirect', return_url: process.env.RETURN_URL },
                capture: true,
                description: description || 'Оплата консультации',
                metadata: { userId, userName, serviceName }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.description || 'YooKassa API error');
        }

        payments.set(data.id, { ...data, status: 'pending' });

        res.json({
            payment_id: data.id,
            confirmation_url: data.confirmation.confirmation_url
        });

    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Проверка статуса платежа
app.get('/api/payment-status/:paymentId', (req, res) => {
    const payment = payments.get(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
});

// Webhook от YooKassa
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const event = JSON.parse(req.body.toString());
    console.log('🔔 Webhook:', event);
    
    if (event.event === 'payment.succeeded') {
        const payment = payments.get(event.object.id);
        if (payment) payment.status = 'succeeded';
    }
    
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
