import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import { useNavigate } from 'react-router-dom' // useNavigate ইমপোর্ট করা হয়েছে
import apiClient from '../../api/axios'; // <-- ADD THIS IMPORT

const AdminDashboard = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    attendanceRate: 0,
    pendingFees: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate() // useNavigate হুক ব্যবহার করা হয়েছে

useEffect(() => {
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // This single endpoint provides all the stats calculated on the backend
      const response = await apiClient.get('/finance/dashboard-stats');
      setStats(response.data);

      // NOTE: Recent Activities are still mock data. You could create a backend endpoint for this later.
      const activities = [/* ... your existing mock activities ... */];
      setRecentActivities(activities);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Optional: Set an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  loadDashboardData();
}, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType, color, delay = 0 }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg group hover:scale-[1.02] transition-all duration-300`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${color}`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {typeof value === 'number' && value >= 1000 
                ? `${(value / 1000).toFixed(1)}k` 
                : value
              }
            </p>
            
            {change && (
              <div className={`flex items-center gap-1 text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                {changeType === 'increase' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{change}% from last month</span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Admin Dashboard
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.name}! Here's your system overview.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              change={12}
              changeType="increase"
              color="text-blue-500"
              delay={0}
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers}
              icon={GraduationCap}
              change={5}
              changeType="increase"
              color="text-green-500"
              delay={0.1}
            />
            <StatCard
              title="Active Classes"
              value={stats.totalClasses}
              icon={BookOpen}
              change={8}
              changeType="increase"
              color="text-purple-500"
              delay={0.2}
            />
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              change={15}
              changeType="increase"
              color="text-emerald-500"
              delay={0.3}
            />
            <StatCard
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              icon={Activity}
              change={3}
              changeType="increase"
              color="text-orange-500"
              delay={0.4}
            />
            <StatCard
              title="Pending Fees"
              value={`$${stats.pendingFees.toLocaleString()}`}
              icon={AlertCircle}
              change={8}
              changeType="decrease"
              color="text-red-500"
              delay={0.5}
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
              className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Revenue Overview
                </h3>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}>
                  <MoreVertical className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <div className="flex items-end justify-between h-64 gap-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                  <div key={month} className="flex flex-col items-center flex-1 gap-2">
                    <div className="flex flex-col items-center w-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.random() * 60 + 40}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className={`w-full rounded-t-lg bg-gradient-to-t ${currentTheme.primary}`}
                      />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {month}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
              className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Activities
                </h3>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}>
                  <MoreVertical className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <div className="space-y-4 overflow-y-auto max-h-64">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {activity.title}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                          {activity.description}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
          >
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: UserPlus, label: 'Add User', color: 'from-blue-500 to-blue-600', path: '/admin/users' },
                { icon: BookOpen, label: 'Create Class', color: 'from-green-500 to-green-600', path: '/admin/classes' },
                { icon: FileText, label: 'Schedule Exam', color: 'from-purple-500 to-purple-600', path: '/admin/exams' },
                { icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600', path: '/admin/settings' }
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(action.path)}
                    className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard