import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";

export default function Product() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/products/' + id);

                if (!response.data) {
                    navigate('/products');
                } else {
                    setProduct(response.data.data);
                    setLoading(false);
                }
            } catch (error) {
                navigate('/products');
            }
        };

        fetchProduct();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-zinc-800">
            <p className="text-white text-5xl">Loading...</p>
        </div>
    }

    return (
        <div className="items-center h-screen bg-zinc-800 p-12 md:flex md:justify-between">
            <div className="flex flex-col space-y-4 md:w-1/2">
                <h1 className="text-white text-5xl font-bold">{product.name}</h1>
                <p className="text-white text-2xl">{product.description}</p>
                <p className="text-white text-2xl">Price: {product.price}</p>
                <button className="bg-green-500 w-48 text-white text-2xl font-bold p-2 rounded-md hover:scale-105 transition-transform">Add
                    to cart
                </button>
            </div>
            <div className="flex justify-center md:w-1/2">
                <img src={product.images} alt={product.name}
                     className="w-full h-96 object-cover rounded-lg shadow-xl md:w-3/4"/>
            </div>
        </div>
    );
}
