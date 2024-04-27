import { useCart } from './Context/CartContext';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import axios from "axios";
import toast from "react-hot-toast";
import {loadStripe} from "@stripe/stripe-js";
import {useContext} from "react";
import AuthContext from "../contexts/AuthContext.js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISABLE_KEY);

export default function Cart() {
    const { cart, setCart } = useCart();
    const { session } = useContext(AuthContext);

    const handleIncrease = (id) => {

    };

    const handleDecrease = (id) => {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem.count === 1) {
            setCart(currentCart => currentCart.filter(item => item.id !== id));
        } else {
            setCart(existingItem.count -= 1);
        }
    };

    const handleRemove = (id) => {
        setCart(currentCart => currentCart.filter(item => item.id !== id));
    };

    const cleanPrice = (price) => {
        return price.replace('€', '').replace(',', '');
    }

    const groupedCart = cart.reduce((acc, item) => {
        const existingItem = acc.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.count += 1;
        } else {
            acc.push({...item, count: 1});
        }

        return acc;
    }, []);

    const handleCheckout = async() => {
        if (!session) {
            toast.error('You need to be logged in to checkout.', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
            return;
        }

        const response = await axios.post('http://localhost:3000/api/checkout', {
            userId: session.user.id,
            email: session.user.email,
            cart: groupedCart
        });

        if (response.data.error) {
            toast.error(response.data.error, {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        } else {
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId: response.data.session.id,
            });

            if (error) {
                toast.error(error.message, {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    }
                });
            }
        }
    }

    return (
        <div className="bg-zinc-800 min-h-screen p-4 flex flex-col items-center">
            {groupedCart.length === 0 ? (
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl text-white mb-12">Cart is empty.</h1>
                    <Link to="/products" className="bg-blue-500 rounded-xl text-2xl font-bold p-2 text-white hover:scale-105 transition-transform">
                        Go to products
                    </Link>
                </div>
            ) : (
                groupedCart.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row text-white p-4 my-2 w-full max-w-4xl">
                        <img src={item.images[0]} alt={item.name} className="md:w-48 md:h-48 w-full object-cover rounded-xl shadow-xl"/>
                        <div className="flex flex-col flex-grow md:ml-4">
                            <h1 className="text-3xl">{item.name}</h1>
                            <p className="text-xl text-zinc-200">{item.description}</p>
                            <p className="text-xl">{item.price}</p>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center">
                                    <button onClick={() => handleDecrease(item.id)} className="text-lg p-2">-</button>
                                    <span className="text-lg px-4">{item.count}</span>
                                    <button onClick={() => handleIncrease(item.id)} className="text-lg p-2">+</button>
                                </div>
                                <button onClick={() => handleRemove(item.id)} className="text-3xl text-red-500 hover:text-red-600 mt-4">
                                    <FaTrash/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div className="w-full max-w-4xl border-t-2 border-zinc-500 mt-4"/>
            <div className="flex justify-between w-full max-w-4xl mt-4">
                <h1 className="text-3xl text-white">Total:</h1>
                <h1 className="text-3xl text-white">{groupedCart.reduce((acc, item) => acc + (cleanPrice(item.price) * item.count), 0)}€</h1>
            </div>
            <div className="w-full max-w-4xl flex justify-end">
                <button onClick={handleCheckout} className="bg-green-500 rounded-xl text-4xl font-bold p-4 text-white hover:scale-105 transition-transform mt-4 ml-auto">
                    Checkout
                </button>
            </div>
        </div>
    )
}
