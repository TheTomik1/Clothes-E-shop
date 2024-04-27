import {useContext, useEffect, useState} from "react";
import AuthContext from "../Context/AuthContext.js";
import supabase from "../../utils/supabase.js";
import toast from "react-hot-toast";
import { format } from "date-fns";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function Profile() {
    const { session } = useContext(AuthContext);
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const fetchReceipts = async () => {
            if (!session) return;

            try {
                const response = await axios.get('http://localhost:3000/api/user-receipts', {
                    params: {
                        email: session.user.email,
                    }
                });

                if (response.data.error) {
                    toast.error(`Error fetching receipts.\n\n${response.data.error}`, {
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        }
                    });
                }

                setReceipts(response.data.userReceipts);
            } catch (error) {
                console.error(error);
            }
        };

        fetchReceipts();
    }, [session]);

    const handleChangePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) {
            toast.error(`Error changing password.\n\n${error.message}`, {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        } else {
            toast.success('Password changed successfully.', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    };

    const handleEmailChange = async (newEmail) => {
        const { error } = await supabase.auth.updateUser({
            email: newEmail,
        });

        if (error) {
            toast.error(`Error changing email.\n\n${error.message}`, {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        } else {
            toast.success('Change your email inbox for instructions.', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(`Error signing out.\n\n${error.message}`, {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        } else {
            toast.success('Logged out successfully.', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
        }

        navigate('/');
    }

    if (!session) {
        return (
            <div className="bg-zinc-800 min-h-screen flex justify-center items-center">
                <p className="text-xl text-white">You need to be logged in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-800 min-h-screen p-4 flex justify-center">
            <div className="w-full max-w-md text-center">
                <h1 className="text-4xl text-white font-bold">Profile</h1>
                <p className="text-white">Welcome, {session.user.email} !</p>

                <input type="password" placeholder="New password" className="w-full p-2 rounded-xl mt-8 mb-2"
                       onChange={(e) => setNewPassword(e.target.value)}/>
                <button onClick={() => handleChangePassword(newPassword)}
                        className="bg-blue-500 rounded-xl text-2xl font-bold p-2 text-white hover:scale-105 transition-transform">
                    Change password
                </button>

                <input type="email" placeholder="New email" className="w-full p-2 rounded-xl mt-8 mb-2"
                       onChange={(e) => setNewEmail(e.target.value)}/>
                <button onClick={() => handleEmailChange(newEmail)}
                        className="bg-blue-500 rounded-xl text-2xl font-bold p-2 text-white hover:scale-105 transition-transform">
                    Change email
                </button>

                <h2 className="text-3xl text-white font-bold mt-8">Receipts</h2>
                <ul className="text-left text-white">
                    {receipts.length === 0 ? <p>No receipts found.</p> :
                        receipts.map((receipt, index) => (
                            <li key={index} className="border-b border-gray-500 p-4">
                                <p><a href={receipt.receipt_url} target="_blank" rel="noreferrer"
                                      className="text-blue-500">{receipt.id}</a> - {format(new Date(receipt.created * 1000), 'dd/MM/yyyy HH:mm')}
                                </p>
                            </li>
                        ))}
                </ul>

                <div className="flex justify-end">
                    <button onClick={handleLogout} className="bg-red-500 rounded-xl  text-2xl font-bold p-2 text-white hover:scale-105 transition-transform mt-12">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
