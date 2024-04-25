import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from "react-hot-toast";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('nameAsc');
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const productsPerPage = 15;

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

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
                    setLoading(false);
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
                setLoading(false);
            }
        };

        fetchProducts();
        const intervalId = setInterval(fetchProducts, 20000);

        return () => clearInterval(intervalId);
    }, []);

    const handleAddToCart = (product) => {
        // Handle add to cart
    };

    const handleCheckDetails = (product) => {
        // Handle check details
    };

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
                return a.price - b.price;
            case 'priceDesc':
                return b.price - a.price;
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

    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {loading && <p className="text-white text-2xl font-bold">Loading...</p>}
                {currentProducts.map((product) => (
                    <div key={product.id} className="bg-zinc-700 p-4 rounded-lg shadow-md">
                        <img src={product.images[0]} alt={product.name} className="rounded-xl w-full and h-96 object-cover"/>
                        <h2 className="text-3xl text-white font-bold pt-4">{product.name}</h2>
                        <p className="text-xl text-gray-300">{product.description ? product.description : 'No description.'}</p>
                        <p className="text-2xl text-white font-bold pb-8">{product.price}</p>
                        <div className="flex justify-between">
                            <button
                                className="bg-green-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform"
                                onClick={() => handleAddToCart(product)}>Add to cart
                            </button>
                            <Link
                                className="bg-blue-500 rounded-xl font-bold p-4 text-white hover:scale-105 transition-transform"
                                to={`/products/${product.id}`}>Check details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;
