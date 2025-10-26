import React,{useContext} from 'react';
import {AuthContext} from './AuthContext.jsx'
export default function Profile(){
    const {logout}=useContext(AuthContext);
    return <div>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition" onClick={logout}>Logout</button>
    </div>;
}