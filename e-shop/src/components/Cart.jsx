import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {loadStripe} from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    return (
        <div>
            {cart.map((item) => (
                <div key={item.id}>
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <p>{item.price}</p>
                </div>
            ))}
        </div>
    );
}
