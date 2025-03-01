/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaPlus,
    FaFileAlt,
    FaUserShield,
    FaSignOutAlt
} from "react-icons/fa";
import jwtDecode from "jwt-decode";
import logo from "../assets/logo.png";

const Sidebar = ({ activePath, onNavigate }) => {
    const menuItems = [
        { icon: <FaPlus />, label: "Dashboard", path: "/Ddashinner" },
        { icon: <FaFileAlt />, label: "Distributorverify", path: "/Distributorverify" },
        { icon: <FaFileAlt />, label: "Verify History", path: "/Distributorverifyhistory" },
        { icon: <FaFileAlt />, label: "Distributor request", path: "/Distributorrequest" },
        { icon: <FaFileAlt />, label: "Request History", path: "/Distributorhistory" },
    ];

    return (
        <div className="w-1/5 bg-[#00234E] text-white shadow-lg p-4 min-h-screen fixed top-0 left-0 h-full">
            <div className="flex flex-col items-center mb-6">
                <img
                    src={logo}
                    alt="Logo"
                    className="[h-10px] w-[200px] mb-2"
                />            </div>
            <nav className="mt-6">
                <ul>
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition duration-300 ease-in-out mb-4 shadow-md ${activePath === item.path ? "bg-white text-black border-l-4 border-blue-600" : "bg-gray-600 hover:bg-gray-400"}`}
                            onClick={() => onNavigate(item.path)}
                        >
                            <span className="mr-3 text-lg">{item.icon}</span>
                            {item.label}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

const Distributordashboard = ({ children }) => {
    const [userEmail, setUserEmail] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserEmail(decodedToken.email);
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-screen bg-[#f3f4f6]">
            <Sidebar activePath="/" onNavigate={navigate} />
            <div className="flex-1 p-6 ml-1/5 pt-[70px]">
                {/* Top Section */}
                <div className="flex items-center justify-between bg-[#00234E] text-white px-4 py-2 rounded-md shadow-md fixed top-0 left-[20%] w-[80%] z-10 h-[65px]">
                    <span className="text-lg font-bold">Distributor Dashboard</span>
                    {/* Profile Section */}
                    <div className="relative">
                        <img
                            src="https://t4.ftcdn.net/jpg/04/83/90/95/360_F_483909569_OI4LKNeFgHwvvVju60fejLd9gj43dIcd.jpg"
                            alt="Profile"
                            className="h-10 w-10 rounded-full cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                                <div className="p-4 border-b">
                                    <p className="text-lg text-black mb-4"><strong>{userEmail || "No user logged in"}</strong></p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Render children */}
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
};
export default Distributordashboard;
