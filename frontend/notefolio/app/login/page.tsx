"use client"

import type React from "react"
import { useState,useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../components/auth-context"
import axios from "axios";  

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login, isLoading } = useAuth()

    const router = useRouter()
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          console.log('You are still signed in with the email and password you used');
    
        } else {
          console.log('You are not signed in');
    
        }
      }, []);
    
    
      
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email) {
            setError("Email is required")
            return
        }

        if (!password) {
            setError("Password is required")
            return
        }

        try {
            const response = await axios.post('http://localhost:8000/login-user', {
              email,
              password,
            });
            const data = response.data;
            console.log(data)
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            // handle the response data, e.g. store the access token
            localStorage.setItem("isAuthenticated", "true"); // Store the isAuthenticated state in local storage

            console.log(data)
            router.push("/");
          } catch (error) {
            console.error(error);
            setError("Invalid email or password");
          }
         
        

    }
    
    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>NoteFolio</h1>
                    <p>Sign in to access your notes</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Don't have an account? <a href="#">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
