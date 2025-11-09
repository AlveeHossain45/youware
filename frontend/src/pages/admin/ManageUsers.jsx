import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, Plus, Edit3, Trash2, GraduationCap,
  DollarSign, Settings, ChevronDown, X, AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../api/axios'; // <-- Step 1: Make sure this is imported

// This component now manages all users and will be used on a dedicated admin page
const ManageUsers = () => {
  const { isDark, currentTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for data and UI
  const [users, setUsers] = useState([]); // This will hold the master list from the API
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true); // <-- THIS IS THE MISSING LINE
  const [error, setError] = useState(null); // State for handling API errors

  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // State for Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
  });

  // --- Data Fetching and Handling ---

  // Load all users from the backend when the component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter the user list whenever the master list, search term, or role filter changes
  useEffect(() => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  // All data functions are now async and use apiClient
  const loadUsers = async () => {
    setLoading(true); // This line was causing the crash
    setError(null);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try refreshing the page.');
    } finally {
      setLoading(false); // This line was also causing a crash
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post('/users', formData);
      await loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.response?.data?.message || 'Failed to add user.');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { name, email, role } = formData;
      await apiClient.put(`/users/${selectedUser.id}`, { name, email, role });
      await loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/users/${userId}`);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // --- Modal Control ---

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setError(null);
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', role: 'student', password: '' });
    setError(null);
    setShowAddModal(true);
  }

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setError(null);
  };

  // --- UI Helpers ---

  const getRoleIcon = (role) => {
    const icons = { admin: Settings, teacher: GraduationCap, student: Users, accountant: DollarSign };
    return icons[role] || Users;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'from-red-500 to-pink-500',
      teacher: 'from-blue-500 to-cyan-500',
      student: 'from-green-500 to-emerald-500',
      accountant: 'from-purple-500 to-indigo-500',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };
  
  // --- Render Logic ---

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8">
          {/* Header and UI Elements... (No changes needed here) */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Manage Users</h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Add, edit, and manage all system users</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddModal} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-2`}>
                <Plus className="w-5 h-5" /> Add User
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`mb-6 p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
             <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              </div>
              <div className="relative">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`pl-10 pr-10 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'} appearance-none cursor-pointer`}>
                  <option value="all">All Roles</option><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option><option value="accountant">Accountant</option>
                </select>
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                    <tr>
                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>User</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Role</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Status</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Created</th>
                        <th className={`px-6 py-4 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>Actions</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700/30' : 'divide-gray-200'}`}>
                    {loading ? (
                        <tr><td colSpan="5" className="py-16 text-center"><div className="w-8 h-8 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div></td></tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan="5" className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No users found.</td></tr>
                    ) : (
                        filteredUsers.map((userItem) => {
                            const RoleIcon = getRoleIcon(userItem.role);
                            return (
                                <motion.tr key={userItem.id} variants={itemVariants} className={`${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={userItem.avatar} alt={userItem.name} className="w-10 h-10 rounded-full"/><div><div className={`font-medium ${isDark? 'text-white':'text-gray-900'}`}>{userItem.name}</div><div className="text-sm text-gray-400">{userItem.email}</div></div></div></td>
                                    <td className="px-6 py-4"><div className={`px-3 py-1.5 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${getRoleBadgeColor(userItem.role)} flex items-center gap-2 w-fit`}><RoleIcon className="w-4 h-4"/><span>{userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}</span></div></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${userItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{userItem.status}</span></td>
                                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEditModal(userItem)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}><Edit3 className="w-4 h-4"/></button><button onClick={() => handleDeleteUser(userItem.id)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}><Trash2 className="w-4 h-4 text-red-500"/></button></div></td>
                                </motion.tr>
                            );
                        })
                    )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {(showAddModal || showEditModal) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.form onSubmit={showAddModal ? handleAddUser : handleEditUser} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-md p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{showAddModal ? 'Add New User' : 'Edit User'}</h3>
                  <button type="button" onClick={handleCloseModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
                </div>
                {error && <div className="flex items-center gap-2 p-3 mb-4 text-red-500 border rounded-lg bg-red-500/10 border-red-500/20"><AlertCircle className="w-5 h-5"/> <p className="text-sm">{error}</p></div>}
                <div className="space-y-4">
                  <div><label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} required /></div>
                  <div><label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} required /></div>
                  <div><label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}><option value="student">Student</option><option value="teacher">Teacher</option><option value="accountant">Accountant</option><option value="admin">Admin</option></select></div>
                  {showAddModal && <div><label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} required /></div>}
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={handleCloseModal} className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>Cancel</button>
                  <button type="submit" className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg`}>{showAddModal ? 'Add User' : 'Update User'}</button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;