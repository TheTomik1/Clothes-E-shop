const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
const {json, raw} = require("express");
require('dotenv').config({ path: './.env' });

router.post('/checkout', json(), async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: "price_1P8kNOFd18oZCO1VCjXjOIpi",
                    quantity: 1,
                }
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        }, { apiKey: process.env.STRIPE_SECRET_KEY });

        await res.json({ session });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log(`Payment successful: ${session.id}`);
        }

        if (event.type === 'checkout.subscription.updated') {
            const subscription = event.data.object;
            console.log(`Subscription updated: ${subscription.id}`);
        }

        if (event.type === 'checkout.subscription.deleted') {
            const subscription = event.data.object;
            console.log(`Subscription deleted: ${subscription.id}`);
        }

        await res.json({ received: true });
    } catch (error) {
        console.log(error.message)
        await res.status(400).send(`Webhook signature verification failed: ${error.message}`);
    }
});

module.exports = router;
