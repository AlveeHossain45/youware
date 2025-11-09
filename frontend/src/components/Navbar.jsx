import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Settings, LogOut, Menu, X, Sun, Moon, User
} from 'lucide-react'; // Bell এবং ChevronDown আইকন সরানো হয়েছে
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// useOnClickOutside hook টি অপরিবর্তিত থাকবে
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { isDark, toggleDarkMode } = useTheme(); // অপ্রয়োজনীয় থিম ভেরিয়েবল সরানো হয়েছে
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const profileMenuRef = useRef(null);
  useOnClickOutside(profileMenuRef, () => openMenu === 'profile' && setOpenMenu(null));

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'glass-card-dark' : 'glass-card-light'} border-b`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'} transition-colors`}
            >
              {sidebarOpen ? <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} /> : <Menu className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />}
            </button>
            <Link to={`/${user?.role}/dashboard`} className="flex items-center">
              <Logo size="small" />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search anything..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-11 pr-4 py-2 rounded-xl ${isDark ? 'input-glass-dark focus:border-blue-500/50' : 'input-glass focus:border-blue-500/50'}`} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'} transition-colors`}>
              {isDark ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            
            {/* Notifications Button - এই অংশটি সম্পূর্ণ মুছে ফেলা হয়েছে */}
            
            {/* Profile Link */}
            <Link to={`/${user?.role}/profile`} className={`flex items-center gap-2 px-2 py-1 rounded-full ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'} transition-colors`}>
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{user?.name}</p>
                <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{user?.role}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;