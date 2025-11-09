import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Clock, FileText, Award, TrendingUp, Play } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';

const StudentDashboard = () => {
    const { isDark, currentTheme } = useTheme();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({ enrolledClasses: 0, upcomingExams: 0, pendingAssignments: 0, attendanceRate: 0 });
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboardData = () => {
            try {
                const classes = storage.get('classes');
                const exams = storage.get('exams');
                const attendance = storage.get('attendance');
                
                const studentClass = classes.find(c => user.classId && c.id === user.classId);
                const upcomingExamsList = exams.filter(e => e.classId === user.classId && new Date(e.scheduledDate) > new Date());
                const studentAttendance = attendance.filter(a => a.studentId === user.id);
                const presentRecords = studentAttendance.filter(a => a.status === 'present').length;
                const attendanceRate = studentAttendance.length > 0 ? (presentRecords / studentAttendance.length * 100).toFixed(1) : 100;

                setStats({
                    enrolledClasses: studentClass ? 1 : 0,
                    upcomingExams: upcomingExamsList.length,
                    pendingAssignments: 2, // Mock data
                    attendanceRate: parseFloat(attendanceRate)
                });
                setUpcomingExams(upcomingExamsList.slice(0, 3));
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadDashboardData();
    }, [user]);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <motion.div variants={itemVariants} className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${color}`} />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{title}</p>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}><Icon className={`w-6 h-6 ${color}`} /></div>
            </div>
        </motion.div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Student Dashboard</h1>
                        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back, {user?.name}!</p>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Enrolled Classes" value={stats.enrolledClasses} icon={BookOpen} color="text-blue-500" />
                        <StatCard title="Upcoming Exams" value={stats.upcomingExams} icon={FileText} color="text-purple-500" />
                        <StatCard title="Pending Tasks" value={stats.pendingAssignments} icon={Clock} color="text-orange-500" />
                        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={TrendingUp} color="text-green-500" />
                    </motion.div>

                    <motion.div variants={itemVariants} initial="hidden" animate="visible" className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Exams</h3>
                            <button onClick={() => navigate('/student/exams')} className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentTheme.primary} text-white text-sm font-medium hover:shadow-lg`}>View All</button>
                        </div>
                        <div className="space-y-4">
                            {upcomingExams.length > 0 ? upcomingExams.map((exam) => (
                                <motion.div key={exam.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30"><FileText className="w-5 h-5 text-blue-500" /></div>
                                            <div>
                                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.title}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}><Calendar className="w-4 h-4" />{new Date(exam.scheduledDate).toLocaleDateString()}</span>
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}><Clock className="w-4 h-4" />{exam.duration} min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate(`/student/exam/${exam.id}`)} className="p-2 rounded-lg hover:bg-gray-500/10"><Play className={`w-5 h-5 ${currentTheme.text}`} /></button>
                                    </div>
                                </motion.div>
                            )) : <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No upcoming exams.</p>}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;