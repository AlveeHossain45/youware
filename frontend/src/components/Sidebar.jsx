import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  Award,
  MessageSquare,
  BarChart3,
  LogOut,
  ClipboardList,
  Network,
  Plus,
  Edit3,
  Video
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isDark, currentTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { title: 'Manage Staff', icon: Briefcase, path: '/admin/staff' },
      { title: 'Manage Teachers', icon: GraduationCap, path: '/admin/teachers' },
      { title: 'Manage Students', icon: Users, path: '/admin/students' },
      { title: 'Academic Structure', icon: Network, path: '/admin/academic-structure' },
      { title: 'Notice Board', icon: ClipboardList, path: '/admin/noticeboard' },
      { title: 'Classes', icon: BookOpen, path: '/admin/classes' },
      { title: 'Exams', icon: FileText, path: '/admin/exams' },
      { title: 'Attendance', icon: Calendar, path: '/admin/attendance' },
      { title: 'Finance', icon: DollarSign, path: '/admin/finance' },
      { title: 'Settings', icon: Settings, path: '/admin/settings' }
    ],
    teacher: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
      { title: 'My Classes', icon: GraduationCap, path: '/teacher/classes' },
      { title: 'Create Exam', icon: Plus, path: '/teacher/exams' },
      { title: 'Assignments', icon: Edit3, path: '/teacher/assignments' },
      { title: 'Mark Attendance', icon: Calendar, path: '/teacher/mark-attendance' },
      { title: 'Online Classes', icon: Video, path: '/teacher/online-classes' },
      { title: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
      { title: 'Notice Board', icon: ClipboardList, path: '/teacher/noticeboard' },
    ],
    student: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
      { title: 'Notice Board', icon: ClipboardList, path: '/student/noticeboard' },
      { title: 'My Classes', icon: GraduationCap, path: '/student/classes' },
      { title: 'Exams', icon: FileText, path: '/student/exams' },
      { title: 'Assignments', icon: Edit3, path: '/student/assignments' },
      { title: 'My Finances', icon: DollarSign, path: '/student/finance' },
      { title: 'Attendance', icon: Calendar, path: '/student/attendance' },
      { title: 'Results', icon: Award, path: '/student/results' },
      { title: 'Online Classes', icon: Video, path: '/student/online-classes' },
      { title: 'Messages', icon: MessageSquare, path: '/student/messages' }
    ],
    accountant: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/accountant/dashboard' },
      { title: 'Fee Management', icon: DollarSign, path: '/accountant/payments' },
      { title: 'Invoices', icon: FileText, path: '/accountant/invoices' },
      { title: 'Reports', icon: BarChart3, path: '/accountant/reports' },
      { title: 'Settings', icon: Settings, path: '/accountant/settings' }
    ]
  };

  const currentMenuItems = menuItems[user?.role] || [];
  
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: -300, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className={`fixed top-16 left-0 bottom-0 w-72 ${isDark ? 'glass-card-dark' : 'glass-card-light'} border-r z-50 flex flex-col`}
      >
        <div className="flex-1 p-4 overflow-y-auto">
          {/* User Info */}
          <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-100/50'}`}>
            <div className="flex items-center gap-3">
              <img src={user?.avatar} alt={user?.name} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{user?.role}</p>
              </div>
            </div>
          </div>
          {/* Navigation Menu */}
          <nav className="space-y-1">
            {currentMenuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                        ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg` 
                        : isDark 
                            ? 'text-gray-300 hover:bg-gray-800/60' 
                            : 'text-gray-600 hover:bg-gray-200/50'
                }`}>
                    <Icon className={`w-5 h-5 transition-colors duration-200 ${
                        isActive 
                            ? 'text-white' 
                            : isDark 
                                ? 'text-gray-400 group-hover:text-gray-200' 
                                : 'text-gray-500 group-hover:text-gray-800'
                    }`} />
                    <p className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                      {item.title}
                    </p>
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Logout Button */}
        <div className="p-4">
          <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-red-900/20' : 'bg-gray-100 hover:bg-red-50'} text-red-500 transition-colors duration-200`}>
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;