import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Eye, EyeOff, Boxes, ArrowRight} from "lucide-react";

import {useAuth} from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const {login} = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email.trim(), password);
            navigate("/dashboard", {replace: true});
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to sign in. Please check your credentials."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-brand-panel">
                <div className="brand-lockup">
                    <div className="brand-mark">
                        <Boxes size={25}/>
                    </div>
                    <span>StockFlow</span>
                </div>

                <div className="auth-brand-content">
                    <span className="eyebrow">INVENTORY MANAGEMENT, SIMPLIFIED</span>
                    <h1>Take control of your inventory.</h1>
                    <p>
                        Keep your products organized, monitor stock levels, and
                        understand your business from one clear workspace.
                    </p>
                </div>

                <span className="brand-footer">StockFlow · Inventory workspace</span>
            </section>

            <section className="auth-form-panel">
                <div className="auth-form-wrap">
                    <div className="mobile-brand">
                        <div className="brand-mark">
                            <Boxes size={23}/>
                        </div>
                        <span>StockFlow</span>
                    </div>

                    <span className="eyebrow">WELCOME BACK</span>
                    <h2>Sign in to your account</h2>
                    <p className="auth-subtitle">
                        Enter your details to access your workspace.
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((current) => !current)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={submitting}
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                            {!submitting && <ArrowRight size={18}/>}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/signup">Create account</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}