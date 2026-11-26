import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("stockflow_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/api/auth/me");
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem("stockflow_token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const saveSession = async (responseData) => {
        const token = responseData.access_token;

        if (!token) {
            throw new Error("The server did not return an access token.");
        }

        localStorage.setItem("stockflow_token", token);

        if (responseData.user) {
            setUser(responseData.user);
        } else {
            const userResponse = await api.get("/api/auth/me");
            setUser(userResponse.data);
        }
    };

    const login = async (email, password) => {
        const formData = new URLSearchParams();

        formData.append("username", email);
        formData.append("password", password);

        const response = await api.post("/api/auth/login", formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        await saveSession(response.data);

        return response.data;
    };

    const signup = async (formData) => {
        const response = await api.post("/api/auth/signup", formData);

        await saveSession(response.data);

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("stockflow_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
                isAuthenticated: Boolean(user),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }

    return context;
}