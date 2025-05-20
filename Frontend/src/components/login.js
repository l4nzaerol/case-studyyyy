import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Server error");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div
        style={{
          width: "50%",
          background: "linear-gradient(to bottom right,rgb(4, 105, 148),rgb(27, 87, 107),rgb(4, 88, 124))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 600 }}>WELCOME BACK!</h2>
          <p style={{ fontSize: "1rem", marginTop: "1rem", opacity: 0.8 }}>
            Streamline your project management and team collaboration efficiently.
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
            animation: "rotate 20s linear infinite"
          }}
        ></div>
      </div>

      <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa", padding: "2rem" }}>
        <form
          onSubmit={handleLogin}
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
            color: "#2c3e50",
            transition: "all 0.3s ease"
          }}
        >
          <h3 className="text-center mb-3" style={{ color: "#2c5364", fontWeight: "600" }}>Klick Inc.</h3>
          <p className="text-center text-muted mb-4">Log in to your account</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: "15px" }}
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ marginBottom: "15px" }}
            />
          </div>

          <div className="d-flex justify-content-between mb-3" style={{ fontSize: "14px" }}>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="remember" />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: "#2c5364" }}
              onClick={() => alert("Coming soon")}
            >
              Recover password
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-2"
            style={{ backgroundColor: "#2c5364", borderColor: "#2c5364" }}
          >
            SIGN IN
          </button>

          <div className="text-center text-muted mb-2">or</div>

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate("/register")}
            style={{ borderColor: "#2c5364", color: "#2c5364" }}
          >
            Create New Account
          </button>
        </form>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
