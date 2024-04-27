import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {Toaster} from "react-hot-toast";

import Home from "./components/Home.jsx";
import Products from "./components/Products/Products.jsx";
import Product from "./components/Products/Product.jsx";
import NoMatch from "./components/Not-found.jsx";
import Login from "./components/Auth/Login.jsx";
import {CartProvider} from "./components/Context/CartContext.jsx";
import Cart from "./components/Cart.jsx";
import Navbar from "./components/Navbar.jsx";

import supabase from "./utils/supabase.js";
import AuthContext from './contexts/AuthContext';

import './index.css'

function App() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session }}>
            <CartProvider>
                <Navbar />
                <Toaster position={"top-right"} reverseOrder={false} />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<Product />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="*" element={<NoMatch />} />
                </Routes>
            </CartProvider>
        </AuthContext.Provider>
    )
}

export default App
