import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Users,
  FileText,
  Clock,
  Video,
  TrendingUp,
  Award,
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MessageSquare
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'

const TeacherDashboard = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    upcomingExams: 0,
    pendingAssignments: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Get data from localStorage
        const classes = storage.get('classes')
        const users = storage.get('users')
        const exams = storage.get('exams')

        // Get teacher's classes
        const teacherClasses = classes.filter(c => c.teacherId === user.id)
        const studentsInClasses = users.filter(u => 
          u.role === 'student' && 
          teacherClasses.some(c => c.id === u.classId)
        )

        // Get upcoming exams for teacher's classes
        const upcomingExams = exams.filter(e => 
          teacherClasses.some(c => c.id === e.classId) &&
          new Date(e.scheduledDate) > new Date()
        )

        // Calculate statistics
        setStats({
          totalClasses: teacherClasses.length,
          totalStudents: studentsInClasses.length,
          upcomingExams: upcomingExams.length,
          pendingAssignments: 3 // Mock data
        })

        // Generate upcoming classes (mock data)
        const mockClasses = [
          { id: 1, name: 'Mathematics 10A', time: '9:00 AM', room: 'Room 201', type: 'online', students: 25 },
          { id: 2, name: 'Physics Fundamentals', time: '10:30 AM', room: 'Lab 101', type: 'offline', students: 20 },
          { id: 3, name: 'Mathematics 10A - Extra Session', time: '2:00 PM', room: 'Online', type: 'online', students: 15 }
        ]
        setUpcomingClasses(mockClasses)

        // Generate recent activities
        const activities = [
          { id: 1, type: 'exam', icon: FileText, title: 'Exam Created', description: 'Mathematics Midterm Exam scheduled', time: '2 hours ago', color: 'text-blue-500' },
          { id: 2, type: 'attendance', icon: CheckCircle, title: 'Attendance Marked', description: 'Marked attendance for Class 10A', time: '4 hours ago', color: 'text-green-500' },
          { id: 3, type: 'assignment', icon: BookOpen, title: 'Assignment Posted', description: 'New physics assignment uploaded', time: '6 hours ago', color: 'text-purple-500' },
          { id: 4, type: 'class', icon: Video, title: 'Online Class Conducted', description: 'Completed mathematics session', time: '1 day ago', color: 'text-emerald-500' }
        ]
        setRecentActivities(activities)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

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

  const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
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
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{title}</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Teacher Dashboard</h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back, {user?.name}! Manage your classes and students.</p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="My Classes" value={stats.totalClasses} icon={BookOpen} color="text-blue-500" delay={0} />
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="text-green-500" delay={0.1} />
            <StatCard title="Upcoming Exams" value={stats.upcomingExams} icon={FileText} color="text-purple-500" delay={0.2} />
            <StatCard title="Pending Tasks" value={stats.pendingAssignments} icon={Clock} color="text-orange-500" delay={0.3} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Schedule</h3>
                <button className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentTheme.primary} text-white text-sm font-medium hover:shadow-lg transition-all duration-200`}>View All</button>
              </div>
              <div className="space-y-4">
                {upcomingClasses.map((classItem, index) => (
                  <motion.div key={classItem.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDark ? 'border-gray-700/30' : 'border-gray-200'} hover:shadow-md transition-all duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${classItem.type === 'online' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                          {classItem.type === 'online' ? <Video className="w-5 h-5 text-blue-500" /> : <BookOpen className="w-5 h-5 text-green-500" />}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{classItem.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}><Clock className="w-4 h-4" />{classItem.time}</span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}><Users className="w-4 h-4" />{classItem.students} students</span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.room}</span>
                          </div>
                        </div>
                      </div>
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}>
                        <Play className={`w-5 h-5 ${classItem.type === 'online' ? 'text-blue-500' : 'text-green-500'}`} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activities</h3>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}>
                  <BarChart3 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}>
                      <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>{activity.description}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>{activity.time}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'Create Exam', color: 'from-blue-500 to-blue-600', path: '/teacher/exams' },
                { icon: BookOpen, label: 'Add Assignment', color: 'from-green-500 to-green-600', path: '/teacher/assignments' },
                { icon: Calendar, label: 'Mark Attendance', color: 'from-purple-500 to-purple-600', path: '/teacher/attendance' },
                { icon: Video, label: 'Schedule Class', color: 'from-emerald-500 to-emerald-600', path: '/teacher/online-classes' }
              ].map((action) => {
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

export default TeacherDashboard