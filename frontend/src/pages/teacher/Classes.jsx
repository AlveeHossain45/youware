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
import { storage } from '../../utils/storage';

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

  const loadData = () => {
    try {
      const classesData = storage.get('classes') || [];
      const usersData = storage.get('users') || [];
      const teacherData = usersData.filter(u => u.role === 'teacher');
      
      const classesWithDetails = classesData.map(cls => {
          const teacher = teacherData.find(t => t.id === cls.teacherId);
          const studentCount = usersData.filter(u => u.role === 'student' && u.classId === cls.id).length;
          return {
              ...cls,
              teacherName: teacher ? teacher.name : 'N/A',
              studentCount: studentCount
          };
      });

      setClasses(classesWithDetails);
      setFilteredClasses(classesWithDetails);
      setTeachers(teacherData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(cls => cls.subject === subjectFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(cls =>
        (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cls.subject && cls.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cls.teacherName && cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredClasses(filtered);
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setIsEditing(true);
      setSelectedClass(cls);
      setFormData({
        name: cls.name,
        description: cls.description,
        subject: cls.subject,
        teacherId: cls.teacherId,
        schedule: cls.schedule,
        room: cls.room,
        maxStudents: cls.maxStudents
      });
    } else {
      setIsEditing(false);
      setSelectedClass(null);
      setFormData({
        name: '', description: '', subject: '', teacherId: '',
        schedule: '', room: '', maxStudents: 30
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = () => {
    const allUsers = storage.get('users');
    const teacher = allUsers.find(u => u.id === formData.teacherId);

    if (isEditing) {
      const updatedClasses = classes.map(c => c.id === selectedClass.id ? { ...selectedClass, ...formData, teacherName: teacher?.name } : c);
      storage.set('classes', updatedClasses);
    } else {
      const newClass = {
        id: `class_${Date.now()}`,
        ...formData,
        teacherName: teacher?.name,
        studentCount: 0,
        createdAt: new Date().toISOString()
      };
      const updatedClasses = [...classes, newClass];
      storage.set('classes', updatedClasses);
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
        const updatedClasses = classes.filter(c => c.id !== classId);
        storage.set('classes', updatedClasses);
        loadData();
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
                  {user?.role === 'admin' ? 'All Classes' : 'My Classes'}
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder="Search classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
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
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem, index) => (
              <motion.div key={classItem.id} variants={itemVariants} custom={index} whileHover={{ y: -5, transition: { duration: 0.2 } }} className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}><GraduationCap className="w-6 h-6" /></div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{classItem.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.subject}</p>
                    </div>
                  </div>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-2`}>{classItem.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.studentCount} students</span></div>
                  <div className="flex items-center gap-2"><Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.schedule}</span></div>
                  <div className="flex items-center gap-2"><MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{classItem.room}</span></div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => alert(`Viewing details for ${classItem.name}`)} className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}><Eye className={`w-4 h-4 mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /></button>
                    <button onClick={() => handleOpenModal(classItem)} className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}><Edit3 className={`w-4 h-4 mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /></button>
                    <button onClick={() => handleDelete(classItem.id)} className={`flex-1 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} transition-colors`}><Trash2 className="w-4 h-4 text-red-500 mx-auto" /></button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isEditing ? 'Edit Class' : 'Add New Class'}</h3>
              <button onClick={handleCloseModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} transition-colors`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Class Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} rows="3"></textarea>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                <select value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input type="text" placeholder="Schedule (e.g., Mon, Wed 10am)" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                <input type="text" placeholder="Room No." value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} className={`w-full px-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCloseModal} className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>Cancel</button>
              <button onClick={handleSubmit} className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg hover:shadow-xl transition-all duration-200`}>{isEditing ? 'Update Class' : 'Add Class'}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Classes;