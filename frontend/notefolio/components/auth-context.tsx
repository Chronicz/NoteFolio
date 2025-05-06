"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
    id: string
    email: string
    name: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("notefolio_user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error("Failed to parse stored user", e)
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        // This is a mock login - in a real app, you would validate with a backend
        setIsLoading(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        if (email && password.length >= 6) {
            const newUser = {
                id: "user-1",
                email,
                name: email.split("@")[0],
            }
            setUser(newUser)
            localStorage.setItem("notefolio_user", JSON.stringify(newUser))
            setIsLoading(false)
            return true
        }

        setIsLoading(false)
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("notefolio_user")
    }

    return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
