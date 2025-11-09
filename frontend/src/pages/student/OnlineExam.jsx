import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'
import apiClient from '../../api/axios';

const OnlineExam = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [exam, setExam] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExam()
  }, [id])

  useEffect(() => {
    let timer
    if (examStarted && !examSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [examStarted, examSubmitted, timeRemaining])

  const loadExam = () => {
    try {
      const exams = storage.get('exams')
      const examData = exams.find(e => e.id === id)
      
      if (!examData) {
        navigate('/student/dashboard')
        return
      }

      // Check if exam belongs to student's class
      if (examData.classId !== user.classId) {
        navigate('/student/dashboard')
        return
      }

      setExam(examData)
      
      // Initialize answers object
      const initialAnswers = {}
      examData.questions.forEach((q, index) => {
        initialAnswers[index] = -1 // -1 means not answered
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error('Error loading exam:', error)
      navigate('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const startExam = () => {
    setExamStarted(true)
    setTimeRemaining(exam.duration * 60) // Convert minutes to seconds
  }

  const selectAnswer = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const toggleFlag = (questionIndex) => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex)
    } else {
      newFlagged.add(questionIndex)
    }
    setFlaggedQuestions(newFlagged)
  }

  const navigateQuestion = (direction) => {
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (direction === 'next' && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const goToQuestion = (index) => {
    setCurrentQuestion(index)
  }

  const calculateScore = () => {
    let score = 0
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.marks
      }
    })
    return score
  }

  const handleSubmitExam = () => {
    if (examSubmitted) return

    const score = calculateScore()
    const percentage = (score / exam.totalMarks) * 100

    const result = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: user.id,
      studentName: user.name,
      score,
      totalMarks: exam.totalMarks,
      percentage,
      answers,
      timeTaken: exam.duration * 60 - timeRemaining,
      submittedAt: new Date().toISOString()
    }

    // Save result to localStorage
    const results = storage.get('examResults') || []
    results.push(result)
    storage.set('examResults', results)

    setExamSubmitted(true)
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== -1).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`text-center p-8 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Exam Not Found
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            The exam you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (examSubmitted) {
    const score = calculateScore()
    const percentage = (score / exam.totalMarks) * 100

    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`text-center p-8 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg max-w-md w-full`}
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Exam Submitted!
          </h2>
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {score}/{exam.totalMarks}
            </p>
            <p className={`text-xl ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {percentage.toFixed(1)}%
            </p>
          </div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            Your exam has been submitted successfully. You can view detailed results in your dashboard.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl`}
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`text-center p-8 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg max-w-md w-full`}
        >
          <FileText className={`w-16 h-16 ${currentTheme.text} mx-auto mb-4`} />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            {exam.title}
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {exam.description}
          </p>
          
          <div className={`space-y-3 mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <div className="flex justify-between">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Questions:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Marks:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.totalMarks}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startExam}
            className={`px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl text-lg`}
          >
            Start Exam
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const currentQuestionData = exam.questions[currentQuestion]

  return (
    <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8">
          {/* Timer and Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500' : currentTheme.text}`} />
                  <span className={`font-mono text-lg font-semibold ${timeRemaining < 300 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Question {currentQuestion + 1} of {exam.questions.length}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Answered: {getAnsweredCount()}/{exam.questions.length}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitExam}
                className={`px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg hover:shadow-xl flex items-center gap-2`}
              >
                <Send className="w-4 h-4" />
                Submit Exam
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Question */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 }
              }}
              initial="hidden"
              animate="visible"
              key={currentQuestion}
              className={`lg:col-span-3 p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Question {currentQuestion + 1}
                </h3>
                <button
                  onClick={() => toggleFlag(currentQuestion)}
                  className={`p-2 rounded-lg ${flaggedQuestions.has(currentQuestion) ? 'bg-yellow-100 dark:bg-yellow-900/30' : isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <Flag className={`w-5 h-5 ${flaggedQuestions.has(currentQuestion) ? 'text-yellow-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className={`mb-8 text-lg ${isDark ? 'text-white' : 'text-gray-900'} leading-relaxed`}>
                {currentQuestionData.question}
              </div>

              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectAnswer(currentQuestion, index)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      answers[currentQuestion] === index
                        ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg`
                        : isDark ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        answers[currentQuestion] === index
                          ? 'border-white bg-white'
                          : isDark ? 'border-gray-600' : 'border-gray-300'
                      } flex items-center justify-center`}>
                        {answers[currentQuestion] === index && (
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                      <span className={`text-sm ${answers[currentQuestion] === index ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => navigateQuestion('prev')}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentQuestion === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark ? 'hover:bg-gray-700/30 text-white' : 'hover:bg-gray-100 text-gray-900'
                  } flex items-center gap-2`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <button
                  onClick={() => navigateQuestion('next')}
                  disabled={currentQuestion === exam.questions.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentQuestion === exam.questions.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark ? 'hover:bg-gray-700/30 text-white' : 'hover:bg-gray-100 text-gray-900'
                  } flex items-center gap-2`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Question Navigator */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              initial="hidden"
              animate="visible"
              className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}
            >
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Question Navigator
              </h4>
              
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((_, index) => {
                  const isAnswered = answers[index] !== -1
                  const isFlagged = flaggedQuestions.has(index)
                  const isCurrent = index === currentQuestion
                  
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        isCurrent
                          ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg`
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : isFlagged
                          ? 'bg-yellow-500 text-white'
                          : isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-600" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded dark:bg-gray-600" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Not Answered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default OnlineExam