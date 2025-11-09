import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  Calendar,
  Play,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'

const Exams = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [exams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadExams()
  }, [])

  useEffect(() => {
    filterExams()
  }, [exams, searchTerm, filterStatus])

  const loadExams = () => {
    try {
      let examsData = storage.get('exams') || []
      if (user?.role === 'student') {
        examsData = examsData.filter(exam => exam.classId === user.classId)
      } else if (user?.role === 'teacher') {
        examsData = examsData.filter(exam => exam.teacherId === user.id)
      }
      setExams(examsData)
      setFilteredExams(examsData)
    } catch (error) {
      console.error('Error loading exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterExams = () => {
    let filtered = exams

    if (filterStatus !== 'all') {
      filtered = filtered.filter(exam => exam.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.className && exam.className.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredExams(filtered)
  }
  
  const handleActionClick = (exam) => {
    if (user?.role === 'student' && exam.status !== 'completed') {
        navigate(`/student/exam/${exam.id}`)
    } else {
        alert(`Viewing details for: ${exam.title}`);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  }

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Exams</h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View and manage all examinations</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className={`mb-6 p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder="Search exams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              </div>
              <div className="relative">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`pl-10 pr-10 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'} appearance-none cursor-pointer`}>
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div key={exam.id} variants={itemVariants} custom={index} whileHover={{ y: -5, transition: { duration: 0.2 } }} className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${exam.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}><FileText className="w-6 h-6" /></div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.title}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exam.className}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${exam.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>{exam.status}</div>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-2`}>{exam.description}</p>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2"><Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Scheduled: {new Date(exam.scheduledDate).toLocaleString()}</span></div>
                  <div className="flex items-center gap-2"><Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exam.duration} minutes</span></div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button onClick={() => handleActionClick(exam)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${exam.status === 'completed' ? (isDark ? 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50' : 'bg-gray-100 text-gray-600 hover:bg-gray-200') : (isDark ? `bg-blue-600/20 text-blue-400 hover:bg-blue-600/30` : `bg-blue-100 text-blue-600 hover:bg-blue-200`)}`}>
                    {exam.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{exam.status === 'completed' ? 'View Results' : user?.role === 'student' ? 'Start Exam' : 'View Details'}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Exams