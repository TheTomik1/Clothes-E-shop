import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from "react-hot-toast";
import { useCart } from '../Context/CartContext.jsx';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [sortOption, setSortOption] = useState('nameAsc');
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
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
                }

                setProducts(response.data.data);
                setLoading(false);
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

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value);
    }

    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value);
    }

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortOption) {
            case 'nameAsc':
                return a.name.localeCompare(b.name);
            case 'nameDesc':
                return b.name.localeCompare(a.name);
            case 'priceAsc':
                return parseFloat(a.price.replace(/€|,/g, '')) - parseFloat(b.price.replace(/€|,/g, ''));
            case 'priceDesc':
                return parseFloat(b.price.replace(/€|,/g, '')) - parseFloat(a.price.replace(/€|,/g, ''));
            default:
                return 0;
        }
    });

    const filteredProducts = sortedProducts.filter(product => {
        const price = parseFloat(product.price.replace(/€|,/g, ''));

        const minPriceValue = minPrice === '' ? null : parseFloat(minPrice);
        const maxPriceValue = maxPrice === '' ? null : parseFloat(maxPrice);

        return (
            (product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (minPriceValue === null || price >= minPriceValue) &&
            (maxPriceValue === null || price <= maxPriceValue)
        );
    });

    return (
        <div className="bg-zinc-800 min-h-screen p-4">
            <div className="flex justify-start space-x-4 mb-12">
                <h1 className="text-2xl font-bold text-white">Sort by:</h1>
                <select value={sortOption} onChange={handleSortChange}
                        className="rounded-md p-2 bg-zinc-700 w-1/3 focus:outline-none focus:border-none">
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                    <option value="priceAsc">Price (Low-High)</option>
                    <option value="priceDesc">Price (High-Low)</option>
                </select>
                <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search by name"
                       className="rounded-md p-2 bg-zinc-700 focus:outline-none focus:border-none w-1/3"/>
            </div>
            <div className="flex justify-start space-x-4 mb-12">
                <h1 className="text-2xl font-bold text-white">Filter by price:</h1>
                <input type="number" value={minPrice} onChange={handleMinPriceChange} placeholder="Min price"
                          className="rounded-md p-2 bg-zinc-700 focus:outline-none focus:border-none w-1/5"/>
                <input type="number" value={maxPrice} onChange={handleMaxPriceChange} placeholder="Max price"
                            className="rounded-md p-2 bg-zinc-700 focus:outline-none focus:border-none w-1/5"/>
            </div>
            <div className="flex justify-between mb-4">
                <h1 className="text-4xl font-bold text-white">Products</h1>
                <Link to="/cart"
                      className="bg-blue-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform">Go
                    to cart</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {loading && <p className="text-white text-3xl">Loading...</p>}
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-zinc-700 p-4 rounded-lg shadow-md hover:scale-105 transition-transform">
                        <img src={product.images[0]} alt={product.name} className="rounded-xl w-full and h-96 object-cover"/>
                        <h2 className="text-3xl text-white font-bold pt-4">{product.name}</h2>
                        <p className="text-xl text-gray-300">{product.description ? product.description : 'No description.'}</p>
                        <p className="text-2xl text-white font-bold pb-8">{product.price}</p>
                        <div className="flex justify-between">
                            <button
                                className="bg-green-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform"
                                onClick={() => setCart([...cart, product])}>Add to cart
                            </button>
                            <Link
                                className="bg-blue-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform"
                                to={`/products/${product.id}`}>Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;
