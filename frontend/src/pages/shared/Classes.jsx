import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MapPin,
  X
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axios';

const Classes = () => {
  const { isDark, currentTheme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    teacherId: '',
    schedule: '',
    room: '',
    maxStudents: 30
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, subjectFilter]);

  const loadData = async () => {
  setLoading(true);
  try {
    const [classesResponse, teachersResponse] = await Promise.all([
        apiClient.get('/classes'),
        // We still need the teacher list for the dropdown in the modal
        apiClient.get('/users?role=teacher') 
    ]);
    setClasses(classesResponse.data);
    setFilteredClasses(classesResponse.data);
    setTeachers(teachersResponse.data);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (isEditing) {
      await apiClient.put(`/classes/${selectedClass.id}`, formData);
    } else {
      await apiClient.post('/classes', formData);
    }
    loadData(); // Refresh data from server
    handleCloseModal();
  } catch (error) {
    console.error('Error saving class:', error);
  }
};

const handleDelete = async (classId) => {
  if (window.confirm('Are you sure you want to delete this class?')) {
    try {
      await apiClient.delete(`/classes/${classId}`);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  }
};
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };
  
  const uniqueSubjects = [...new Set(classes.map(c => c.subject))];

  return (
    <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  All Classes
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage all system classes
                </p>
              </div>
              
              {user?.role === 'admin' && (
                <motion.button onClick={() => handleOpenModal()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl flex items-center gap-2`}>
                  <Plus className="w-5 h-5" /> Add Class
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className={`mb-6 p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder="Search classes, subjects, or teachers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              </div>
              
              <div className="relative">
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={`pl-10 pr-10 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'} appearance-none cursor-pointer`}>
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                </select>
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </motion.div>

          {/* Classes Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((classItem, index) => (
              <motion.div key={classItem.id} variants={itemVariants} custom={index} whileHover={{ y: -5, transition: { duration: 0.2 } }} className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg flex flex-col justify-between`}>
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}><GraduationCap className="w-6 h-6" /></div>
                            <div>
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{classItem.name}</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.subject}</p>
                            </div>
                        </div>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-2 min-h-[40px]`}>{classItem.description}</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2"><Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.currentStudents} students</span></div>
                        <div className="flex items-center gap-2"><Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.schedule}</span></div>
                        <div className="flex items-center gap-2"><MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.room}</span></div>
                    </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => alert(`Viewing details for ${classItem.name}`)} className={`flex-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}><Eye className={`w-4 h-4 mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /></button>
                    <button onClick={() => handleOpenModal(classItem)} className={`flex-1 p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}><Edit3 className={`w-4 h-4 mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /></button>
                    <button onClick={() => handleDelete(classItem.id)} className={`flex-1 p-2 rounded-lg ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} transition-colors`}><Trash2 className="w-4 h-4 mx-auto text-red-500" /></button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.form onSubmit={handleSubmit} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEditing ? 'Edit Class' : 'Add New Class'}</h3>
              <button type="button" onClick={handleCloseModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /></button>
            </div>
            <div className="space-y-4">
              <input required type="text" placeholder="Class Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              <textarea required placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} rows="3"></textarea>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input required type="text" placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                <select required value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input required type="text" placeholder="Schedule (e.g., Mon, Wed 10am)" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                <input required type="text" placeholder="Room No." value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={handleCloseModal} className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>Cancel</button>
              <button type="submit" className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl transition-all duration-200`}>{isEditing ? 'Update Class' : 'Add Class'}</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </div>
  );
};

export default Classes;