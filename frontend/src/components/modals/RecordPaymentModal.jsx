// frontend/src/components/modals/RecordPaymentModal.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const RecordPaymentModal = ({ isOpen, onClose, onSave, student }) => {
    const { isDark, currentTheme } = useTheme();
    const [formData, setFormData] = useState({ amount: '', paymentMethod: 'Credit Card', transactionId: '', notes: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (student) {
            setFormData({ amount: student.balance > 0 ? student.balance.toFixed(2) : '', paymentMethod: 'Credit Card', transactionId: '', notes: '' });
        }
    }, [student]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to record payment.');
        }
    };

    if (!isOpen || !student) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form 
                onSubmit={handleSubmit} 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Record Payment for {student.name}</h3>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10"><X size={20}/></button>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                <div className="space-y-4">
                    <input required type="number" step="0.01" max={student.balance} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="Amount" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                    <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}><option>Credit Card</option><option>Bank Transfer</option><option>Cash</option></select>
                    <input type="text" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} placeholder="Transaction ID (Optional)" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                </div>
                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'} font-semibold`}>Cancel</button>
                    <button type="submit" className={`flex-1 py-3 rounded-xl text-white bg-gradient-to-r ${currentTheme.primary} font-semibold`}>Confirm Payment</button>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default RecordPaymentModal;