import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

function Profile({ token }) {
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        birthdate: ""
    });

    const fetchUserData = async () => {
        try {
            axios.get(`http://localhost:3000/userCustomer/data`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    if (response.data) {
                        setUserData(response.data);
                    }
                    else {
                        console.error("No user data found");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user profile:", error.response?.data || error);
                })
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <div className="profile-container">
            <div style={{ padding: "20px", textAlign: "center" }}>
                <label htmlFor="" className="profile-label"></label>
            </div>
            <div className="profile-input-container">
                <span className="title">{userData.user}</span>
                <button className="profile-button" onClick={() => navigate("/profile/edit-profile")}>ตั้งค่าผู้ใช้</button>
                <button className="profile-button" onClick={() => navigate("/profile/payment")}>ตั้งค่าวิธีชำระเงิน</button>
                <button className="profile-button" onClick={() => navigate("/profile/save-location")}>จัดการสถานที่</button>
                <button className="profile-button" onClick={() => navigate("/profile/setting")}>ตั้งค่าแอพพิเคชั่น</button>
            </div>
        </div>
    );
}

export default Profile;