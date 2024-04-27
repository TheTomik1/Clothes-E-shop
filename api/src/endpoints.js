const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
const {json, raw} = require("express");
require('dotenv').config({ path: './.env' });

const formatPrice = (priceInCents) => {
    const priceInEuros = priceInCents / 100;
    return priceInEuros.toLocaleString('en-US', { style: 'currency', currency: 'EUR' });
};

const cleanPrice = (price) => {
    return price.replace('€', '').replace(',', '');
};

router.get("/products", async (req, res) => {
    try {
        const products = await stripe.prices.list({
            active: true
        }, { apiKey: process.env.STRIPE_SECRET_KEY });

        const productDetails = await Promise.all(products.data.map(async (product) => {
            const productData = await stripe.products.retrieve(product.product, { apiKey: process.env.STRIPE_SECRET_KEY });
            const productPrice = await stripe.prices.retrieve(product.id, { apiKey: process.env.STRIPE_SECRET_KEY });

            return {
                id: productData.id,
                price: formatPrice(productPrice.unit_amount),
                name: productData.name,
                description: productData.description,
                images: productData.images
            };
        }));

        await res.status(200).send({ data: productDetails });
    } catch (error) {
        await res.status(500).send({ error: error.message });
    }
});

router.get("/products/:id", async (req, res) => {
    try {
        const product = await stripe.products.retrieve(req.params.id, { apiKey: process.env.STRIPE_SECRET_KEY });
        const price = await stripe.prices.list({
            active: true,
            product: req.params.id
        }, { apiKey: process.env.STRIPE_SECRET_KEY });

        console.log(product);

        await res.status(200).send({ data: {
            id: product.id,
            name: product.name,
            description: product.description,
            images: product.images,
            added: product.created,
            price: formatPrice(price.data[0].unit_amount),
        }});
    } catch (error) {
        await res.status(500).send({ error: error.message });
    }
});

router.post('/checkout', json(), async (req, res) => {
    const cart = req.body.cart;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                ...cart.map((item) => ({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: item.name,
                            description: item.description,
                            images: [item.images[0]]
                        },
                        unit_amount_decimal: cleanPrice(item.price) * 100
                    },
                    quantity: item.count
                })),
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        }, { apiKey: process.env.STRIPE_SECRET_KEY });

        await res.json({ session });
    } catch (error) {
        await res.status(500).send({ error: error.message });
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
