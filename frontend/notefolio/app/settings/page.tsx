"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Moon,
    Sun,
    User,
    Bell,
    Shield,
    HardDrive,
    Globe,
    Keyboard,
    ArrowLeft,
    ChevronRight,
    LogOut,
} from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { useAuth } from "@/components/auth-context"

export default function SettingsPage() {
    const router = useRouter()
    const { theme, toggleTheme } = useTheme()
    const [activeSection, setActiveSection] = useState("appearance")

    const { user, logout } = useAuth()
    if (!user) {
        router.push("/login")
        return null
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const sections = [
        { id: "account", label: "Account", icon: User },
        { id: "appearance", label: "Appearance", icon: theme === "dark" ? Moon : Sun },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy & Security", icon: Shield },
        { id: "storage", label: "Storage", icon: HardDrive },
        { id: "language", label: "Language & Region", icon: Globe },
        { id: "keyboard", label: "Keyboard Shortcuts", icon: Keyboard },
    ]

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button className="back-button" onClick={() => router.push("/")}>
                    <ArrowLeft size={20} />
                    <span>Back to Notes</span>
                </button>
                <h1>Settings</h1>
            </div>

            <div className="settings-container">
                <div className="settings-sidebar">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`settings-nav-item ${activeSection === section.id ? "active" : ""}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <section.icon size={18} />
                            <span>{section.label}</span>
                        </button>
                    ))}

                    <button className="settings-nav-item logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <div className="settings-content">
                    {activeSection === "account" && (
                        <div className="settings-section">
                            <h2>Account Settings</h2>

                            <div className="settings-profile">
                                <div className="profile-avatar">
                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="profile-info">
                                    <h3>{user.name}</h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div className="settings-group">
                                <div className="settings-item">
                                    <div>
                                        <h4>Personal Information</h4>
                                        <p>Update your personal details</p>
                                    </div>
                                    <ChevronRight size={18} />
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Email Address</h4>
                                        <p>Change your email address</p>
                                    </div>
                                    <ChevronRight size={18} />
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Password</h4>
                                        <p>Update your password</p>
                                    </div>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "appearance" && (
                        <div className="settings-section">
                            <h2>Appearance</h2>

                            <div className="settings-group">
                                <div className="settings-item">
                                    <div>
                                        <h4>Theme</h4>
                                        <p>Choose between light and dark mode</p>
                                    </div>
                                    <button className="theme-toggle" onClick={toggleTheme}>
                                        {theme === "light" ? (
                                            <>
                                                <Moon size={18} />
                                                <span>Dark</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sun size={18} />
                                                <span>Light</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Font Size</h4>
                                        <p>Adjust the size of text in the app</p>
                                    </div>
                                    <select className="settings-select">
                                        <option>Small</option>
                                        <option selected>Medium</option>
                                        <option>Large</option>
                                    </select>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Sidebar Position</h4>
                                        <p>Choose where the sidebar appears</p>
                                    </div>
                                    <select className="settings-select">
                                        <option selected>Left</option>
                                        <option>Right</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "notifications" && (
                        <div className="settings-section">
                            <h2>Notifications</h2>

                            <div className="settings-group">
                                <div className="settings-item">
                                    <div>
                                        <h4>Email Notifications</h4>
                                        <p>Receive notifications via email</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Desktop Notifications</h4>
                                        <p>Show notifications on your desktop</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Reminder Notifications</h4>
                                        <p>Get reminders about your notes</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "privacy" && (
                        <div className="settings-section">
                            <h2>Privacy & Security</h2>

                            <div className="settings-group">
                                <div className="settings-item">
                                    <div>
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add an extra layer of security</p>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Session Management</h4>
                                        <p>Manage active sessions</p>
                                    </div>
                                    <ChevronRight size={18} />
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Data Privacy</h4>
                                        <p>Manage how your data is used</p>
                                    </div>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "storage" && (
                        <div className="settings-section">
                            <h2>Storage</h2>

                            <div className="storage-usage">
                                <div className="storage-bar">
                                    <div className="storage-used" style={{ width: "35%" }}></div>
                                </div>
                                <p>3.5 GB of 10 GB used</p>
                            </div>

                            <div className="settings-group">
                                <div className="settings-item">
                                    <div>
                                        <h4>Clear Cache</h4>
                                        <p>Free up space by clearing cached data</p>
                                    </div>
                                    <button className="settings-button">Clear</button>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Download All Data</h4>
                                        <p>Export all your notes and data</p>
                                    </div>
                                    <button className="settings-button">Download</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "language" && (
                        <div className="settings-section">
                            <h2>Language & Region</h2>

                            <div className="settings-group">
                                <div className="settings-item">
                                    <div>
                                        <h4>Language</h4>
                                        <p>Choose your preferred language</p>
                                    </div>
                                    <select className="settings-select">
                                        <option selected>English (US)</option>
                                        <option>English (UK)</option>
                                        <option>Español</option>
                                        <option>Français</option>
                                        <option>Deutsch</option>
                                    </select>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Time Format</h4>
                                        <p>Choose 12 or 24 hour format</p>
                                    </div>
                                    <select className="settings-select">
                                        <option selected>12 Hour</option>
                                        <option>24 Hour</option>
                                    </select>
                                </div>

                                <div className="settings-item">
                                    <div>
                                        <h4>Date Format</h4>
                                        <p>Choose your preferred date format</p>
                                    </div>
                                    <select className="settings-select">
                                        <option selected>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY/MM/DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "keyboard" && (
                        <div className="settings-section">
                            <h2>Keyboard Shortcuts</h2>

                            <div className="shortcuts-list">
                                <div className="shortcut-item">
                                    <span>Create new note</span>
                                    <div className="shortcut-keys">
                                        <kbd>Ctrl</kbd> + <kbd>N</kbd>
                                    </div>
                                </div>

                                <div className="shortcut-item">
                                    <span>Save note</span>
                                    <div className="shortcut-keys">
                                        <kbd>Ctrl</kbd> + <kbd>S</kbd>
                                    </div>
                                </div>

                                <div className="shortcut-item">
                                    <span>Toggle sidebar</span>
                                    <div className="shortcut-keys">
                                        <kbd>Ctrl</kbd> + <kbd>B</kbd>
                                    </div>
                                </div>

                                <div className="shortcut-item">
                                    <span>Search</span>
                                    <div className="shortcut-keys">
                                        <kbd>Ctrl</kbd> + <kbd>F</kbd>
                                    </div>
                                </div>

                                <div className="shortcut-item">
                                    <span>Bold text</span>
                                    <div className="shortcut-keys">
                                        <kbd>Ctrl</kbd> + <kbd>B</kbd>
                                    </div>
                                </div>

                                <div className="shortcut-item">
                                    <span>Italic text</span>
                                    <div className="shortcut-keys">
                                        <kbd>Ctrl</kbd> + <kbd>I</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
