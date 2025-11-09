import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
  CheckCircle
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

const Messages = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = () => {
    try {
      // Mock messages data
      const mockMessages = [
        {
          id: 1,
          sender: 'Sarah Johnson',
          subject: 'Math Assignment Due',
          content: 'Reminder that your math assignment is due tomorrow at 11:59 PM.',
          time: '2 hours ago',
          read: false,
          avatar: 'https://ui-avatars.com/api/?name=Sarah&background=random'
        },
        {
          id: 2,
          sender: 'Admin',
          subject: 'System Maintenance',
          content: 'The system will be undergoing maintenance this weekend from 2 AM to 6 AM.',
          time: '1 day ago',
          read: true,
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=random'
        },
        {
          id: 3,
          sender: 'Robert Martinez',
          subject: 'Fee Payment Reminder',
          content: 'Your monthly tuition fee is due next week. Please ensure timely payment.',
          time: '2 days ago',
          read: false,
          avatar: 'https://ui-avatars.com/api/?name=Robert&background=random'
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: user?.name || 'You',
        subject: 'New Message',
        content: newMessage,
        time: 'Just now',
        read: true,
        avatar: user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'
      }
      setMessages([newMsg, ...messages])
      setNewMessage('')
    }
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Messages
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Communicate with teachers and students
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <div className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg h-96 overflow-y-auto`}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={itemVariants}
                      custom={index}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        !message.read 
                          ? isDark ? 'bg-blue-900/30 border-blue-700/50' : 'bg-blue-50 border-blue-200'
                          : isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'
                      } ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={message.avatar}
                          alt={message.sender}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {message.sender}
                            </h4>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {message.time}
                            </span>
                          </div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {message.subject}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Message Detail */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              {selectedMessage ? (
                <div className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={selectedMessage.avatar}
                      alt={selectedMessage.sender}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMessage.sender}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedMessage.time}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {selectedMessage.subject}
                  </h4>
                  
                  <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                    {selectedMessage.content}
                  </p>
                  
                  <div className="flex gap-3">
                    <button className={`flex-1 px-4 py-2 rounded-xl ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} ${isDark ? 'text-white' : 'text-gray-900'} transition-colors`}>
                      Reply
                    </button>
                    <button className={`flex-1 px-4 py-2 rounded-xl ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100'} transition-colors`}>
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg text-center`}>
                  <MessageSquare className={`w-16 h-16 ${isDark ? 'text-gray-400' : 'text-gray-600'} mx-auto mb-4`} />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a message to view details
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* New Message */}
          <div className="mt-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'} ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-2`}
                >
                  <Send className="w-5 h-5" />
                  Send
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Messages