// src/pages/admin/NoticeBoard.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClipboardList, Plus, Edit3, Trash2, Users, GraduationCap, 
    Globe, X, Calendar, AlertTriangle, Info, Megaphone, 
    Filter, Search, Clock, Eye, Pin, Bookmark, Share2,
    MoreVertical, CheckCircle, Sparkles
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const NoticeBoard = () => {
    const { isDark, currentTheme } = useTheme();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        title: '', content: '', category: 'General', priority: 'Medium', audience: 'Everyone', isPinned: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        loadNotices();
    }, [user]);

    const loadNotices = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/notices');
            const sortedNotices = response.data.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setNotices(sortedNotices);
            if (sortedNotices.length > 0 && !selectedNotice) {
                setSelectedNotice(sortedNotices[0]);
            }
        } catch (error) {
            console.error("Failed to load notices:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const filteredNotices = notices.filter(notice => {
        const termMatch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = filterCategory === 'All' || notice.category === filterCategory;
        return termMatch && categoryMatch;
    });

    const canManageNotices = user?.role === 'admin' || user?.role === 'teacher';

    const handleOpenModal = (notice = null) => {
        if (notice) {
            setIsEditing(true);
            setFormData({ 
                id: notice.id,
                title: notice.title, 
                content: notice.content, 
                category: notice.category, 
                priority: notice.priority, 
                audience: notice.audience, 
                isPinned: notice.isPinned || false
            });
        } else {
            setIsEditing(false);
            setFormData({ 
                title: '', 
                content: '', 
                category: 'General', 
                priority: 'Medium', 
                audience: user.role === 'teacher' ? 'Students' : 'Everyone', 
                isPinned: false
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/notices/${formData.id}`, formData);
            } else {
                await apiClient.post('/notices', formData);
            }
            await loadNotices();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save notice:', error);
            alert('Could not save notice.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            try {
                await apiClient.delete(`/notices/${id}`);
                await loadNotices();
                if (selectedNotice?.id === id) {
                    setSelectedNotice(filteredNotices[0] || null);
                }
            } catch (error) {
                console.error('Failed to delete notice:', error);
            }
        }
    };

    const handlePinNotice = async (notice) => {
        try {
            await apiClient.put(`/notices/${notice.id}`, { ...notice, isPinned: !notice.isPinned });
            await loadNotices();
        } catch (error) {
            console.error('Failed to pin notice:', error);
        }
    };

    const getPriorityStyle = (priority) => {
        const baseStyle = "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium";
        if (isDark) {
            switch (priority) {
                case 'High': return `${baseStyle} bg-red-500/20 text-red-300 border border-red-500/30`;
                case 'Medium': return `${baseStyle} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
                case 'Low': return `${baseStyle} bg-green-500/20 text-green-300 border border-green-500/30`;
                default: return `${baseStyle} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
            }
        } else {
            switch (priority) {
                case 'High': return `${baseStyle} bg-red-100 text-red-700 border border-red-200`;
                case 'Medium': return `${baseStyle} bg-yellow-100 text-yellow-700 border border-yellow-200`;
                case 'Low': return `${baseStyle} bg-green-100 text-green-700 border border-green-200`;
                default: return `${baseStyle} bg-blue-100 text-blue-700 border border-blue-200`;
            }
        }
    };

    const getCategoryIcon = (category) => {
        const iconClass = "w-4 h-4";
        switch (category) {
            case 'Exam': return <GraduationCap className={iconClass} />;
            case 'Event': return <Calendar className={iconClass} />;
            case 'Alert': return <AlertTriangle className={iconClass} />;
            case 'Info': return <Info className={iconClass} />;
            default: return <Megaphone className={iconClass} />;
        }
    };

    const getAudienceIcon = (audience) => {
        const iconClass = "w-4 h-4";
        switch (audience) {
            case 'Teachers': return <Users className={iconClass} />;
            case 'Students': return <GraduationCap className={iconClass} />;
            default: return <Globe className={iconClass} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const NoticeCard = ({ notice, compact = false }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedNotice(notice)}
            className={`p-4 rounded-2xl cursor-pointer transition-all border-2 backdrop-blur-sm
                ${selectedNotice?.id === notice.id 
                    ? `border-blue-500 shadow-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} ring-2 ring-blue-500/20`
                    : `border-transparent ${isDark ? 'bg-gray-800/60 hover:bg-gray-700/60' : 'bg-white/80 hover:bg-gray-50/90'} shadow-sm hover:shadow-md`
                }
                ${notice.isPinned ? 'ring-2 ring-yellow-400/50 shadow-lg' : ''}
            `}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {notice.isPinned && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1"
                        >
                            <Pin className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </motion.div>
                    )}
                    <span className={`${getPriorityStyle(notice.priority)} text-xs`}>
                        {getCategoryIcon(notice.category)}
                        {notice.priority}
                    </span>
                </div>
                {canManageNotices && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handlePinNotice(notice); }}
                            className={`p-1 rounded-lg ${notice.isPinned ? 'text-yellow-500' : 'text-gray-400'}`}
                        >
                            <Pin className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <h4 className={`font-semibold text-sm mb-2 line-clamp-2 leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
                {notice.title}
            </h4>

            {!compact && (
                <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    {notice.content}
                </p>
            )}

            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(notice.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                        {getAudienceIcon(notice.audience)}
                        {notice.audience}
                    </span>
                </div>
                {notice.isPinned && (
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                )}
            </div>
        </motion.div>
    );

    return (
        <div className={`min-h-screen transition-all duration-500 ${
            isDark 
                ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black' 
                : 'bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50'
        }`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className={`pt-20 transition-all duration-500 ${
                sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
            }`}>
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Enhanced Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8"
                    >
                        <div className="mb-6 lg:mb-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-3 rounded-2xl ${
                                    isDark 
                                        ? 'bg-blue-500/20 text-blue-300' 
                                        : 'bg-blue-100 text-blue-600'
                                }`}>
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
                                    Notice Board
                                </h1>
                            </div>
                            <p className={`text-lg ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {canManageNotices ? 'Manage announcements & updates' : 'Stay updated with latest information'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* View Toggle */}
                            <div className={`flex rounded-2xl p-1 ${
                                isDark ? 'bg-gray-800' : 'bg-white shadow-sm'
                            }`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        viewMode === 'grid'
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        viewMode === 'list'
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    List
                                </button>
                            </div>

                            {canManageNotices && (
                                <motion.button 
                                    onClick={() => handleOpenModal()} 
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Plus className="w-5 h-5 relative z-10" />
                                    <span className="relative z-10">New Notice</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Enhanced Search and Filter */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col lg:flex-row gap-4 mb-8"
                    >
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search notices by title or content..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border transition-all ${
                                    isDark 
                                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400' 
                                        : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'
                                } backdrop-blur-sm`}
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value)} 
                                className={`px-4 py-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border transition-all ${
                                    isDark 
                                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                                        : 'bg-white/80 border-gray-200 text-gray-900'
                                } backdrop-blur-sm`}
                            >
                                <option value="All">All Categories</option>
                                <option value="General">General</option>
                                <option value="Exam">Exam</option>
                                <option value="Event">Event</option>
                                <option value="Alert">Alert</option>
                                <option value="Info">Information</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Notices List */}
                        <div className="xl:col-span-1">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`rounded-3xl shadow-xl border p-6 h-[70vh] overflow-hidden backdrop-blur-sm ${
                                    isDark 
                                        ? 'bg-gray-900/30 border-gray-700/50' 
                                        : 'bg-white/80 border-gray-200/50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={`font-bold text-lg ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        Notices ({filteredNotices.length})
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Pin className="w-4 h-4 text-yellow-500" />
                                        <span>Pinned</span>
                                    </div>
                                </div>
                                
                                <div className="h-[calc(100%-80px)] overflow-y-auto custom-scrollbar">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : filteredNotices.length > 0 ? (
                                        <div className="space-y-3">
                                            {filteredNotices.map(notice => (
                                                <NoticeCard 
                                                    key={notice.id} 
                                                    notice={notice} 
                                                    compact={viewMode === 'list'}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-500 mb-2">No notices found</p>
                                            <p className="text-sm text-gray-400">
                                                {searchTerm || filterCategory !== 'All' 
                                                    ? 'Try adjusting your search or filter' 
                                                    : 'Create your first notice to get started'
                                                }
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Notice Detail */}
                        <div className="xl:col-span-3">
                            <motion.div
                                key={selectedNotice?.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {selectedNotice ? (
                                    <div className={`rounded-3xl shadow-xl border p-8 backdrop-blur-sm ${
                                        isDark 
                                            ? 'bg-gray-900/30 border-gray-700/50' 
                                            : 'bg-white/80 border-gray-200/50'
                                    }`}>
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                                    <span className={getPriorityStyle(selectedNotice.priority)}>
                                                        {getCategoryIcon(selectedNotice.category)}
                                                        {selectedNotice.category}
                                                    </span>
                                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                        isDark 
                                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                                                    }`}>
                                                        {getAudienceIcon(selectedNotice.audience)}
                                                        {selectedNotice.audience}
                                                    </span>
                                                    {selectedNotice.isPinned && (
                                                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                            isDark 
                                                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                                                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                        }`}>
                                                            <Pin className="w-4 h-4 fill-yellow-500" />
                                                            Pinned
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h2 className={`text-3xl font-bold mb-4 leading-tight ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {selectedNotice.title}
                                                </h2>
                                                
                                                <div className="flex items-center gap-6 text-sm flex-wrap">
                                                    <span className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                                                        isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {selectedNotice.author && (
                                                        <span className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                                                            isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <Users className="w-4 h-4" />
                                                            By {selectedNotice.author.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {canManageNotices && (
                                                <div className="flex gap-2 ml-4">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }} 
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handlePinNotice(selectedNotice)} 
                                                        className={`p-3 rounded-xl transition-all ${
                                                            selectedNotice.isPinned 
                                                                ? 'bg-yellow-500/20 text-yellow-500 shadow-lg' 
                                                                : isDark 
                                                                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' 
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <Pin className={`w-5 h-5 ${selectedNotice.isPinned ? 'fill-yellow-500' : ''}`} />
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }} 
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleOpenModal(selectedNotice)} 
                                                        className={`p-3 rounded-xl transition-all ${
                                                            isDark 
                                                                ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <Edit3 className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }} 
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDelete(selectedNotice.id)} 
                                                        className="p-3 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`prose prose-lg max-w-none mt-8 leading-relaxed whitespace-pre-line ${
                                            isDark 
                                                ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white' 
                                                : 'prose-headings:text-gray-900 prose-p:text-gray-700'
                                        }`}>
                                            {selectedNotice.content}
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`rounded-3xl shadow-xl border p-16 text-center backdrop-blur-sm ${
                                            isDark 
                                                ? 'bg-gray-900/30 border-gray-700/50' 
                                                : 'bg-white/80 border-gray-200/50'
                                        }`}
                                    >
                                        <ClipboardList className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                                        <h3 className={`text-2xl font-bold mb-3 ${
                                            isDark ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Select a Notice
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Choose a notice from the list to view its details
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Enhanced Modal */}
            <AnimatePresence>
                {showModal && (
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
                            className="w-full max-w-2xl"
                        >
                            <form onSubmit={handleSubmit} className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm ${
                                isDark 
                                    ? 'bg-gray-900/95 border border-gray-700/50' 
                                    : 'bg-white/95 border border-gray-200/50'
                            }`}>
                                {/* Modal Header */}
                                <div className={`p-8 border-b ${
                                    isDark ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className={`text-2xl font-bold ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {isEditing ? 'Edit Notice' : 'Create New Notice'}
                                            </h3>
                                            <p className={`mt-1 ${
                                                isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {isEditing ? 'Update the notice details' : 'Share important information with your audience'}
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleCloseModal}
                                            className={`p-2 rounded-xl transition-all ${
                                                isDark 
                                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                                                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Title
                                        </label>
                                        <input 
                                            required 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})} 
                                            placeholder="Enter notice title..." 
                                            className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border transition-all ${
                                                isDark 
                                                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Content
                                        </label>
                                        <textarea 
                                            required 
                                            value={formData.content} 
                                            onChange={e => setFormData({...formData, content: e.target.value})} 
                                            placeholder="Write your notice content here..." 
                                            rows="6" 
                                            className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border resize-none transition-all ${
                                                isDark 
                                                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                            }`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Category
                                            </label>
                                            <select 
                                                value={formData.category} 
                                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                                className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border transition-all ${
                                                    isDark 
                                                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            >
                                                <option value="General">General</option>
                                                <option value="Exam">Exam</option>
                                                <option value="Event">Event</option>
                                                <option value="Alert">Alert</option>
                                                <option value="Info">Information</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Priority
                                            </label>
                                            <select 
                                                value={formData.priority} 
                                                onChange={e => setFormData({...formData, priority: e.target.value})} 
                                                className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border transition-all ${
                                                    isDark 
                                                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                isDark ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Audience
                                            </label>
                                            <select 
                                                value={formData.audience} 
                                                onChange={e => setFormData({...formData, audience: e.target.value})} 
                                                disabled={user.role === 'teacher'} 
                                                className={`w-full p-4 rounded-2xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 border transition-all ${
                                                    isDark 
                                                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                } ${user.role === 'teacher' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {user.role === 'admin' && (
                                                    <>
                                                        <option value="Everyone">Everyone</option>
                                                        <option value="Teachers">Teachers Only</option>
                                                    </>
                                                )}
                                                <option value="Students">Students Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-3 p-4 rounded-2xl ${
                                        isDark ? 'bg-gray-800/30' : 'bg-gray-50'
                                    }`}>
                                        <input 
                                            type="checkbox" 
                                            id="isPinned" 
                                            checked={formData.isPinned} 
                                            onChange={e => setFormData({...formData, isPinned: e.target.checked})} 
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isPinned" className={`text-sm font-medium ${
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Pin this notice to top
                                        </label>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className={`p-8 border-t ${
                                    isDark ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    <div className="flex gap-4">
                                        <motion.button 
                                            type="button" 
                                            onClick={handleCloseModal}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex-1 py-4 rounded-2xl font-semibold border transition-all ${
                                                isDark 
                                                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                                                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button 
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {isEditing ? 'Update Notice' : 'Publish Notice'}
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDark ? '#4B5563' : '#9CA3AF'};
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? '#6B7280' : '#6B7280'};
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default NoticeBoard;