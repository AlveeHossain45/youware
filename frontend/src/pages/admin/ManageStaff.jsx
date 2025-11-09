// frontend/src/pages/admin/ManageStaff.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../api/axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const ManageStaff = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalError, setModalError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
    });

    const loadStaff = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/users?excludeRoles=student,teacher');
            setStaff(response.data);
        } catch (error) {
            console.error('Error loading staff:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadStaff();
    }, []);

    useEffect(() => {
        let filtered = staff.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStaff(filtered);
    }, [staff, searchTerm]);

    const handleOpenModal = (staffMember = null) => {
        setModalError('');
        if (staffMember) {
            setIsEditing(true);
            setSelectedStaff(staffMember);
            setFormData({ name: staffMember.name, email: staffMember.email, role: staffMember.role, password: '' });
        } else {
            setIsEditing(false);
            setSelectedStaff(null);
            setFormData({ name: '', email: '', password: '', role: 'staff' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        try {
            if (isEditing) {
                const { name, email, role } = formData;
                await apiClient.put(`/users/${selectedStaff.id}`, { name, email, role });
            } else {
                await apiClient.post('/users', formData);
            }
            await loadStaff();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving staff:', error);
            setModalError(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    const handleDelete = async (staffId) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await apiClient.delete(`/users/${staffId}`);
                await loadStaff();
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert('Failed to delete staff member.');
            }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
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
                                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Manage Staff</h1>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage all non-teaching and non-student staff</p>
                            </div>
                            <motion.button onClick={() => handleOpenModal()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-2`}>
                                <Plus className="w-5 h-5" /> Add Staff Member
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`mb-6 p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input type="text" placeholder="Search staff members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg overflow-hidden`}>
                         <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Staff Member</th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Role</th>
                                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Status</th>
                                        <th className={`px-6 py-4 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     {loading ? (
                                        <tr><td colSpan="4" className="py-12 text-center"><div className="w-8 h-8 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div></td></tr>
                                    ) : filteredStaff.length > 0 ? (
                                        filteredStaff.map(staffItem => (
                                            <tr key={staffItem.id} className={`${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors border-t ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><img src={staffItem.avatar} alt={staffItem.name} className="w-10 h-10 rounded-full" /><div><div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{staffItem.name}</div><div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{staffItem.email}</div></div></div></td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{staffItem.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${staffItem.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>{staffItem.status}</span></td>
                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap"><div className="flex items-center justify-end gap-2"><button onClick={() => handleOpenModal(staffItem)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}><Edit3 className="w-4 h-4" /></button><button onClick={() => handleDelete(staffItem.id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><Trash2 className="w-4 h-4 text-red-500" /></button></div></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="py-12 text-center text-gray-500">No staff members found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {showModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.form onSubmit={handleSubmit} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                                <div className="flex items-center justify-between mb-6"><h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h3><button type="button" onClick={handleCloseModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button></div>
                                {modalError && <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-500/10"><AlertCircle size={16}/> {modalError}</div>}
                                <div className="space-y-4">
                                    <input required type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                                    <input required type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                                     <div>
                                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Role</label>
                                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}>
                                            <option value="staff">General Staff</option>
                                            <option value="accountant">Accountant</option>
                                            <option value="librarian">Librarian</option>
                                            <option value="clerk">Clerk</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    {!isEditing && <input required type="password" placeholder="Password (min 6 characters)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />}
                                </div>
                                <div className="flex gap-3 mt-6"><button type="button" onClick={handleCloseModal} className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}>Cancel</button><button type="submit" className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg`}>{isEditing ? 'Update Staff' : 'Add Staff'}</button></div>
                            </motion.form>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ManageStaff;