import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Receipt,
  Download
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'

const AccountantDashboard = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingFees: 0,
    paidFees: 0,
    totalStudents: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Get data from localStorage
        const users = storage.get('users')
        const fees = storage.get('fees')

        const students = users.filter(u => u.role === 'student')
        const paidFees = fees.filter(f => f.status === 'paid')
        const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'partial')
        
        const totalRevenue = paidFees.reduce((sum, fee) => sum + fee.amount, 0)
        const totalPending = pendingFees.reduce((sum, fee) => sum + (fee.balanceDue || fee.amount), 0)

        // Calculate statistics
        setStats({
          totalRevenue,
          pendingFees: totalPending,
          paidFees: paidFees.length,
          totalStudents: students.length
        })

        // Generate recent transactions
        const transactions = fees.slice(0, 5).map(fee => ({
          id: fee.id,
          studentName: fee.studentName,
          amount: fee.amount,
          status: fee.status,
          date: fee.paidDate || fee.createdAt,
          type: fee.status === 'paid' ? 'income' : 'pending'
        }))

        setRecentTransactions(transactions)

        // Generate monthly revenue data (mock)
        const mockMonthlyRevenue = [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 58000 },
          { month: 'Jun', revenue: totalRevenue }
        ]

        setMonthlyRevenue(mockMonthlyRevenue)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${color}`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {typeof value === 'number' && value >= 1000 
                ? `$${(value / 1000).toFixed(1)}k` 
                : title.includes('$') ? `$${value}` : value
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Accountant Dashboard
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.name}! Manage financial operations and track revenue.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={DollarSign}
              change={18}
              changeType="increase"
              color="text-green-500"
              delay={0}
            />
            <StatCard
              title="Pending Fees"
              value={stats.pendingFees}
              icon={AlertCircle}
              change={5}
              changeType="decrease"
              color="text-red-500"
              delay={0.1}
            />
            <StatCard
              title="Paid Fees"
              value={stats.paidFees}
              icon={CheckCircle}
              change={12}
              changeType="increase"
              color="text-blue-500"
              delay={0.2}
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              change={8}
              changeType="increase"
              color="text-purple-500"
              delay={0.3}
            />
          </motion.div>

          {/* Revenue Chart & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Revenue Overview
                </h3>
                <button className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentTheme.primary} text-white text-sm font-medium hover:shadow-lg transition-all duration-200`}>
                  Export Report
                </button>
              </div>
              
              {/* Simple bar chart representation */}
              <div className="h-64 flex items-end justify-between gap-4">
                {monthlyRevenue.map((month, index) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(month.revenue / 65000) * 100}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={`w-full rounded-t-lg bg-gradient-to-t ${currentTheme.primary}`}
                      />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {month.month}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} font-medium`}>
                      ${(month.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Transactions
                </h3>
                <button 
                  onClick={() => window.location.href = '/accountant/payments'}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <BarChart3 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                          {transaction.type === 'income' ? (
                            <DollarSign className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {transaction.studentName}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-yellow-500'}`}>
                          ${transaction.amount.toLocaleString()}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} capitalize`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
          >
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Receipt, label: 'Generate Invoice', color: 'from-blue-500 to-blue-600', path: '/accountant/invoices' },
                { icon: CreditCard, label: 'Record Payment', color: 'from-green-500 to-green-600', path: '/accountant/payments' },
                { icon: BarChart3, label: 'Financial Reports', color: 'from-purple-500 to-purple-600', path: '/accountant/reports' },
                { icon: Download, label: 'Export Data', color: 'from-gray-500 to-gray-600', path: '/accountant/export' }
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = action.path}
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

export default AccountantDashboard