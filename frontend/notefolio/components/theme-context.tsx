"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light")

    // Initialize theme from localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem("notefolio_theme") as Theme | null

        // Check for stored theme or system preference
        if (storedTheme) {
            setTheme(storedTheme)
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark")
        }
    }, [])

    // Update body class and localStorage when theme changes
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark-mode")
        } else {
            document.documentElement.classList.remove("dark-mode")
        }
        localStorage.setItem("notefolio_theme", theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
