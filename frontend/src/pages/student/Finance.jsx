import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../api/axios';

const StudentFinancePage = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({ totalFees: 0, totalPaid: 0, balanceDue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadFinancialData = async () => {
            setLoading(true);
            setError('');
            try {
                // এই API কলটি এখন ব্যাকএন্ড থেকে স্বয়ংক্রিয়ভাবে ফিল্টার করা ডেটা আনবে
                const response = await apiClient.get('/invoices'); 
                const studentInvoices = response.data;

                const totalFees = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                let totalPaid = 0;
                studentInvoices.forEach(inv => {
                    totalPaid += (inv.payments || []).reduce((sum, p) => sum + p.amountPaid, 0);
                });
                const balanceDue = totalFees - totalPaid;

                setInvoices(studentInvoices);
                setSummary({ totalFees, totalPaid, balanceDue });
            } catch (err) {
                console.error('Failed to load financial data:', err);
                setError('Could not load your financial records. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        loadFinancialData();
    }, []);
    
    const getStatusBadge = (invoice) => {
        let currentStatus = invoice.status;
        const isOverdue = new Date(invoice.dueDate) < new Date() && currentStatus !== 'paid';

        if (isOverdue) return { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Overdue' };

        switch (currentStatus) {
            case 'paid': return { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Paid' };
            case 'partial': return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Partial' };
            default: return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending' };
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

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
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length > 0 ? invoices.map(invoice => {
                                        const status = getStatusBadge(invoice);
                                        return (
                                            <tr key={invoice.id} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                                                <td className="px-6 py-4 font-medium">{invoice.description}</td>
                                                <td className="px-6 py-4 text-gray-400">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-mono">${invoice.amount.toFixed(2)}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full font-medium ${status.bg} ${status.text}`}>{status.label}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    {invoice.status !== 'paid' && (
                                                        <button className={`px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-r ${currentTheme.primary} shadow-md`}>Pay Now</button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-16 text-gray-500">You have no financial records yet.</td>
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

export default StudentFinancePage;