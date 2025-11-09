import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Edit3, 
    Calendar, 
    CheckCircle, 
    FileText, 
    Search, 
    Plus, 
    X, 
    Trash2, 
    Users,
    AlertCircle,
    Clock,
    BookOpen
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';

const Assignments = () => {
    const { isDark, currentTheme } = useTheme();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        classId: '', 
        dueDate: '', 
        points: 100,
        instructions: '',
        attachments: []
    });
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        filterAssignments();
    }, [assignments, searchTerm, activeFilter]);

    const loadData = () => {
        setLoading(true);
        setTimeout(() => {
            const assignmentsData = storage.get('assignments') || [];
            const classesData = storage.get('classes') || [];
            const myClasses = classesData.filter(c => c.teacherId === user.id);
            setTeacherClasses(myClasses);
            const myClassIds = myClasses.map(c => c.id);
            
            const relevantAssignments = user.role === 'teacher' 
                ? assignmentsData.filter(a => myClassIds.includes(a.classId))
                : assignmentsData.filter(a => a.classId === user.classId);

            setAssignments(relevantAssignments);
            setLoading(false);
        }, 500);
    };

    const filterAssignments = () => {
        let filtered = assignments.filter(a => 
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply status filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(assignment => {
                if (activeFilter === 'upcoming') {
                    return new Date(assignment.dueDate) > new Date();
                }
                if (activeFilter === 'past') {
                    return new Date(assignment.dueDate) < new Date();
                }
                return assignment.status === activeFilter;
            });
        }

        setFilteredAssignments(filtered);
    };

    const getAssignmentStatus = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const timeDiff = due.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff < 0) return { status: 'overdue', color: 'text-red-500', bg: 'bg-red-500/10', label: 'Overdue' };
        if (daysDiff === 0) return { status: 'due-today', color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Due Today' };
        if (daysDiff <= 3) return { status: 'due-soon', color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Due Soon' };
        return { status: 'upcoming', color: 'text-green-500', bg: 'bg-green-500/10', label: 'Upcoming' };
    };

    const getClassName = (classId) => {
        const classObj = teacherClasses.find(c => c.id === classId);
        return classObj ? classObj.name : 'Unknown Class';
    };

    const handleOpenModal = (assignment = null) => {
        if (assignment) {
            setIsEditing(true);
            setSelectedAssignment(assignment);
            setFormData({ ...assignment });
        } else {
            setIsEditing(false);
            setSelectedAssignment(null);
            setFormData({ 
                title: '', 
                description: '', 
                classId: teacherClasses[0]?.id || '', 
                dueDate: '', 
                points: 100, 
                instructions: '',
                attachments: []
            });
        }
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const allAssignments = storage.get('assignments') || [];
        
        if (isEditing) {
            const updated = allAssignments.map(a => 
                a.id === selectedAssignment.id 
                    ? { ...a, ...formData, updatedAt: new Date().toISOString() } 
                    : a
            );
            storage.set('assignments', updated);
        } else {
            const newAssignment = { 
                id: Date.now(), 
                ...formData, 
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                submissions: []
            };
            storage.set('assignments', [newAssignment, ...allAssignments]);
        }
        
        loadData();
        setShowModal(false);
    };
    
    const handleDelete = (id) => {
        if(window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            const updated = (storage.get('assignments') || []).filter(a => a.id !== id);
            storage.set('assignments', updated);
            loadData();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg} flex items-center justify-center`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading assignments...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Header Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row lg:items-center justify-between mb-8"
                    >
                        <div className="mb-6 lg:mb-0">
                            <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.text} bg-clip-text text-transparent mb-2`}>
                                Assignments
                            </h1>
                            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {user.role === 'teacher' ? 'Create and manage assignments' : 'Track and submit your assignments'}
                            </p>
                        </div>
                        
                        {user?.role === 'teacher' && (
                            <motion.button 
                                onClick={() => handleOpenModal()} 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group`}
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                Create Assignment
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Search and Filter Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                            <div className={`flex-1 relative ${isDark ? 'glass-card-dark' : 'glass-card-light'} rounded-2xl p-1`}>
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search assignments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none ${
                                        isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                                    }`}
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-2 overflow-x-auto">
                                {['all', 'upcoming', 'past'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                                            activeFilter === filter
                                                ? `text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg`
                                                : isDark 
                                                    ? 'text-gray-300 bg-gray-800 hover:bg-gray-700' 
                                                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Assignments Grid */}
                    <AnimatePresence>
                        {filteredAssignments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <BookOpen className={`w-24 h-24 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    No assignments found
                                </h3>
                                <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {searchTerm || activeFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria' 
                                        : user.role === 'teacher' 
                                            ? 'Create your first assignment to get started' 
                                            : 'No assignments have been assigned yet'
                                    }
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                            >
                                {filteredAssignments.map((assignment) => {
                                    const status = getAssignmentStatus(assignment.dueDate);
                                    const className = getClassName(assignment.classId);
                                    
                                    return (
                                        <motion.div
                                            key={assignment.id}
                                            variants={itemVariants}
                                            layout
                                            className={`group relative p-6 rounded-3xl ${
                                                isDark ? 'glass-card-dark' : 'glass-card-light'
                                            } border-2 border-transparent hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl`}
                                        >
                                            {/* Status Badge */}
                                            <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </div>

                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentTheme.primary} bg-opacity-10`}>
                                                        <FileText className={`w-6 h-6 ${currentTheme.text}`} />
                                                    </div>
                                                    <div>
                                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {className}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {user.role === 'teacher' && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button 
                                                            onClick={() => handleOpenModal(assignment)}
                                                            className={`p-2 rounded-xl ${
                                                                isDark 
                                                                    ? 'hover:bg-gray-700 text-gray-300' 
                                                                    : 'hover:bg-gray-200 text-gray-600'
                                                            } transition-colors duration-200`}
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(assignment.id)}
                                                            className={`p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors duration-200`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <h3 className={`font-bold text-xl mb-3 ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                                                {assignment.title}
                                            </h3>
                                            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-3`}>
                                                {assignment.description}
                                            </p>

                                            {/* Metadata */}
                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-gray-400" />
                                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                                        {assignment.points} Points
                                                    </span>
                                                </div>
                                                {user.role === 'teacher' && assignment.submissions && (
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                                            {assignment.submissions.length} Submissions
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl transition-all duration-300`}
                                            >
                                                {user.role === 'student' ? 'Submit Assignment' : 'View Submissions'}
                                            </motion.button>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Create/Edit Assignment Modal */}
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
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <form onSubmit={handleSubmit} className={`w-full p-8 rounded-3xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-2xl`}>
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
                                        </h3>
                                        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {isEditing ? 'Update assignment details' : 'Fill in the assignment information'}
                                        </p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className={`p-2 rounded-xl ${
                                            isDark 
                                                ? 'hover:bg-gray-700 text-gray-300' 
                                                : 'hover:bg-gray-200 text-gray-600'
                                        } transition-colors duration-200`}
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Assignment Title *
                                        </label>
                                        <input 
                                            required 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})} 
                                            placeholder="Enter assignment title"
                                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                isDark 
                                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Description *
                                        </label>
                                        <textarea 
                                            required 
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})} 
                                            placeholder="Describe the assignment requirements..."
                                            rows="4"
                                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                isDark 
                                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none`}
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Class *
                                            </label>
                                            <select 
                                                required 
                                                value={formData.classId} 
                                                onChange={e => setFormData({...formData, classId: e.target.value})} 
                                                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                    isDark 
                                                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                                                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                            >
                                                <option value="">Select a class</option>
                                                {teacherClasses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Due Date *
                                            </label>
                                            <input 
                                                required 
                                                type="date" 
                                                value={formData.dueDate} 
                                                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                                                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                    isDark 
                                                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                                                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Points *
                                        </label>
                                        <input 
                                            required 
                                            type="number" 
                                            min="1"
                                            max="1000"
                                            value={formData.points} 
                                            onChange={e => setFormData({...formData, points: parseInt(e.target.value) || 0})} 
                                            placeholder="Enter points (1-1000)"
                                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                isDark 
                                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className={`flex-1 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                                            isDark 
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className={`flex-1 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl transition-all duration-300`}
                                    >
                                        {isEditing ? 'Save Changes' : 'Create Assignment'}
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

export default Assignments;