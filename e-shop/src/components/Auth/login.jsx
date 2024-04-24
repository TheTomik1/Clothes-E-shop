import {useContext, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from '../../utils/supabase';
import AuthContext from '../../contexts/AuthContext';
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();
    const { session } = useContext(AuthContext);

    useEffect(() => {
        if (session) {
            navigate('/products');
            toast.success('Logged in successfully', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        }

    }, [session, navigate]);

    return (
        <div className="bg-zinc-800 min-h-screen p-4 flex justify-center">
            <div className="w-full max-w-md">
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={null} theme="dark" />
            </div>
        </div>
    );
}
