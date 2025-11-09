import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Building, BookCopy, Percent, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const AcademicStructure = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('departments');

    const renderContent = () => {
        switch(activeTab) {
            case 'departments':
                return <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>List of Departments will be shown here.</div>;
            case 'courses':
                return <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>List of Courses/Subjects will be shown here.</div>;
            case 'grading':
                return <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>Grading System configuration will be shown here.</div>;
            default: return null;
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Academic Structure</h1>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage departments, courses, and grading</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                            <TabButton icon={Building} title="Departments" isActive={activeTab === 'departments'} onClick={() => setActiveTab('departments')} />
                            <TabButton icon={BookCopy} title="Courses" isActive={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                            <TabButton icon={Percent} title="Grading System" isActive={activeTab === 'grading'} onClick={() => setActiveTab('grading')} />
                        </div>
                        
                        <div>{renderContent()}</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const TabButton = ({ icon: Icon, title, isActive, onClick }) => {
    const { currentTheme } = useTheme();
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${isActive ? `${currentTheme.text} border-current` : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <Icon className="w-5 h-5" />
            <span>{title}</span>
        </button>
    );
};

export default AcademicStructure;