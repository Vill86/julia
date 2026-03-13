const express = require('express');
const YooKassa = require('yookassa');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация ЮKassa
const yookassa = new YooKassa({
    shopId: process.env.YOOKASSA_SHOP_ID,
    secretKey: process.env.YOOKASSA_SECRET_KEY
});

// Создайте файл .env с данными:
// YOOKASSA_SHOP_ID=ваш_shop_id
// YOOKASSA_SECRET_KEY=ваш_secret_key
// RETURN_URL=https://your-domain.com/success

app.post('/api/create-payment', async (req, res) => {
    try {
        const { serviceName, amount, userId, userName, description } = req.body;
        
        // Создаем платеж в ЮKassa
        const payment = await yookassa.createPayment({
            amount: {
                value: amount.toString(),
                currency: 'RUB'
            },
            confirmation: {
                type: 'redirect',
                return_url: process.env.RETURN_URL || 'https://t.me/your_bot'
            },
            capture: true,
            description: description || 'Оплата консультации психолога',
            metadata: {
                service: serviceName,
                userId: userId,
                userName: userName
            }
        });
        
        // Отправляем URL для оплаты клиенту
        res.json({
            payment_id: payment.id,
            confirmation_url: payment.confirmation.confirmation_url
        });
        
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Webhook для получения уведомлений от ЮKassa
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const event = JSON.parse(req.body.toString());
    
    console.log('Webhook received:', event);
    
    // Здесь можно обработать успешную оплату
    // Например, отправить уведомление в Telegram
    
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
