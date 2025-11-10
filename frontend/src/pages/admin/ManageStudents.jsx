// src/pages/admin/ManageStudents.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users } from 'lucide-react';
import { storage } from '../../utils/storage';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ManageUsers from '../../components/ManageUsers';
import { useTheme } from '../../contexts/ThemeContext';

const ManageStudents = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [view, setView] = useState('classList');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const allClasses = storage.get('classes') || [];
        const allUsers = storage.get('users') || [];
        
        // প্রত্যেক ক্লাসের ছাত্র সংখ্যা গণনা করা
        const classesWithCounts = allClasses.map(cls => ({
            ...cls,
            studentCount: allUsers.filter(u => u.role === 'student' && u.classId === cls.id).length
        }));

        setClasses(classesWithCounts);
        setLoading(false);
    }, [view]);


    const handleClassSelect = (cls) => {
        setSelectedClass(cls);
        setView('studentList');
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setView('classList');
    };
    
    // Main component render logic
    if (view === 'studentList' && selectedClass) {
        return (
            <ManageUsers
                role="student"
                title={`Students in ${selectedClass.name}`}
                description={`Manage all students enrolled in ${selectedClass.name}`}
                classId={selectedClass.id}
                onBack={handleBackToClasses}
            />
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : 'light-bg'}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Select a Class</h1>
                        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose a class to manage its students</p>
                    </motion.div>

                    {loading ? (
                        <div className="text-center py-16"><div className="w-8 h-8 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div></div>
                    ) : (
                        <motion.div 
                            initial="hidden" 
                            animate="visible" 
                            variants={{ visible: { transition: { staggerChildren: 0.1 } }}} 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {classes.map((cls) => (
                                <motion.div 
                                    key={cls.id} 
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => handleClassSelect(cls)}
                                    className={`p-6 rounded-2xl cursor-pointer ${isDark ? 'glass-card-dark' : 'glass-card-light'} hover:border-blue-500/50 border-2 border-transparent transition-all`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><BookOpen/></div>
                                        <h3 className="text-lg font-semibold">{cls.name}</h3>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users size={16} className="mr-2"/> {cls.studentCount} Students
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ManageStudents;