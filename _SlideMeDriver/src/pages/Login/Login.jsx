import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router";

import "./Login.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

import Logo from '../../assets/logo.png';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");
  if (token) {
    axios.get(`http://localhost:3000/userDriver/data`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.data) {
          onLogin(token);
        }
        else {
          onLogin();
        }
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error.response?.data || error);
      });
  }

  // Login Google as login immedially to the app by user driverID: 1
  const handleLoginGoogle = () => {
    axios
      .post("http://localhost:3000/userDriver/login", {
        username: "Namphet",
        password: "123456",
      })
      .then((response) => {
        const token = response.data.token;
        const name = response.data.name;
        localStorage.setItem("token", token);
        onLogin(token);
        alert(`ยินดีต้อนรับ ${name}!`); // "Welcome"
      })
      .catch((error) => {
        console.error("Login failed:", error);
        setErrorMessage("รหัสผ่านหรือผู้ใช้ไม่ถูกต้อง"); // "Login failed. Please try again."
      });
  };

  const handleLogin = () => {
    // Basic validation
    if (!username || !password) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบ"); // "Please fill in all fields"
      return;
    }

    // Login Axios request
    axios
      .post("http://localhost:3000/userDriver/login", {
        username,
        password,
      })
      .then((response) => {
        const token = response.data.token;
        const name = response.data.name;
        localStorage.setItem("token", token);
        onLogin(token);
        alert(`ยินดีต้อนรับ ${name}!`); // "Welcome"
      })
      .catch((error) => {
        console.error("Login failed:", error);
        setErrorMessage("รหัสผ่านหรือผู้ใช้ไม่ถูกต้อง"); // "Login failed. Please try again."
      });
  };

  // Nagivate to register page
  const handleRegister = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <div className="header">
        <img src={Logo} alt="App Logo" className="login-logo" />
      </div>

      <div className="login-input-container">
        <input
          type="text"
          className="login-input"
          placeholder="ชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="login-input-container">
        <input
          type="text"
          className="login-input"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="submit-container">
        <button
          type="submit"
          className="bi bi-arrow-right submit-btn"
          onClick={handleLogin}
        ></button>
      </div>

      {/* Error message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="divider">
        <span>----------------------or-----------------------</span>
      </div>

      <div className="social-login">
        <button className="social-btn google" onClick={handleLoginGoogle}>
          <i className="bi bi-google"></i>
        </button>
        <button className="social-btn facebook">
          <i className="bi bi-facebook"></i>
        </button>
        <button className="social-btn apple">
          <i className="bi bi-apple"></i>
        </button>
      </div>

      <footer className="footer">
        <h3>
          ยังไม่มีบัญชี?{" "}
          <span className="signup-link" onClick={handleRegister}>
            สมัครสมาชิก
          </span>
        </h3>
      </footer>
    </div>
  );
};

export default Login;
