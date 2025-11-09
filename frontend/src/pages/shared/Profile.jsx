import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Award, BookOpen, Edit3, Camera,
  Shield, CheckCircle, AlertCircle, Upload, X, Save
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axios'; // Import apiClient

const Profile = () => {
  const { isDark, currentTheme } = useTheme();
  const { user, updateUserContext } = useAuth(); // Get updateUserContext from AuthContext
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', address: '', bio: '', 
    education: '', experience: '', avatar: ''
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
        experience: user.experience || '', avatar: user.avatar || ''
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
      const response = await apiClient.put(`/users/${user.id}`, profileData);
      updateUserContext(response.data); // Update context immediately
      setSaveStatus({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        setSaveStatus({ message: '', type: 'idle' });
        setIsEditing(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus({ message: 'Error updating profile', type: 'error' });
      setTimeout(() => setSaveStatus({ message: '', type: 'idle' }), 3000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || '', email: user.email || '', phone: user.phone || '',
        address: user.address || '', bio: user.bio || '', education: user.education || '',
        experience: user.experience || '', avatar: user.avatar || ''
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
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setSaveStatus({ message: 'Image size must be less than 5MB', type: 'error' });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, avatar: reader.result }));
      setUploading(false);
      setShowAvatarModal(false);
      setSaveStatus({ message: 'Avatar updated. Click "Save Changes".', type: 'info' });
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => fileInputRef.current?.click();

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8">
          {/* Header & Save Status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <AnimatePresence>
                {saveStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                      saveStatus.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                      saveStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {saveStatus.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                    {saveStatus.message}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  isEditing ? (isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800')
                  : `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg hover:shadow-xl`
                }`}
              >
                {isEditing ? <X size={20}/> : <Edit3 size={20}/>}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card */}
            <div className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg self-start`}>
                <div className="relative mx-auto w-32 h-32 group">
                    <img src={profileData.avatar} alt={profileData.name} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"/>
                    {isEditing && (
                        <button onClick={() => setShowAvatarModal(true)} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white"/>
                        </button>
                    )}
                </div>
                <div className="text-center mt-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
            </div>

            {/* Right Column: Details Form */}
            <div className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form fields */}
                    <InputField label="Full Name" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} disabled={!isEditing} icon={User} />
                    <InputField label="Email Address" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} icon={Mail} />
                    <InputField label="Phone" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditing} icon={Phone} placeholder="Not set" />
                    <InputField label="Address" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} disabled={!isEditing} icon={MapPin} placeholder="Not set" />
                    <InputField label="Education" value={profileData.education} onChange={e => setProfileData({...profileData, education: e.target.value})} disabled={!isEditing} icon={BookOpen} placeholder="Not set" />
                    <InputField label="Experience" value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} disabled={!isEditing} icon={Award} placeholder="Not set" />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} disabled={!isEditing} rows="4" placeholder="Not set" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'} ${!isEditing && 'opacity-70'}`}></textarea>
                    </div>
                </div>
                {isEditing && (
                    <div className="mt-6 flex justify-end">
                        <motion.button onClick={handleSave} whileHover={{ scale: 1.05 }} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg flex items-center gap-2`}>
                            <Save size={20}/> Save Changes
                        </motion.button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Avatar Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className={`w-full max-w-md p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'}`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Update Profile Picture</h3><button onClick={() => setShowAvatarModal(false)}><X/></button></div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden"/>
              <button onClick={triggerFileInput} disabled={uploading} className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl hover:bg-gray-500/10 transition-colors">
                {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div> : <><Upload size={48} className="text-gray-400 mb-4"/> <p>Click to upload or drag & drop</p><p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p></>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, disabled, icon: Icon, placeholder = '' }) => {
  const { isDark } = useTheme();
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'} ${disabled && 'opacity-70 cursor-not-allowed'}`} />
      </div>
    </div>
  );
};

export default Profile;