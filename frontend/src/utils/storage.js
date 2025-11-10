// src/utils/storage.js

// Mock data seeding utility for EduVersePro

// *** গুরুত্বপূর্ণ: ডেমো ডেটাতে কোনো পরিবর্তন আনলে এই ভার্সন নম্বরটি পরিবর্তন করুন ***
const DATA_VERSION = '2.0'; 

export const seedMockData = async () => {
  const currentVersion = localStorage.getItem('data_version');

  // যদি ভার্সন না মেলে বা ব্যবহারকারীর ডেটা না থাকে, তবে পুরোনো সব ডেটা মুছে নতুন করে তৈরি হবে
  if (currentVersion !== DATA_VERSION || !localStorage.getItem('users')) {
    localStorage.clear(); // পুরোনো সব ডেটা মুছে ফেলবে
    console.log(`Data version mismatch or missing. Clearing storage and seeding new data for version: ${DATA_VERSION}`);

    // --- USER DATA ---
    const users = [
      { id: 'admin_001', name: 'System Administrator', email: 'admin@eduversepro.com', password: 'admin123', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff', createdAt: new Date().toISOString(), status: 'active' },
      { id: 'teacher_001', name: 'Sarah Johnson', email: 'teacher@eduversepro.com', password: 'teacher123', role: 'teacher', avatar: 'https://ui-avatars.com/api/?name=Sarah+J&background=3b82f6&color=fff', createdAt: new Date().toISOString(), status: 'active' },
      { id: 'accountant_001', name: 'Robert Martinez', email: 'accountant@eduversepro.com', password: 'accountant123', role: 'accountant', avatar: 'https://ui-avatars.com/api/?name=Robert+M&background=8b5cf6&color=fff', createdAt: new Date().toISOString(), status: 'active' },
      { id: 'staff_001', name: 'John Doe', email: 'staff@example.com', password: 'staff123', role: 'staff', avatar: 'https://ui-avatars.com/api/?name=John+D&background=78716c&color=fff', createdAt: new Date().toISOString(), status: 'active' },
      
      // --- সকল শিক্ষার্থীকে Class 8 (class_003) এ যুক্ত করা হয়েছে ---
      { id: 'student_001', name: 'Emma Wilson', email: 'student@eduversepro.com', password: 'student123', role: 'student', avatar: 'https://ui-avatars.com/api/?name=Emma+W&background=10b981&color=fff', createdAt: new Date().toISOString(), status: 'active', classId: 'class_003' },
      { id: 'student_002', name: 'Liam Smith', email: 'liam@example.com', password: 'student123', role: 'student', avatar: 'https://ui-avatars.com/api/?name=Liam+S&background=f97316&color=fff', createdAt: new Date().toISOString(), status: 'active', classId: 'class_003' },
      { id: 'student_003', name: 'Olivia Brown', email: 'olivia@example.com', password: 'student123', role: 'student', avatar: 'https://ui-avatars.com/api/?name=Olivia+B&background=6366f1&color=fff', createdAt: new Date().toISOString(), status: 'active', classId: 'class_003' },
    ];
    
    // --- ACADEMIC STRUCTURE DATA ---
    const classes = [ 
        { id: 'class_001', name: 'Class 6', description: 'Primary School Grade 6', teacherId: 'teacher_001' },
        { id: 'class_002', name: 'Class 7', description: 'Primary School Grade 7', teacherId: 'teacher_001' },
        { id: 'class_003', name: 'Class 8', description: 'Junior High School Grade 8', teacherId: 'teacher_001' }
    ];
    
    const subjects = [
        { id: 'sub_01', name: 'Mathematics', classId: 'class_001' },
        { id: 'sub_02', name: 'Science', classId: 'class_001' },
        { id: 'sub_03', name: 'English', classId: 'class_002' },
        { id: 'sub_04', name: 'Social Science', classId: 'class_003' }
    ];

    const sections = [
        { id: 'sec_01', name: 'Section A', subjectId: 'sub_01' },
        { id: 'sec_02', name: 'Section B', subjectId: 'sub_01' },
        { id: 'sec_03', name: 'Section A', subjectId: 'sub_02' }
    ];

    const schedules = [
        { id: 'sch_01', name: 'Mon, 9:00 AM - 10:00 AM', sectionId: 'sec_01'},
        { id: 'sch_02', name: 'Wed, 9:00 AM - 10:00 AM', sectionId: 'sec_01'},
        { id: 'sch_03', name: 'Tue, 11:00 AM - 12:00 PM', sectionId: 'sec_03'}
    ];

    // --- OTHER DATA ---
    const exams = [ 
        { 
            id: 'exam_001', 
            title: 'Mathematics Midterm', 
            classId: 'class_001',
            teacherId: 'teacher_001', 
            duration: 90, 
            totalMarks: 100, 
            status: 'scheduled',
            scheduledDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
            questions: [
                { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: 1, marks: 10 },
                { id: 2, question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 2, marks: 10 }
            ]
        } 
    ];

    const assignments = [
        {
            id: 1,
            title: 'Algebra Homework 1',
            description: 'Complete the exercises from Chapter 1.',
            classId: 'class_001',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            points: 50,
            submissions: []
        }
    ];

    const attendance = [
        { id: 1, studentId: 'student_001', classId: 'class_001', date: new Date().toISOString().split('T')[0], status: 'present', className: 'Mathematics' },
        { id: 2, studentId: 'student_003', classId: 'class_001', date: new Date().toISOString().split('T')[0], status: 'absent', className: 'Mathematics' }
    ];

    const fees = [
        { id: 1, studentId: 'student_001', studentName: 'Emma Wilson', amount: 1500, balanceDue: 0, status: 'paid', createdAt: new Date().toISOString(), paidDate: new Date().toISOString() },
        { id: 2, studentId: 'student_002', studentName: 'Liam Smith', amount: 1200, balanceDue: 1200, status: 'pending', createdAt: new Date().toISOString() }
    ];
    
    const settings = { siteName: 'EduVersePro' };

    // --- Save all data to localStorage ---
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('schedules', JSON.stringify(schedules));
    localStorage.setItem('exams', JSON.stringify(exams));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('fees', JSON.stringify(fees));
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Set the new data version
    localStorage.setItem('data_version', DATA_VERSION);
    console.log('Mock data seeded successfully!');
  }
};

// --- Utility functions for data management ---
export const storage = {
  /**
   * Get an array from localStorage
   * @param {string} key The key to retrieve
   * @returns {Array} The parsed array or an empty array if not found/error
   */
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (e) { 
      console.error(`Failed to get item "${key}" from storage`, e);
      return []; 
    }
  },
  /**
   * Set an array/value to localStorage
   * @param {string} key The key to set
   * @param {*} value The value to store
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { 
      console.error(`Failed to set item "${key}" in storage`, e); 
    }
  },
  /**
   * Get an object from localStorage
   * @param {string} key The key to retrieve
   * @returns {object} The parsed object or an empty object if not found/error
   */
  getObject: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : {};
    } catch (e) { 
      console.error(`Failed to get object "${key}" from storage`, e);
      return {}; 
    }
  },
  /**
   * Set an object to localStorage
   * @param {string} key The key to set
   * @param {object} value The object to store
   */
  setObject: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { 
      console.error(`Failed to set object "${key}" in storage`, e);
    }
  }
};