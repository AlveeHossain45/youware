import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Search, Plus, CreditCard, X, Users, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../api/axios';
import GenerateFeeModal from '../../components/modals/GenerateFeeModal'; // <-- নতুন ইম্পোর্ট
import RecordPaymentModal from '../../components/modals/RecordPaymentModal'; // <-- নতুন ইম্পোর্ট

const Payments = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [allStudents, setAllStudents] = useState([]);
    const [studentsWithFees, setStudentsWithFees] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGenerateFeeModal, setShowGenerateFeeModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let filtered = studentsWithFees;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status.toLowerCase() === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredStudents(filtered);
    }, [studentsWithFees, searchTerm, statusFilter]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [studentsRes, invoicesRes] = await Promise.all([
                apiClient.get('/users?role=student'),
                apiClient.get('/invoices')
            ]);
            const students = studentsRes.data;
            const invoices = invoicesRes.data;
            setAllStudents(students);

            const studentFeeDetails = students.map(student => {
                const studentInvoices = invoices.filter(inv => inv.studentId === student.id);
                const totalDue = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                let totalPaid = 0;
                studentInvoices.forEach(inv => {
                    totalPaid += (inv.payments || []).reduce((sum, p) => sum + p.amountPaid, 0);
                });
                const balance = totalDue - totalPaid;
                
                let status = 'No Dues';
                if (balance > 0) {
                    const isOverdue = studentInvoices.some(inv => inv.status !== 'paid' && new Date(inv.dueDate) < new Date());
                    if (isOverdue) status = 'Overdue';
                    else if (totalPaid > 0) status = 'Partial';
                    else status = 'Pending';
                } else if (totalDue > 0) {
                    status = 'Paid';
                }
                return { ...student, totalDue, totalPaid, balance, status };
            });
            setStudentsWithFees(studentFeeDetails);
        } catch (err) {
            setError("Failed to load financial data. Please try again later.");
            console.error("Failed to load financial data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (paymentData) => {
        const invoicesRes = await apiClient.get(`/invoices?studentId=${selectedStudent.id}`);
        const unpaidInvoice = invoicesRes.data.find(inv => inv.status !== 'paid');
        if (!unpaidInvoice) throw new Error("No outstanding invoices found for this student.");
        await apiClient.post('/payments', { invoiceId: unpaidInvoice.id, ...paymentData });
        await loadData();
    };

    const handleGenerateFee = async (feeData) => {
        await apiClient.post('/invoices', feeData);
        await loadData();
    };
    
    const getStatusBadge = (status) => { /* ... */ };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }
    
    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/><p className="text-red-500">{error}</p></div>;
    }

    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center justify-between">
                            <div><h1 className={`text-3xl font-bold`}>Fee Management</h1><p className={`text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage student payments.</p></div>
                            <motion.button onClick={() => setShowGenerateFeeModal(true)} whileHover={{ scale: 1.05 }} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg flex items-center gap-2`}><Plus /> Generate Fee</motion.button>
                        </div>
                    </motion.div>

                    <div className={`p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="flex flex-col md:flex-row gap-4 p-4">
                            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} /></div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`w-full md:w-auto p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}><option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option><option value="overdue">Overdue</option></select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200/10"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase">Student</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">Total Due</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">Balance</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase">Actions</th></tr></thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full"/><div><div className="font-semibold">{student.name}</div><div className="text-xs text-gray-400">{student.email}</div></div></div></td>
                                            <td className="px-6 py-4 font-mono">${student.totalDue.toFixed(2)}</td>
                                            <td className={`px-6 py-4 font-mono font-semibold ${student.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>${student.balance.toFixed(2)}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(student.status)}`}>{student.status}</span></td>
                                            <td className="px-6 py-4 text-right">{student.balance > 0 && (<button onClick={() => { setSelectedStudent(student); setShowPaymentModal(true); }} className={`px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-r ${currentTheme.primary} shadow-md`}>Record Payment</button>)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            
            <AnimatePresence>
                <GenerateFeeModal 
                    isOpen={showGenerateFeeModal}
                    onClose={() => setShowGenerateFeeModal(false)}
                    onSave={handleGenerateFee}
                    students={allStudents}
                />
                <RecordPaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSave={handleRecordPayment}
                    student={selectedStudent}
                />
            </AnimatePresence>
        </div>
    );
};

// getStatusBadge অপরিবর্তিত থাকবে
const getStatusBadge = (status) => {
    const styles = {
        Paid: 'bg-green-500/10 text-green-500',
        Pending: 'bg-yellow-500/10 text-yellow-500',
        Partial: 'bg-blue-500/10 text-blue-500',
        Overdue: 'bg-red-500/10 text-red-500',
        'No Dues': 'bg-gray-500/10 text-gray-500',
    };
    return styles[status] || styles.Pending;
};

export default Payments;