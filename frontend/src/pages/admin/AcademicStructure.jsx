// src/pages/admin/AcademicStructure.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Plus, Edit3, Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../utils/storage';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const AcademicStructure = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [classes, setClasses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = () => {
        setClasses(storage.get('classes') || []);
    };

    const handleOpenModal = (cls = null) => {
        if (cls) {
            setIsEditing(true);
            setSelectedClass(cls);
            setFormData({ name: cls.name, description: cls.description || '' });
        } else {
            setIsEditing(false);
            setSelectedClass(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const currentClasses = storage.get('classes') || [];
        if (isEditing) {
            const updatedClasses = currentClasses.map(c => 
                c.id === selectedClass.id ? { ...c, ...formData } : c
            );
            storage.set('classes', updatedClasses);
        } else {
            const newClass = {
                id: `class_${Date.now()}`,
                ...formData
            };
            storage.set('classes', [...currentClasses, newClass]);
        }
        loadClasses();
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            const updatedClasses = classes.filter(c => c.id !== id);
            storage.set('classes', updatedClasses);
            loadClasses();
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Manage Classes</h1>
                            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Add, edit, or remove academic classes</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleOpenModal()} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg flex items-center gap-2`}>
                            <Plus /> Add New Class
                        </motion.button>
                    </motion.div>

                    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } }}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map(cls => (
                            <motion.div key={cls.id} variants={itemVariants} className={`p-6 rounded-2xl group ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
                                <h3 className="font-bold text-lg mb-2">{cls.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{cls.description}</p>
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(cls)} className="p-2 rounded-full hover:bg-gray-500/10"><Edit3 size={16}/></button>
                                    <button onClick={() => handleDelete(cls.id)} className="p-2 rounded-full hover:bg-red-500/10 text-red-500"><Trash2 size={16}/></button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.form onSubmit={handleSave} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-md p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{isEditing ? 'Edit Class' : 'Add New Class'}</h3>
                                <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-500/10"><X size={20}/></button>
                            </div>
                            <div className="space-y-4">
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Class Name (e.g., Class 6)" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description (Optional)" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-gray-500/20 font-semibold">Cancel</button>
                                <button type="submit" className={`flex-1 py-3 rounded-xl text-white bg-gradient-to-r ${currentTheme.primary} font-semibold`}>{isEditing ? 'Save Changes' : 'Add Class'}</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademicStructure;