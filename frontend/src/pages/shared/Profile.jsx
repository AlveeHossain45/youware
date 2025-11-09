import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Edit3,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Save
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../utils/storage'

const Profile = () => {
  const { isDark, currentTheme } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    education: '',
    experience: '',
    avatar: ''
  })
  const [uploading, setUploading] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        education: user.education || '',
        experience: user.experience || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleSave = () => {
    if (!profileData.name.trim()) {
      setSaveStatus('Name is required')
      setTimeout(() => setSaveStatus(''), 3000)
      return
    }

    try {
      const updatedUser = { ...user, ...profileData }
      const users = storage.get('users')
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u)
      storage.set('users', updatedUsers)
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      setSaveStatus('Profile updated successfully!')
      setTimeout(() => {
        setSaveStatus('')
        setIsEditing(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveStatus('Error updating profile')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        education: user.education || '',
        experience: user.experience || '',
        avatar: user.avatar || ''
      })
    }
    setIsEditing(false)
    setSaveStatus('')
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSaveStatus('Please select an image file')
      setTimeout(() => setSaveStatus(''), 3000)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveStatus('Image size should be less than 5MB')
      setTimeout(() => setSaveStatus(''), 3000)
      return
    }

    setUploading(true)

    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result })
        setUploading(false)
        setShowAvatarModal(false)
        setSaveStatus('Profile picture updated!')
        setTimeout(() => setSaveStatus(''), 3000)
      }
      reader.readAsDataURL(file)
    }, 1500)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, scale: 0.8 }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-blue-50 via-white to-indigo-50'}`}>
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Profile
                  </h1>
                  <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Manage your personal information and settings
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {saveStatus && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-4 py-2 rounded-lg ${
                      saveStatus.includes('Error') || saveStatus.includes('required') 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}
                  >
                    {saveStatus}
                  </motion.div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                  className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-2 group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isEditing ? (
                    <>
                      <AlertCircle className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Cancel</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Edit Profile</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/40 border border-gray-700/50' : 'bg-white/80 border border-white/20'} shadow-lg backdrop-blur-sm`}>
                <div className="text-center">
                  <div className="relative inline-block group">
                    <div className="relative">
                      <img
                        src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=128`}
                        alt={profileData.name}
                        className="w-32 h-32 rounded-2xl border-4 border-white/80 shadow-lg transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {isEditing && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAvatarModal(true)}
                        className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Camera className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-6 mb-2`}>
                    {profileData.name}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Verified Account
                    </span>
                  </div>
                  
                  <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Member Since</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Information Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/40 border border-gray-700/50' : 'bg-white/80 border border-white/20'} shadow-lg backdrop-blur-sm`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2`}>
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <motion.div variants={itemVariants}>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                            : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                        placeholder="Enter your full name"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                              : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                          placeholder="your@email.com"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                              : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <motion.div variants={itemVariants}>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Education
                      </label>
                      <div className="relative">
                        <BookOpen className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          value={profileData.education}
                          onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                              : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                          placeholder="Your educational background"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Experience
                      </label>
                      <div className="relative">
                        <Award className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          value={profileData.experience}
                          onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                              : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                          placeholder="Your professional experience"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className={`absolute left-3 top-4 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <textarea
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!isEditing}
                          rows={3}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 resize-none ${
                            isDark 
                              ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                              : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                          } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                          placeholder="Enter your full address"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Bio Field */}
                <motion.div variants={itemVariants} className="mt-6">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-gray-700/30 border border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/50 border border-gray-200/50 text-gray-900 placeholder-gray-500'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500/50 focus:border-blue-500'} shadow-sm`}
                    placeholder="Tell us about yourself..."
                  />
                </motion.div>

                {/* Action Buttons */}
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
                  >
                    <button
                      onClick={handleCancel}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isDark 
                          ? 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                          : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 hover:text-gray-900'
                      } shadow-sm`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-full max-w-md rounded-2xl p-6 ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              } shadow-xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Update Profile Picture
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  } transition-colors duration-200`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <img
                    src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=128`}
                    alt="Current avatar"
                    className="w-24 h-24 rounded-2xl border-4 border-white/80 shadow-lg"
                  />
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Upload a new profile picture. JPG, PNG, GIF allowed. Max 5MB.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Choose Image</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile