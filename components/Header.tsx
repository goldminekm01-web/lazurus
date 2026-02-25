"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Menu, X, TrendingUp, Zap } from "lucide-react";

const NAV_LINKS = [
    { label: "Markets", href: "/category/markets" },
    { label: "Economy", href: "/category/economy" },
    { label: "Analysis", href: "/category/analysis" },
    { label: "Opinion", href: "/category/opinion" },
    { label: "Trading", href: "/category/trading" },
    { label: "Crypto", href: "/category/crypto" },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 50);
            }
            if (e.key === "Escape") setSearchOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchValue.trim())}`;
        }
    };

    return (
        <>
            <a href="#main-content" className="skip-nav">
                Skip to main content
            </a>

            <header
                className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-200 ${isScrolled ? "shadow-md" : ""
                    }`}
            >
                <div className="max-w-8xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-[60px] gap-4">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 shrink-0 group"
                            aria-label="Lazarus — Home"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-[#0a0a0a] rounded-md">
                                <TrendingUp className="w-4 h-4 text-[#e8a020]" />
                            </div>
                            <span className="font-display font-bold text-xl text-[#0a0a0a] tracking-tight">
                                Laza<span className="text-[#e8a020]">rus</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav
                            className="hidden lg:flex items-center gap-1"
                            aria-label="Primary navigation"
                        >
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <button
                                onClick={() => {
                                    setSearchOpen(true);
                                    setTimeout(() => searchRef.current?.focus(), 50);
                                }}
                                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                aria-label="Open search (⌘K)"
                            >
                                <Search className="w-4 h-4" />
                            </button>

                            {/* Subscribe */}
                            <Link
                                href="/subscribe"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors"
                            >
                                <Zap className="w-3.5 h-3.5 text-[#e8a020]" />
                                Subscribe
                            </Link>

                            {/* Admin link */}
                            <Link
                                href="/admin"
                                className="hidden md:inline-flex items-center px-3 py-1.5 border border-gray-200 text-gray-500 text-sm rounded-md hover:border-gray-400 hover:text-gray-700 transition-colors"
                            >
                                Editor
                            </Link>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-800 rounded-md"
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={menuOpen}
                            >
                                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 animate-slide-up">
                        <nav className="flex flex-col gap-1 pt-3" aria-label="Mobile navigation">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-2 mt-1 border-t border-gray-100 flex gap-2">
                                <Link
                                    href="/subscribe"
                                    className="flex-1 text-center px-3 py-2 bg-[#0a0a0a] text-white text-sm font-semibold rounded-md"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Subscribe
                                </Link>
                                <Link
                                    href="/admin"
                                    className="flex-1 text-center px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-md"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Editor
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Search Overlay */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
                    onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up">
                        <form onSubmit={handleSearch} className="flex items-center px-4 gap-3">
                            <Search className="w-5 h-5 text-gray-400 shrink-0" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search articles, markets, topics…"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="flex-1 py-4 text-base outline-none text-gray-800 placeholder-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded"
                            >
                                ESC
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
