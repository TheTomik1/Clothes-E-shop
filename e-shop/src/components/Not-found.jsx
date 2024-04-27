import {Link} from "react-router-dom";

export default function NoMatch() {
    return (
        <div className="bg-zinc-800 min-h-screen p-4 flex justify-center">
            <div className="w-full max-w-md text-center">
                <h1 className="text-4xl text-white font-bold">404</h1>
                <p className="text-xl text-white mb-12">Page not found.</p>
                <Link to="/" className="bg-blue-500 rounded-xl text-2xl font-bold p-2 text-white">
                    Go back
                </Link>
            </div>
        </div>
    );
}
