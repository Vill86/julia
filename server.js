const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Раздаем статику из папки public

// Тестовые данные (в реальности берите из .env)
const TEST_SHOP_ID = process.env.SHOP_ID || 'test_shop_id';
const TEST_SECRET_KEY = process.env.SECRET_KEY || 'test_secret_key';

// Хранилище платежей (в памяти)
const payments = new Map();

// Создание платежа
app.post('/api/create-payment', async (req, res) => {
    try {
        const { serviceName, amount, userId, userName, description } = req.body;
        
        console.log('📝 Новый платеж:', {
            serviceName,
            amount,
            userId,
            userName,
            description
        });

        // Генерируем ID платежа
        const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Создаем объект платежа
        const payment = {
            id: paymentId,
            amount: amount,
            currency: 'RUB',
            status: 'pending',
            serviceName: serviceName,
            description: description,
            userId: userId,
            userName: userName,
            createdAt: new Date().toISOString(),
            confirmationUrl: `http://localhost:3000/payment-success.html?payment_id=${paymentId}&amount=${amount}&service=${encodeURIComponent(serviceName)}`
        };
        
        // Сохраняем платеж
        payments.set(paymentId, payment);
        
        console.log('✅ Платеж создан:', paymentId);
        
        // Возвращаем URL для "оплаты"
        res.json({
            payment_id: paymentId,
            confirmation_url: payment.confirmationUrl,
            status: 'pending'
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания платежа:', error);
        res.status(500).json({ 
            error: 'Failed to create payment',
            message: error.message 
        });
    }
});

// Проверка статуса платежа
app.get('/api/payment-status/:paymentId', (req, res) => {
    const { paymentId } = req.params;
    const payment = payments.get(paymentId);
    
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({
        payment_id: payment.id,
        status: payment.status,
        amount: payment.amount,
        serviceName: payment.serviceName
    });
});

// Webhook для ЮKassa (заглушка)
app.post('/api/webhook', (req, res) => {
    const event = req.body;
    console.log('🔔 Webhook received:', event);
    
    // Здесь можно обновить статус платежа
    if (event.event === 'payment.succeeded') {
        const paymentId = event.object.id;
        const payment = payments.get(paymentId);
        if (payment) {
            payment.status = 'succeeded';
            console.log('✅ Платеж успешен:', paymentId);
        }
    }
    
    res.sendStatus(200);
});

// Страница со списком всех платежей (для тестирования)
app.get('/api/payments', (req, res) => {
    const allPayments = Array.from(payments.values());
    res.json(allPayments);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║  🚀 Тестовый сервер запущен!              ║
║  📍 Порт: ${PORT}                           ║
║  🌐 URL: http://localhost:${PORT}           ║
║                                           ║
║  Для тестирования:                        ║
║  1. Откройте http://localhost:${PORT}      ║
║  2. Выберите услугу                       ║
║  3. Нажмите "Оплатить"                    ║
╚═══════════════════════════════════════════╝
    `);
});
