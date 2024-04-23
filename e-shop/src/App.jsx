import './index.css'

import {Route, Routes} from "react-router-dom";

import Home from "./components/home.jsx";
import Products from "./components/Products/products.jsx";
import Product from "./components/Products/product.jsx";
import NoMatch from "./components/not-found.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<Product />} />
            <Route path="*" element={<NoMatch />} />
        </Routes>
    )
}

export default App
