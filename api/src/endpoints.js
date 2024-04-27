const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
const {json, raw} = require("express");
const supabase = require('../supabase');
require('dotenv').config({ path: './.env' });

const formatPrice = (priceInCents) => {
    const priceInEuros = priceInCents / 100;
    return priceInEuros.toLocaleString('en-US', { style: 'currency', currency: 'EUR' });
};

const cleanPrice = (price) => {
    return price.replace('€', '').replace(',', '');
};

router.get("/user-receipts", async (req, res) => {
    const emailAddr = req.query.email;

    try {
        const userReceipts = [];

        const receipts = await stripe.charges.list({ limit: 10 }, { apiKey: process.env.STRIPE_SECRET_KEY });

        for (let receipt of receipts["data"]) {
            if (receipt["billing_details"]["email"] === emailAddr) {
                userReceipts.push(receipt);
            }
        }

        await res.status(200).send({ userReceipts });
    } catch (error) {
        await res.status(500).send({ error: error.message });
    }
});

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
    const { email, userId, cart } = req.body;

    console.log(email);
    console.log(userId);

    if (!userId) {
        await res.status(400).send({ error: 'User ID is missing.' });
        return;
    }

    if (!cart || cart.length === 0) {
        await res.status(400).send({ error: 'Cart is empty.' });
        return;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            metadata: {
                user_id: userId
            },
            customer_email: email,
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

router.post('/webhook', raw({ type: 'application/json' }), async(req, res) => {
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const userId = session.metadata.user_id;

            const { error } = await supabase.from('stripe_customers').insert([
                {
                    customer_id: userId,
                    customer_email: session.customer_details.email,
                    customer_name: session.customer_details.name,
                }
            ])

            if (error.message.includes('duplicate key value violates unique constraint')) {
                await supabase.from('stripe_customers').update([
                    {
                        customer_email: session.customer_details.email,
                        customer_name: session.customer_details.name,
                    }
                ]).match({ customer_id: userId });
            }

            await supabase.from('stripe_payments').insert([
                {
                    payment_id: session.id,
                    payment_total: session.amount_total,
                    payment_currency: session.currency,
                    payment_customer: session.customer_details,
                    payment_status: session.payment_status,
                    payment_method_types: session.payment_method_types,
                }
            ])
        }

        await res.json({ received: true });
    } catch (error) {
        console.log(error.message)
        await res.status(400).send(`Webhook signature verification failed: ${error.message}`);
    }
});

module.exports = router;
