import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Shield, Users, BookOpen, GraduationCap, ArrowLeft, Sparkles, Eye, EyeOff } from 'lucide-react'; // <-- Eye এবং EyeOff আইকন ইম্পোর্ট করা হয়েছে
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { isDark, currentTheme } = useTheme();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- নতুন স্টেট যোগ করা হয়েছে

  const portals = [
    { id: 'admin', title: 'Admin', icon: Shield, color: 'from-red-500 to-pink-500', bgColor: 'from-red-500/10 to-pink-500/10', description: 'Full system access and management', email: 'admin@eduversepro.com', password: 'admin123' },
    { id: 'teacher', title: 'Teacher', icon: Users, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-500/10 to-cyan-500/10', description: 'Manage courses and students', email: 'teacher@eduversepro.com', password: 'teacher123' },
    { id: 'student', title: 'Student', icon: BookOpen, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-500/10 to-emerald-500/10', description: 'Access learning materials', email: 'student@eduversepro.com', password: 'student123' },
    { id: 'accountant', title: 'Accountant', icon: GraduationCap, color: 'from-purple-500 to-indigo-500', bgColor: 'from-purple-500/10 to-indigo-500/10', description: 'Financial management system', email: 'accountant@eduversepro.com', password: 'accountant123' }
  ];

  const handlePortalSelect = (portal) => {
    setSelectedPortal(portal);
    setFormData({ email: portal.email, password: portal.password });
    setError('');
  };

  const handleBackToPortals = () => {
    setSelectedPortal(null);
    setFormData({ email: '', password: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (result.user.role === selectedPortal.id) {
          navigate(`/${result.user.role}/dashboard`, { replace: true });
        } else {
          setError(`Access Denied. Your credentials are for the '${result.user.role}' portal.`);
          logout();
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }, exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.4 } } };
  const formVariants = { hidden: { opacity: 0, scale: 0.8, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, duration: 0.6 } }, exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.4 } } };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} p-4`}>
      <div className={`w-full max-w-4xl rounded-3xl backdrop-blur-xl border-2 ${isDark ? 'glass-card-dark border-gray-700/40 bg-gray-900/60' : 'glass-card-light border-white/30 bg-white/70'} shadow-super-premium overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <motion.div animate={{ x: [0, 50, 0], y: [0, -25, 0], scale: [1, 1.05, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-2xl" />
          <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-2xl" />
        </div>
        <div className="relative p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-4 sm:mb-6">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-2 sm:mb-3"><Logo size="lg" /></motion.div>
            <motion.h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3`}>Welcome to <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">EduVersePro</span></motion.h1>
            <AnimatePresence mode="wait">
              {!selectedPortal ? (
                <motion.p key="choose-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose your portal to continue</motion.p>
              ) : (
                <motion.p key="login-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to <span className="font-semibold">{selectedPortal.title}</span> Portal</motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="relative min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!selectedPortal ? (
                <motion.div key="portals-grid" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
                  {portals.map((portal) => {
                    const IconComponent = portal.icon;
                    return (
                      <motion.button key={portal.id} variants={itemVariants} onClick={() => handlePortalSelect(portal)} whileHover={{ scale: 1.05, y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }} whileTap={{ scale: 0.98 }} className={`p-4 rounded-2xl backdrop-blur-lg border-2 text-center transition-all duration-300 group relative overflow-hidden ${isDark ? 'glass-card-dark border-gray-700/40 bg-gray-800/40 hover:border-gray-600/50' : 'glass-card-light border-white/20 bg-white/50 hover:border-white/40'} shadow-lg hover:shadow-xl h-24 sm:h-28 flex flex-col items-center justify-center`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${portal.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className="relative z-10 flex flex-col items-center justify-center gap-2 w-full">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${portal.color} group-hover:scale-110 transition-transform duration-300`}><IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
                          <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-1 w-full`}>{portal.title}</h3>
                        </div>
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">{[...Array(2)].map((_, i) => (<motion.div key={i} className={`absolute rounded-full ${isDark ? 'bg-white/10' : 'bg-white/30'}`} style={{ width: Math.random() * 6 + 3, height: Math.random() * 6 + 3, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }} transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }} />))}</div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div key="login-form" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-sm mx-auto">
                  <div className={`relative p-6 rounded-3xl backdrop-blur-xl border-2 ${isDark ? 'glass-card-dark border-gray-700/40 bg-gray-800/40' : 'glass-card-light border-white/20 bg-white/50'} shadow-xl`}>
                    <motion.button onClick={handleBackToPortals} whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.98 }} className={`flex items-center gap-2 mb-6 p-2 rounded-xl transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'}`}><ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span></motion.button>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 mb-6">
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${selectedPortal.color} shadow-lg`}><selectedPortal.icon className="w-6 h-6 text-white" /></div>
                      <div><h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{selectedPortal.title}</h2><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to continue</p></div>
                    </motion.div>
                    <AnimatePresence>{error && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-900/30 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}><Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" /><p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p></motion.div>)}</AnimatePresence>
                    <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      <div><label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email</label><motion.div whileFocus={{ scale: 1.01 }} className="relative"><Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /><input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-3 rounded-xl transition-all duration-200 text-sm ${isDark ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30' : 'bg-white/70 border border-gray-200/50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30'} focus:shadow-lg`} required /></motion.div></div>
                      
                      {/* --- পাসওয়ার্ড ফিল্ডে পরিবর্তন আনা হয়েছে --- */}
                      <div>
                        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Password
                        </label>
                        <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-10 py-3 rounded-xl transition-all duration-200 text-sm ${isDark ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30' : 'bg-white/70 border border-gray-200/50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30'} focus:shadow-lg`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-200"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </motion.div>
                      </div>

                      <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r ${selectedPortal.color} shadow-lg hover:shadow-xl transform transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center gap-2 relative overflow-hidden group text-base`}><div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-600" />{loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing in...</span></>) : (<><LogIn className="w-4 h-4" /><span>Access Portal</span></>)}</motion.button>
                    </motion.form>
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`mt-4 p-3 rounded-xl text-center ${isDark ? 'bg-gray-700/30 border border-gray-600/30' : 'bg-gray-100/50 border border-gray-200/30'}`}><p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span className="font-semibold">Demo:</span> Credentials auto-filled</p></motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;