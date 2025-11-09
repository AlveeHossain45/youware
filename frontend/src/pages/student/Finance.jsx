import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';

const StudentFinance = () => {
    const { isDark, currentTheme } = useTheme();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [fees, setFees] = useState([]);
    const [summary, setSummary] = useState({ totalFees: 0, totalPaid: 0, balanceDue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const allFees = storage.get('fees') || [];
            const studentFees = allFees.filter(f => f.studentId === user.id);

            const totalFees = studentFees.reduce((sum, f) => sum + f.amount, 0);
            const totalPaid = studentFees.reduce((sum, f) => sum + (f.amountPaid || (f.status === 'paid' ? f.amount : 0)), 0);
            const balanceDue = totalFees - totalPaid;

            setFees(studentFees);
            setSummary({ totalFees, totalPaid, balanceDue });
            setLoading(false);
        }
    }, [user]);
    
    const getStatusBadge = (fee) => {
        if (fee.status === 'paid') {
            return { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Paid' };
        }
        const isOverdue = new Date(fee.dueDate) < new Date();
        if (isOverdue) {
            return { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Overdue' };
        }
        if (fee.status === 'partial') {
            return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Partial' };
        }
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending' };
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Finances</h1>
                        <p className={`text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track your fees, payments, and dues.</p>
                    </motion.div>

                    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard icon={DollarSign} title="Total Fees" value={`$${summary.totalFees.toFixed(2)}`} color="text-blue-500" />
                        <StatCard icon={CheckCircle} title="Total Paid" value={`$${summary.totalPaid.toFixed(2)}`} color="text-green-500" />
                        <StatCard icon={AlertCircle} title="Balance Due" value={`$${summary.balanceDue.toFixed(2)}`} color={summary.balanceDue > 0 ? 'text-red-500' : 'text-green-500'} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/10">
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Due Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.length > 0 ? fees.map(fee => {
                                        const status = getStatusBadge(fee);
                                        return (
                                            <tr key={fee.id} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                                                <td className="px-6 py-4 font-medium">{fee.description}</td>
                                                <td className="px-6 py-4 text-gray-400">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-mono">${fee.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full font-medium ${status.bg} ${status.text}`}>{status.label}</span></td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-16 text-gray-500">You have no financial records yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, color }) => {
    const { isDark } = useTheme();
    return (
        <motion.div variants={{hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}} className={`p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}><Icon className={`w-6 h-6 ${color}`} /></div>
                <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentFinance;