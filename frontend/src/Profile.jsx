import React,{useContext} from 'react';
import {AuthContext} from './AuthContext.jsx'
import { useNavigate } from 'react-router-dom';
export default function Profile(){
    const navigate=useNavigate();
    const {logout}=useContext(AuthContext);
    const handleLogout=()=>{
        logout();
        navigate("/");
    }
    return <div>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition" onClick={handleLogout}>Logout</button>
    </div>;
}