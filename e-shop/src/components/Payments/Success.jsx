import toast from "react-hot-toast";
import { useCart } from '../Context/CartContext.jsx';
import {useEffect} from "react";

export default function Success() {
    useEffect(() => {
        toast.success('Payment successful', {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            }
        });
    }, []);

    const { setCart } = useCart();
    setCart([]);

    return (
        <div className="bg-zinc-800 min-h-screen p-4 flex justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-4xl text-white font-bold">Payment successful!</h1>
                <p className="text-white">Thank you for your purchase.</p>

                <p className="text-white mt-4">You can find your order details in your profile.</p>
            </div>
        </div>
    );
}

