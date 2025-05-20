import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("team_member");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      setPasswordStrength("weak");
    } else if (
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword)
    ) {
      setPasswordError("");
      setPasswordStrength("strong");
    } else {
      setPasswordError("");
      setPasswordStrength("medium");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa", padding: "2rem" }}>
        <form
          onSubmit={handleRegister}
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
            color: "#2c3e50",
            transition: "all 0.3s ease",
          }}
        >
          <h3 className="text-center mb-3" style={{ color: "#2c5364", fontWeight: "600" }}>Create Account</h3>
          <p className="text-center text-muted mb-4">Join our team management platform</p>

          {error && <div className="alert alert-danger text-center">{error}</div>}

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {passwordStrength && (
              <div className="mt-1">
                <div
                  className={`progress ${
                    passwordStrength === "strong"
                      ? "bg-success"
                      : passwordStrength === "medium"
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                  style={{ height: "5px" }}
                >
                  <div
                    className={`progress-bar`}
                    style={{
                      width:
                        passwordStrength === "strong"
                          ? "100%"
                          : passwordStrength === "medium"
                          ? "66%"
                          : "33%",
                    }}
                  ></div>
                </div>
                <small className="text-muted">Strength: {passwordStrength}</small>
              </div>
            )}
            {passwordError && <small className="text-danger d-block">{passwordError}</small>}
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 d-none">
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
              <option value="client">Client</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: "#2c5364", borderColor: "#2c5364" }}>
            Create Account
          </button>

          <div className="text-center mt-3">
            <small className="text-muted">or</small>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn btn-outline-secondary w-100 mt-2"
            style={{ borderColor: "#2c5364", color: "#2c5364" }}
          >
            Back to Login
          </button>
        </form>
      </div>

      <div
        style={{
          flex: 1,
          background: "linear-gradient(to bottom right,rgb(4, 105, 148),rgb(27, 87, 107),rgb(4, 88, 124))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 600 }}>Join Klick Inc.</h2>
          <p style={{ fontSize: "1rem", marginTop: "1rem", opacity: 0.8 }}>
            Create your account and start managing projects like a pro.
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
            animation: "rotate 20s linear infinite",
          }}
        ></div>
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

export default Registration;
