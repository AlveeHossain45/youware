import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Filter
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'

const Attendance = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAttendance()
  }, [])

  const loadAttendance = () => {
    try {
      const attendanceData = storage.get('attendance')
      const studentAttendance = attendanceData.filter(a => a.studentId === user.id)
      
      // Calculate statistics
      const totalDays = studentAttendance.length
      const presentDays = studentAttendance.filter(a => a.status === 'present').length
      const absentDays = studentAttendance.filter(a => a.status === 'absent').length
      const percentage = totalDays > 0 ? (presentDays / totalDays * 100).toFixed(1) : 0

      setAttendance(studentAttendance)
      setAttendanceStats({
        totalDays,
        presentDays,
        absentDays,
        percentage: parseFloat(percentage)
      })
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const attendanceRecord = attendance.find(a => a.date === dateStr)
      
      days.push({
        day: i,
        date: dateStr,
        status: attendanceRecord ? attendanceRecord.status : null,
        className: attendanceRecord ? attendanceRecord.className : null
      })
    }

    return days
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      case 'absent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
      case 'late':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
    }
  }

  const getCalendarDayColor = (day) => {
    if (!day) return ''
    
    const today = new Date()
    const isToday = day.day === today.getDate() && 
                    today.getMonth() === today.getMonth() && 
                    today.getFullYear() === today.getFullYear()

    if (isToday) {
      return `ring-2 ring-blue-500 ${getStatusColor(day.status)}`
    }
    
    return getStatusColor(day.status)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const calendarDays = generateCalendarDays()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentMonth = monthNames[new Date().getMonth()]
  const currentYear = new Date().getFullYear()

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
              Attendance Record
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your attendance and view patterns
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Total Days
                  </p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {attendanceStats.totalDays}
                  </p>
                </div>
                <div className={`p-3 rounded-xl text-blue-500 bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Present Days
                  </p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {attendanceStats.presentDays}
                  </p>
                </div>
                <div className={`p-3 rounded-xl text-green-500 bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.2 }}
              className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Absent Days
                  </p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {attendanceStats.absentDays}
                  </p>
                </div>
                <div className={`p-3 rounded-xl text-red-500 bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  <XCircle className="w-6 h-6" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.3 }}
              className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Attendance Rate
                  </p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {attendanceStats.percentage}%
                  </p>
                </div>
                <div className={`p-3 rounded-xl text-purple-500 bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentMonth} {currentYear}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Late</span>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={`text-center text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} py-2`}>
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                      day ? getCalendarDayColor(day) : ''
                    }`}
                  >
                    {day ? day.day : ''}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Attendance */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Attendance
                </h3>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}>
                  <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendance.slice(0, 10).map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          record.status === 'present' ? 'bg-green-100 dark:bg-green-900/30' :
                          record.status === 'absent' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          {record.status === 'present' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : record.status === 'absent' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {record.className}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Empty State */}
          {attendance.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No Attendance Records
              </h3>
              <p>
                Your attendance records will appear here once your teachers start marking attendance.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Attendance