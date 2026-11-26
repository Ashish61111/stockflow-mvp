import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Boxes, Eye, EyeOff, ArrowRight} from "lucide-react";
import {useAuth} from "../context/AuthContext";

export default function Signup() {
    const navigate = useNavigate();
    const {signup} = useAuth();

    const [form, setForm] = useState({
        organization_name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const updateField = (event) => {
        const {name, value} = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await signup({
                organization_name: form.organization_name.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            navigate("/dashboard", {replace: true});
        } catch (err) {
            const detail = err.response?.data?.detail;

            setError(
                typeof detail === "string"
                    ? detail
                    : "Unable to create your account. Please check your details."
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
                    <span className="eyebrow">YOUR BUSINESS, IN SYNC</span>

                    <h1>A smarter way to manage your stock.</h1>

                    <p>
                        Create your workspace and bring your inventory,
                        product management, and stock visibility together.
                    </p>
                </div>

                <span className="brand-footer">
          StockFlow · Inventory workspace
        </span>
            </section>

            <section className="auth-form-panel">
                <div className="auth-form-wrap">
                    <div className="mobile-brand">
                        <div className="brand-mark">
                            <Boxes size={23}/>
                        </div>
                        <span>StockFlow</span>
                    </div>

                    <span className="eyebrow">GET STARTED</span>

                    <h2>Create your workspace</h2>

                    <p className="auth-subtitle">
                        Set up your organization and administrator account.
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <label htmlFor="organization_name">
                            Organization name
                        </label>

                        <input
                            id="organization_name"
                            name="organization_name"
                            type="text"
                            value={form.organization_name}
                            onChange={updateField}
                            placeholder="Your business name"
                            minLength={2}
                            maxLength={255}
                            autoComplete="organization"
                            required
                        />

                        <label htmlFor="email">Work email</label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={updateField}
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                        />

                        <label htmlFor="password">Password</label>

                        <div className="password-field">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={updateField}
                                placeholder="At least 8 characters"
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={18}/>
                                ) : (
                                    <Eye size={18}/>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button auth-submit"
                            disabled={submitting}
                        >
                            {submitting ? "Creating account..." : "Create account"}

                            {!submitting && <ArrowRight size={18}/>}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}