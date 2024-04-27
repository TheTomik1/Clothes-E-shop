import {useEffect, useState} from "react";
import axios from "axios";
import {useCart} from "./Context/CartContext.jsx";
import {Link} from "react-router-dom";
import toast from "react-hot-toast";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cart, setCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/products');

                if (!response.data) {
                    toast.error('No products found.', {
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        }
                    });
                } else {
                    const sortedProducts = response.data.data.sort((a, b) => new Date(b.added) - new Date(a.added));
                    const latestProduct = sortedProducts.slice(0, 6);
                    setProducts(latestProduct);
                    setLoading(false);
                }
            } catch (error) {
                toast.error('Error fetching products.', {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    }
                });
            }
        };

        fetchProducts();
        const intervalId = setInterval(fetchProducts, 20000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="bg-zinc-800 min-h-screen p-4">
            <h1 className="text-5xl font-bold text-center text-white">Welcome to Clothes E-Shop</h1>
            <p className="text-center text-white mb-4">The best place to shop clothes online.</p>

            <h1 className="text-3xl text-white font-bold my-8 pl-24">Latest Products</h1>

            {loading && <p className="text-white text-5xl text-center">Loading...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 px-24">
                {products.map((product) => (
                    <div key={product.id} className="bg-zinc-700 p-4 rounded-lg shadow-md hover:scale-105 transition-transform">
                        <img src={product.images[0]} alt={product.name}
                             className="rounded-xl w-full h-96 object-cover"/>
                        <h2 className="text-3xl text-white font-bold pt-4">{product.name}</h2>
                        <p className="text-xl text-gray-300">{product.description ? product.description : 'No description.'}</p>
                        <p className="text-2xl text-white font-bold pb-8">{product.price}</p>
                        <div className="flex justify-between">
                            <button className="bg-blue-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform" onClick={() => setCart([...cart, product])}>Add to cart</button>
                            <Link className="bg-green-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform" to={`/products/${product.id}`}>Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
