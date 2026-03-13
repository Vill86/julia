const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Хранилище платежей (в памяти)
const payments = new Map();

// Создание виртуального платежа
app.post('/api/create-payment', async (req, res) => {
    try {
        const { serviceName, amount, userId, userName, description } = req.body;
        
        console.log('📝 ==========================================');
        console.log('📝 НОВЫЙ ПЛАТЕЖ');
        console.log('📝 ==========================================');
        console.log('Услуга:', serviceName);
        console.log('Сумма:', amount, '₽');
        console.log('Пользователь:', userName, `(ID: ${userId})`);
        console.log('Описание:', description);
        console.log('📝 ==========================================\n');

        // Генерируем ID платежа
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
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
            updatedAt: new Date().toISOString()
        };
        
        // Сохраняем платеж
        payments.set(paymentId, payment);
        
        console.log('✅ Платеж создан:', paymentId);
        console.log('💾 Всего платежей:', payments.size, '\n');
        
        // Формируем URL для страницы успеха
        const returnUrl = process.env.RETURN_URL || 'http://localhost:3000/payment-success.html';
        const confirmationUrl = `${returnUrl}?payment_id=${paymentId}&amount=${amount}&service=${encodeURIComponent(serviceName)}&status=succeeded`;
        
        // Возвращаем ответ клиенту
        res.json({
            payment_id: paymentId,
            confirmation_url: confirmationUrl,
            status: 'pending',
            amount: amount,
            serviceName: serviceName
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания платежа:', error.message);
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
        serviceName: payment.serviceName,
        createdAt: payment.createdAt
    });
});

// Получить все платежи (для админки)
app.get('/api/payments', (req, res) => {
    const allPayments = Array.from(payments.values()).reverse();
    res.json({
        total: allPayments.length,
        payments: allPayments
    });
});

// Страница админки со всеми платежами
app.get('/admin', (req, res) => {
    const allPayments = Array.from(payments.values()).reverse();
    
    let html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Админка - Платежи</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #333; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .payment-list { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
            .payment-item { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .payment-item:last-child { border-bottom: none; }
            .payment-info h3 { font-size: 16px; color: #333; margin-bottom: 5px; }
            .payment-info p { font-size: 13px; color: #666; }
            .payment-amount { font-size: 18px; font-weight: bold; color: #4CAF50; }
            .payment-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .status-pending { background: #fff3cd; color: #856404; }
            .status-succeeded { background: #d4edda; color: #155724; }
            .empty { padding: 40px; text-align: center; color: #666; }
            .refresh-btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>💳 Панель платежей</h1>
            <button class="refresh-btn" onclick="location.reload()">🔄 Обновить</button>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${allPayments.length}</div>
                    <div class="stat-label">Всего платежей</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${allPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} ₽</div>
                    <div class="stat-label">Общая сумма</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${allPayments.filter(p => p.status === 'succeeded').length}</div>
                    <div class="stat-label">Успешных</div>
                </div>
            </div>
            
            <div class="payment-list">
                ${allPayments.length === 0 ? 
                    '<div class="empty">Нет платежей</div>' : 
                    allPayments.map(p => `
                        <div class="payment-item">
                            <div class="payment-info">
                                <h3>${p.serviceName}</h3>
                                <p>${p.userName} • ${new Date(p.createdAt).toLocaleString('ru-RU')}</p>
                                <p style="font-size: 11px; color: #999;">${p.id}</p>
                            </div>
                            <div style="text-align: right;">
                                <div class="payment-amount">${p.amount.toLocaleString()} ₽</div>
                                <span class="payment-status status-${p.status}">${p.status === 'succeeded' ? '✅ Успешно' : '⏳ В обработке'}</span>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Webhook (заглушка для будущего)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const event = JSON.parse(req.body.toString());
    console.log('🔔 Webhook received:', event);
    
    if (event.event === 'payment.succeeded') {
        const paymentId = event.object.id;
        const payment = payments.get(paymentId);
        if (payment) {
            payment.status = 'succeeded';
            payment.updatedAt = new Date().toISOString();
            console.log('✅ Платеж подтверждён:', paymentId);
        }
    }
    
    res.sendStatus(200);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  🚀 СЕРВЕР ЗАПУЩЕН!                                ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  📍 Порт: ${PORT}`);
    console.log(`║  🌐 URL: http://localhost:${PORT}`);
    console.log(`║  👤 Админка: http://localhost:${PORT}/admin`);
    console.log('╠════════════════════════════════════════════════════╣');
    console.log('║   РЕЖИМ: ТЕСТОВЫЙ (виртуальные платежи)         ║');
    console.log('║  💡 Выберите услугу и нажмите "Оплатить"          ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
});
