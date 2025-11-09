import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Search, Plus, CreditCard, CheckCircle, AlertCircle, X, TrendingUp, Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../utils/storage';

const Payments = () => {
    const { isDark, currentTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [studentsWithFees, setStudentsWithFees] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGenerateFeeModal, setShowGenerateFeeModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentData, setPaymentData] = useState({ amount: '', paymentMethod: 'Credit Card', transactionId: '', notes: '' });
    const [generateFeeData, setGenerateFeeData] = useState({ studentId: '', amount: '', description: '', dueDate: '' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [studentsWithFees, searchTerm, statusFilter]);

    const loadData = () => {
        const users = storage.get('users') || [];
        const fees = storage.get('fees') || [];
        const students = users.filter(u => u.role === 'student');

        const studentFeeDetails = students.map(student => {
            const studentFees = fees.filter(f => f.studentId === student.id);
            const totalDue = studentFees.reduce((sum, f) => sum + f.amount, 0);
            const totalPaid = studentFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) + 
                              studentFees.filter(f => f.status === 'partial').reduce((sum, f) => sum + (f.amountPaid || 0), 0);
            const balance = totalDue - totalPaid;
            
            let status = 'Pending';
            if (balance <= 0 && totalDue > 0) status = 'Paid';
            else if (totalPaid > 0 && balance > 0) status = 'Partial';
            else if (totalDue === 0) status = 'No Dues';

            // Check for overdue
            const isOverdue = studentFees.some(f => f.status !== 'paid' && new Date(f.dueDate) < new Date());
            if (isOverdue && status !== 'Paid') status = 'Overdue';

            return { ...student, totalDue, totalPaid, balance, status };
        });

        setStudentsWithFees(studentFeeDetails);
    };
    
    const filterData = () => {
        let filtered = studentsWithFees;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status.toLowerCase() === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredStudents(filtered);
    };

    const handleRecordPayment = (e) => {
        e.preventDefault();
        const allFees = storage.get('fees');
        const studentPendingFees = allFees.filter(f => f.studentId === selectedStudent.id && f.status !== 'paid').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        let paymentAmount = parseFloat(paymentData.amount);
        
        for (const fee of studentPendingFees) {
            if (paymentAmount <= 0) break;

            const dueOnThisFee = fee.balanceDue || fee.amount;
            const paidOnThisFee = Math.min(paymentAmount, dueOnThisFee);
            
            fee.amountPaid = (fee.amountPaid || 0) + paidOnThisFee;
            fee.balanceDue = fee.amount - fee.amountPaid;
            fee.status = fee.balanceDue <= 0 ? 'paid' : 'partial';
            fee.paidDate = new Date().toISOString().split('T')[0];
            fee.paymentMethod = paymentData.paymentMethod;
            fee.transactionId = paymentData.transactionId || `TXN${Date.now()}`;
            
            paymentAmount -= paidOnThisFee;
        }

        const updatedFees = allFees.map(f => {
            const updatedFee = studentPendingFees.find(sf => sf.id === f.id);
            return updatedFee || f;
        });

        storage.set('fees', updatedFees);
        loadData();
        setShowPaymentModal(false);
    };

    const handleGenerateFee = (e) => {
        e.preventDefault();
        const allFees = storage.get('fees');
        const student = storage.get('users').find(u => u.id === generateFeeData.studentId);
        
        const newFee = {
            id: `fee_${Date.now()}`,
            studentId: generateFeeData.studentId,
            studentName: student.name,
            amount: parseFloat(generateFeeData.amount),
            description: generateFeeData.description,
            dueDate: generateFeeData.dueDate,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        storage.set('fees', [newFee, ...allFees]);
        loadData();
        setShowGenerateFeeModal(false);
    };
    
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
    
    return (
        <div className={`min-h-screen ${isDark ? currentTheme.dark.bg : currentTheme.light.bg}`}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <div className="p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Fee Management</h1>
                                <p className={`text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage student payments.</p>
                            </div>
                            <motion.button onClick={() => setShowGenerateFeeModal(true)} whileHover={{ scale: 1.05 }} className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.primary} shadow-lg flex items-center gap-2`}>
                                <Plus /> Generate Fee
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    {/* ... (Stat cards can be added here) */}

                    {/* Table */}
                    <div className={`p-4 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'} shadow-premium-lg`}>
                        <div className="flex flex-col md:flex-row gap-4 p-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Search student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`} />
                            </div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`w-full md:w-auto p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}>
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="partial">Partial</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Total Due</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Balance</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full"/><div><div className="font-semibold">{student.name}</div><div className="text-xs text-gray-400">{student.email}</div></div></div></td>
                                            <td className="px-6 py-4 font-mono">${student.totalDue.toFixed(2)}</td>
                                            <td className={`px-6 py-4 font-mono font-semibold ${student.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>${student.balance.toFixed(2)}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(student.status)}`}>{student.status}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                {student.balance > 0 && (
                                                    <button onClick={() => { setSelectedStudent(student); setShowPaymentModal(true); }} className={`px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-r ${currentTheme.primary} shadow-md`}>Record Payment</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.form onSubmit={handleRecordPayment} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
                            <div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold`}>Record Payment for {selectedStudent.name}</h3><button type="button" onClick={() => setShowPaymentModal(false)}><X/></button></div>
                            <div className="space-y-4">
                                <input required type="number" step="0.01" max={selectedStudent.balance} value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} placeholder="Amount" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                                <select value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})} className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}><option>Credit Card</option><option>Bank Transfer</option><option>Cash</option></select>
                                <input type="text" value={paymentData.transactionId} onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})} placeholder="Transaction ID (Optional)" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                                <textarea value={paymentData.notes} onChange={e => setPaymentData({...paymentData, notes: e.target.value})} placeholder="Notes (Optional)" rows="3" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}></textarea>
                            </div>
                            <div className="flex gap-3 mt-6"><button type="button" onClick={() => setShowPaymentModal(false)} className={`flex-1 py-3 rounded-xl`}>Cancel</button><button type="submit" className={`flex-1 py-3 rounded-xl text-white bg-gradient-to-r ${currentTheme.primary}`}>Confirm Payment</button></div>
                        </motion.form>
                    </motion.div>
                )}
                {showGenerateFeeModal && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.form onSubmit={handleGenerateFee} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
                            <div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold`}>Generate New Fee</h3><button type="button" onClick={() => setShowGenerateFeeModal(false)}><X/></button></div>
                            <div className="space-y-4">
                                <select required value={generateFeeData.studentId} onChange={e => setGenerateFeeData({...generateFeeData, studentId: e.target.value})} className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}>
                                    <option value="">Select Student</option>
                                    {studentsWithFees.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <input required type="text" value={generateFeeData.description} onChange={e => setGenerateFeeData({...generateFeeData, description: e.target.value})} placeholder="Fee Description (e.g., Monthly Tuition)" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="number" step="0.01" value={generateFeeData.amount} onChange={e => setGenerateFeeData({...generateFeeData, amount: e.target.value})} placeholder="Amount" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                                    <input required type="date" value={generateFeeData.dueDate} onChange={e => setGenerateFeeData({...generateFeeData, dueDate: e.target.value})} className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6"><button type="button" onClick={() => setShowGenerateFeeModal(false)} className={`flex-1 py-3 rounded-xl`}>Cancel</button><button type="submit" className={`flex-1 py-3 rounded-xl text-white bg-gradient-to-r ${currentTheme.primary}`}>Generate</button></div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Payments;