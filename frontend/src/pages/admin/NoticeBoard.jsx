import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClipboardList, Plus, Edit3, Trash2, Users, GraduationCap, 
    Globe, X, Calendar, AlertTriangle, Info, Megaphone, 
    Filter, Search, Clock, Eye, Share2, Pin, Bookmark,
    ChevronRight, MessageSquare, Download
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';
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
        title: '', 
        content: '', 
        category: 'General', 
        priority: 'Medium', 
        audience: 'Everyone',
        isPinned: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');

    useEffect(() => {
        loadNotices();
    }, [user]);

    const loadNotices = () => {
        const allNotices = storage.get('notices') || [];
        if (allNotices.length === 0) {
            const mockNotices = [
                { 
                    id: 1, 
                    title: 'Mid-term Exam Schedule', 
                    content: 'The mid-term exams will commence from the 20th of this month. All students are required to check their exam schedules on the portal.', 
                    category: 'Exam', 
                    priority: 'High', 
                    audience: 'Students', 
                    date: '2025-11-04',
                    isPinned: true,
                    views: 245,
                    author: 'Admin Office'
                },
                { 
                    id: 2, 
                    title: 'Annual Sports Day', 
                    content: 'The annual sports day will be held on the last Friday of this month. Various competitions and fun activities planned.', 
                    category: 'Event', 
                    priority: 'Medium', 
                    audience: 'Everyone', 
                    date: '2025-11-02',
                    isPinned: false,
                    views: 189,
                    author: 'Sports Committee'
                },
                { 
                    id: 3, 
                    title: 'Faculty Meeting', 
                    content: 'Important faculty meeting scheduled for this Wednesday. All teaching staff must attend.', 
                    category: 'General', 
                    priority: 'High', 
                    audience: 'Teachers', 
                    date: '2025-11-01',
                    isPinned: true,
                    views: 76,
                    author: 'Principal Office'
                },
            ];
            storage.set('notices', mockNotices);
            filterAndSetNotices(mockNotices);
        } else {
            filterAndSetNotices(allNotices);
        }
    };

    const filterAndSetNotices = (allNotices) => {
        let visibleNotices = [];
        if (!user) return;

        if (user.role === 'admin') {
            visibleNotices = allNotices;
        } else if (user.role === 'teacher') {
            visibleNotices = allNotices.filter(n => n.audience === 'Everyone' || n.audience === 'Teachers');
        } else if (user.role === 'student') {
            visibleNotices = allNotices.filter(n => n.audience === 'Everyone' || n.audience === 'Students');
        } else {
            visibleNotices = allNotices.filter(n => n.audience === 'Everyone');
        }
        
        let filtered = visibleNotices;
        
        if (searchTerm) {
            filtered = filtered.filter(notice => 
                notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notice.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterCategory !== 'All') {
            filtered = filtered.filter(notice => notice.category === filterCategory);
        }
        
        if (filterPriority !== 'All') {
            filtered = filtered.filter(notice => notice.priority === filterPriority);
        }
        
        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });
        
        setNotices(filtered);
        if (filtered.length > 0 && !selectedNotice) {
            setSelectedNotice(filtered[0]);
        }
    };

    useEffect(() => {
        filterAndSetNotices(storage.get('notices') || []);
    }, [searchTerm, filterCategory, filterPriority]);

    const canManageNotices = user?.role === 'admin' || user?.role === 'teacher';

    const handleOpenModal = (notice = null) => {
        if (notice) {
            setIsEditing(true);
            setSelectedNotice(notice);
            setFormData({ 
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const allNotices = storage.get('notices') || [];
        if (isEditing) {
            const updatedNotices = allNotices.map(n => 
                n.id === selectedNotice.id 
                    ? { ...n, ...formData } 
                    : n
            );
            storage.set('notices', updatedNotices);
        } else {
            const newNotice = { 
                id: Date.now(), 
                ...formData, 
                date: new Date().toISOString().split('T')[0],
                views: 0,
                author: user.name
            };
            storage.set('notices', [newNotice, ...allNotices]);
        }
        loadNotices();
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            const updatedNotices = (storage.get('notices') || []).filter(n => n.id !== id);
            storage.set('notices', updatedNotices);
            loadNotices();
        }
    };

    const handlePinNotice = (id) => {
        const allNotices = storage.get('notices') || [];
        const updatedNotices = allNotices.map(notice => 
            notice.id === id ? { ...notice, isPinned: !notice.isPinned } : notice
        );
        storage.set('notices', updatedNotices);
        loadNotices();
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': 
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Medium': 
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: 
                return 'bg-green-500/10 text-green-500 border-green-500/20';
        }
    };

    const getCategoryIcon = (category) => {
        switch(category) {
            case 'Exam': return <ClipboardList className="w-4 h-4" />;
            case 'Event': return <Calendar className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getAudienceIcon = (audience) => {
        switch(audience) {
            case 'Students': return <Users className="w-4 h-4" />;
            case 'Teachers': return <GraduationCap className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Notice Board
                            </h1>
                            <p className="text-gray-500">
                                {canManageNotices ? 'Manage announcements' : 'Stay updated'}
                            </p>
                        </div>
                        
                        {canManageNotices && (
                            <motion.button 
                                onClick={() => handleOpenModal()} 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                New Notice
                            </motion.button>
                        )}
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search notices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Categories</option>
                                <option value="General">General</option>
                                <option value="Exam">Exam</option>
                                <option value="Event">Event</option>
                            </select>

                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Notices List */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-[70vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">
                                        Notices ({notices.length})
                                    </h3>
                                    <Filter className="w-5 h-5 text-gray-400" />
                                </div>

                                <div className="space-y-3">
                                    {notices.map(notice => (
                                        <motion.div
                                            key={notice.id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => setSelectedNotice(notice)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                                                selectedNotice?.id === notice.id 
                                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                            } ${notice.isPinned ? 'ring-2 ring-yellow-400/30' : ''}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {notice.isPinned && (
                                                        <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                                        {notice.title}
                                                    </h4>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    notice.priority === 'High' ? 'bg-red-500' :
                                                    notice.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`} />
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(notice.date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {getAudienceIcon(notice.audience)}
                                                    {notice.audience}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    
                                    {notices.length === 0 && (
                                        <div className="text-center py-12">
                                            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-500">No notices found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notice Detail */}
                        <div className="xl:col-span-3">
                            {selectedNotice ? (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityStyle(selectedNotice.priority)}`}>
                                                    {getCategoryIcon(selectedNotice.category)}
                                                    {selectedNotice.category}
                                                </span>
                                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600">
                                                    {getAudienceIcon(selectedNotice.audience)}
                                                    {selectedNotice.audience}
                                                </span>
                                                {selectedNotice.isPinned && (
                                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-yellow-50 text-yellow-600">
                                                        <Pin className="w-4 h-4 fill-yellow-500" />
                                                        Pinned
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                                {selectedNotice.title}
                                            </h2>
                                            
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(selectedNotice.date).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </span>
                                                {selectedNotice.author && (
                                                    <span className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        By {selectedNotice.author}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    {selectedNotice.views} views
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {canManageNotices && (
                                            <div className="flex gap-2">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handlePinNotice(selectedNotice.id)}
                                                    className={`p-2 rounded-xl transition-colors ${
                                                        selectedNotice.isPinned
                                                            ? 'bg-yellow-50 text-yellow-600'
                                                            : 'hover:bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    <Pin className={`w-5 h-5 ${selectedNotice.isPinned ? 'fill-yellow-500' : ''}`} />
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleOpenModal(selectedNotice)}
                                                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(selectedNotice.id)}
                                                    className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="prose prose-lg max-w-none">
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {selectedNotice.content}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Select a Notice
                                    </h3>
                                    <p className="text-gray-500">
                                        Choose a notice from the list to view details
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {isEditing ? 'Edit Notice' : 'New Notice'}
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal}
                                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input 
                                            required 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})} 
                                            placeholder="Enter notice title"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content
                                        </label>
                                        <textarea 
                                            required 
                                            value={formData.content} 
                                            onChange={e => setFormData({...formData, content: e.target.value})} 
                                            placeholder="Enter notice content..."
                                            rows="5"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category
                                            </label>
                                            <select 
                                                value={formData.category} 
                                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="General">General</option>
                                                <option value="Exam">Exam</option>
                                                <option value="Event">Event</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Priority
                                            </label>
                                            <select 
                                                value={formData.priority} 
                                                onChange={e => setFormData({...formData, priority: e.target.value})} 
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Audience
                                            </label>
                                            <select 
                                                value={formData.audience} 
                                                onChange={e => setFormData({...formData, audience: e.target.value})} 
                                                disabled={user.role === 'teacher'}
                                                className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    user.role === 'teacher' ? 'opacity-70' : ''
                                                }`}
                                            >
                                                {user.role === 'admin' && (
                                                    <>
                                                        <option value="Everyone">Everyone</option>
                                                        <option value="Teachers">Teachers</option>
                                                    </>
                                                )}
                                                <option value="Students">Students</option>
                                            </select>
                                        </div>
                                    </div>

                                    {canManageNotices && (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="isPinned"
                                                checked={formData.isPinned}
                                                onChange={e => setFormData({...formData, isPinned: e.target.checked})}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
                                                Pin this notice
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal}
                                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
                                    >
                                        {isEditing ? 'Update' : 'Publish'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NoticeBoard;