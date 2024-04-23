import {Route, Routes} from "react-router-dom";

import Home from "./components/home.jsx";
import Products from "./components/Products/products.jsx";
import Product from "./components/Products/product.jsx";
import NoMatch from "./components/not-found.jsx";
import Login from "./components/Auth/login.jsx";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<Product />} />
                <Route path="*" element={<NoMatch />} />
            </Routes>
        </>
    )
}

export default App
