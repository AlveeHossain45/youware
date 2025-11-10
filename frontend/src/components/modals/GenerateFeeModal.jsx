// frontend/src/components/modals/GenerateFeeModal.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const GenerateFeeModal = ({ isOpen, onClose, onSave, students }) => {
    const { isDark, currentTheme } = useTheme();
    const [formData, setFormData] = useState({ studentId: '', amount: '', description: '', dueDate: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.studentId || !formData.amount || !formData.description || !formData.dueDate) {
            setError('All fields are required.');
            return;
        }
        try {
            await onSave(formData);
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message || 'Failed to generate fee.');
        }
    };
    
    if (!isOpen) return null;

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
                    <h3 className="text-xl font-bold">Generate New Fee</h3>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10"><X size={20}/></button>
                </div>
                
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                <div className="space-y-4">
                    <select required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}>
                        <option value="">Select a Student</option>
                        {students.length > 0 ? (
                            students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)
                        ) : (
                            <option disabled>No students found</option>
                        )}
                    </select>
                    <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Fee Description (e.g., Monthly Tuition)" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="Amount" className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                        <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className={`w-full p-3 rounded-xl ${isDark ? 'input-glass-dark' : 'input-glass'}`}/>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'} font-semibold`}>Cancel</button>
                    <button type="submit" className={`flex-1 py-3 rounded-xl text-white bg-gradient-to-r ${currentTheme.primary} font-semibold`}>Generate</button>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default GenerateFeeModal;