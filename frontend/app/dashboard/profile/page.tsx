"use client";

import { motion } from "framer-motion";
import { User, Mail, Calendar, Award } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-gray-600 mt-2">Manage your account information.</p>
      </motion.div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white/70 backdrop-blur-md rounded-2xl p-16 border border-indigo-100 shadow-xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50"
        >
          <User className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Coming Soon
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-gray-600 text-lg mb-8 max-w-md mx-auto"
        >
          We're creating a comprehensive profile page where you can manage your account details and preferences.
        </motion.p>

        {/* Feature Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <Mail className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Contact Info</h3>
            <p className="text-sm text-gray-600">Update email & details</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Activity</h3>
            <p className="text-sm text-gray-600">View your history</p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200">
            <Award className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Achievements</h3>
            <p className="text-sm text-gray-600">Track your progress</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
