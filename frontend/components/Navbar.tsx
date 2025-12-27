"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Search, ChevronDown, Plus } from "lucide-react";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Try to get user name from localStorage or other source
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // Debounce search functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-64 right-0 h-20 bg-slate-900/80 backdrop-blur-xl border-b z-40"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-96 transition-all duration-300"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)'
          }}
        >
          <Search className="w-5 h-5" style={{ color: 'var(--input-placeholder)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--input-text)' }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
            style={{
              color: 'var(--input-placeholder)',
              background: 'var(--background)',
              border: '1px solid var(--input-border)'
            }}
          >
            /
          </kbd>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Add Task Button - Prominent */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </motion.button>

          {/* Notifications */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl transition-all duration-300"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)'
            }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
              >
                {notifications}
              </motion.span>
            )}
          </motion.button>

          {/* User Profile */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer hover:bg-slate-800/50"
            style={{ border: '1px solid var(--glass-border)' }}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>

            {/* User Info */}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs" style={{ color: 'var(--input-placeholder)' }}>Online</p>
            </div>

            <ChevronDown className="w-4 h-4" style={{ color: 'var(--input-placeholder)' }} />
          </motion.div>
        </div>
      </div>

      {/* Bottom Border Accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 origin-left"
      />
    </motion.nav>
  );
}
