import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Award, BookOpen, Edit3, Camera,
  Shield, CheckCircle, AlertCircle, Upload, X, Save, Calendar,
  Briefcase, GraduationCap, Map, Smartphone, UserCheck
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axios';

const Profile = () => {
  const { isDark, currentTheme } = useTheme();
  const { user, updateUserContext } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', address: '', bio: '', 
    education: '', experience: '', avatar: '',
    joinDate: 'January 2024', department: 'Engineering', status: 'Active'
  });
  const [uploading, setUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: '', type: 'idle' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '', email: user.email || '', phone: user.phone || '',
        address: user.address || '', bio: user.bio || '', education: user.education || '',
        experience: user.experience || '', avatar: user.avatar || '',
        joinDate: user.joinDate || 'January 2024',
        department: user.department || 'Engineering',
        status: user.status || 'Active'
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      setSaveStatus({ message: 'Name is required', type: 'error' });
      setTimeout(() => setSaveStatus({ message: '', type: 'idle' }), 3000);
      return;
    }

    try {
      const dataToUpdate = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        education: profileData.education,
        experience: profileData.experience,
        avatar: profileData.avatar,
      };

      const response = await apiClient.put(`/users/${user.id}`, dataToUpdate);
      updateUserContext(response.data);
      
      setSaveStatus({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        setSaveStatus({ message: '', type: 'idle' });
        setIsEditing(false);
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      setSaveStatus({ message: errorMessage, type: 'error' });
      setTimeout(() => setSaveStatus({ message: '', type: 'idle' }), 3000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || '', email: user.email || '', phone: user.phone || '',
        address: user.address || '', bio: user.bio || '', education: user.education || '',
        experience: user.experience || '', avatar: user.avatar || '',
        joinDate: user.joinDate || 'January 2024',
        department: user.department || 'Engineering',
        status: user.status || 'Active'
      });
    }
    setIsEditing(false);
    setSaveStatus({ message: '', type: 'idle' });
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveStatus({ message: 'Please select an image file', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSaveStatus({ message: 'Image size must be less than 10MB', type: 'error' });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, avatar: reader.result }));
      setUploading(false);
      setShowAvatarModal(false);
      setSaveStatus({ message: 'Avatar ready. Click "Save Changes".', type: 'info' });
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => fileInputRef.current?.click();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-gray-50 via-blue-50/30 to-gray-100'}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`pt-20 transition-all duration-500 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              >
                Profile
              </motion.h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your personal information and preferences</p>
            </div>
            
            <div className="flex items-center gap-3 mt-6 lg:mt-0">
              <AnimatePresence>
                {saveStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    className={`px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium backdrop-blur-sm border ${
                      saveStatus.type === 'error' 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                        : saveStatus.type === 'success' 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {saveStatus.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                    {saveStatus.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 ${
                  isEditing 
                    ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    : `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg hover:shadow-xl border border-transparent`
                }`}
              >
                {isEditing ? <X size={20}/> : <Edit3 size={20}/>}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </motion.button>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Sidebar - Profile Card */}
            <div className="xl:col-span-1 space-y-8">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-8 rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700 shadow-xl' 
                    : 'bg-white/80 border-white shadow-2xl'
                }`}
              >
                <div className="relative mx-auto w-40 h-40 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1">
                    <img 
                      src={profileData.avatar} 
                      alt={profileData.name} 
                      className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                    />
                  </div>
                  {isEditing && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setShowAvatarModal(true)} 
                      className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg border-2 border-white dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Camera size={18}/>
                    </motion.button>
                  )}
                </div>
                
                <div className="text-center mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {profileData.name}
                  </h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium mb-4">
                    <UserCheck size={16}/>
                    <span className="capitalize">{user.role}</span>
                  </div>
                  
                  <div className="space-y-3 mt-6 text-left">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Calendar size={18} className="text-blue-500"/>
                      <span className="text-sm">Joined {profileData.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Briefcase size={18} className="text-purple-500"/>
                      <span className="text-sm">{profileData.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Shield size={18} className="text-green-500"/>
                      <span className="text-sm">{profileData.status}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700 shadow-xl' 
                    : 'bg-white/80 border-white shadow-2xl'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Completion</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Basic Info</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Contact Details</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Edit Form */}
            <div className="xl:col-span-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-8 rounded-3xl backdrop-blur-sm border ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700 shadow-xl' 
                    : 'bg-white/80 border-white shadow-2xl'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <InputField 
                    label="Full Name" 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                    disabled={!isEditing} 
                    icon={User} 
                    placeholder="Enter your full name"
                  />
                  <InputField 
                    label="Email Address" 
                    value={profileData.email} 
                    onChange={e => setProfileData({...profileData, email: e.target.value})} 
                    disabled={!isEditing} 
                    icon={Mail}
                    type="email"
                  />
                  <InputField 
                    label="Phone Number" 
                    value={profileData.phone} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                    disabled={!isEditing} 
                    icon={Smartphone}
                    placeholder="+1 (555) 000-0000"
                  />
                  <InputField 
                    label="Address" 
                    value={profileData.address} 
                    onChange={e => setProfileData({...profileData, address: e.target.value})} 
                    disabled={!isEditing} 
                    icon={Map}
                    placeholder="Enter your address"
                  />
                  <InputField 
                    label="Education" 
                    value={profileData.education} 
                    onChange={e => setProfileData({...profileData, education: e.target.value})} 
                    disabled={!isEditing} 
                    icon={GraduationCap}
                    placeholder="Your educational background"
                  />
                  <InputField 
                    label="Experience" 
                    value={profileData.experience} 
                    onChange={e => setProfileData({...profileData, experience: e.target.value})} 
                    disabled={!isEditing} 
                    icon={Briefcase}
                    placeholder="Your professional experience"
                  />
                  
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Bio
                    </label>
                    <motion.textarea 
                      whileFocus={{ scale: 1.01 }}
                      value={profileData.bio} 
                      onChange={e => setProfileData({...profileData, bio: e.target.value})} 
                      disabled={!isEditing} 
                      rows="4" 
                      placeholder="Tell us about yourself..."
                      className={`w-full p-4 rounded-2xl border transition-all duration-300 resize-none ${
                        isDark 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <button
                      onClick={handleCancel}
                      className="px-8 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 border border-gray-300 dark:border-gray-600"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      onClick={handleSave} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-3 transition-all duration-300`}
                    >
                      <Save size={20}/> Save Changes
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className={`w-full max-w-md p-8 rounded-3xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-gray-800/90 border-gray-700 shadow-2xl' 
                  : 'bg-white/95 border-white shadow-3xl'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Update Profile Picture</h3>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-500 dark:text-gray-400"/>
                </button>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden"/>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={triggerFileInput} 
                disabled={uploading}
                className={`w-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                } ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload size={64} className="text-gray-400 mb-6 opacity-60"/>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, disabled, icon: Icon, type = "text", placeholder = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div whileFocus={{ scale: 1.01 }} className="group">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {label}
      </label>
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
          disabled 
            ? 'text-gray-400' 
            : 'text-gray-500 group-focus-within:text-blue-500'
        }`} />
        <input 
          type={type}
          value={value} 
          onChange={onChange} 
          disabled={disabled} 
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 ${
            isDark 
              ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          } ${disabled && 'opacity-70 cursor-not-allowed'}`}
        />
      </div>
    </motion.div>
  );
};

export default Profile;