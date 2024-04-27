import {useEffect} from "react";
import toast from "react-hot-toast";

export default function Cancel() {
    useEffect(() => {
        toast.error('Payment cancelled', {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            }
        });
    }, []);


    return (
        <div className="bg-zinc-800 min-h-screen p-4 flex justify-center">
            <div className="w-full max-w-md text-center">
                <h1 className="text-4xl text-white font-bold">Payment cancelled</h1>
                <p className="text-white">Your payment was cancelled.</p>
            </div>
        </div>
    );
}
