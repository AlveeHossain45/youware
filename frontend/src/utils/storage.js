// Mock data seeding utility for EduVersePro
// This creates initial data for demonstration purposes

// *** গুরুত্বপূর্ণ: ডেমো ডেটাতে কোনো পরিবর্তন আনলে এই ভার্সন নম্বরটি পরিবর্তন করুন (e.g., '1.3' to '1.4') ***
const DATA_VERSION = '1.3'; 

export const seedMockData = async () => {
  const currentVersion = localStorage.getItem('data_version');

  // যদি ভার্সন না মেলে বা ব্যবহারকারীর ডেটা না থাকে, তবে পুরোনো সব ডেটা মুছে নতুন করে তৈরি হবে
  if (currentVersion !== DATA_VERSION || !localStorage.getItem('users')) {
    localStorage.clear(); // পুরোনো সব ডেটা মুছে ফেলবে
    console.log(`Data version mismatch or missing. Clearing storage and seeding new data for version: ${DATA_VERSION}`);

    // Seed Users with correct credentials
    const users = [
      { id: 'admin_001', name: 'System Administrator', email: 'admin@eduversepro.com', password: 'admin123', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff', createdAt: new Date().toISOString(), status: 'active' },
      { id: 'teacher_001', name: 'Sarah Johnson', email: 'teacher@eduversepro.com', password: 'teacher123', role: 'teacher', avatar: 'https://ui-avatars.com/api/?name=Sarah+J&background=3b82f6&color=fff', createdAt: new Date().toISOString(), status: 'active' },
      { id: 'student_001', name: 'Emma Wilson', email: 'student@eduversepro.com', password: 'student123', role: 'student', avatar: 'https://ui-avatars.com/api/?name=Emma+W&background=10b981&color=fff', createdAt: new Date().toISOString(), status: 'active', classId: 'class_001' },
      { id: 'accountant_001', name: 'Robert Martinez', email: 'accountant@eduversepro.com', password: 'accountant123', role: 'accountant', avatar: 'https://ui-avatars.com/api/?name=Robert+M&background=8b5cf6&color=fff', createdAt: new Date().toISOString(), status: 'active' }
    ];

    // Seed other necessary data
    const classes = [ { id: 'class_001', name: 'Mathematics 10A', description: 'Advanced Mathematics', teacherId: 'teacher_001', subject: 'Mathematics', schedule: 'Mon, Wed, Fri - 9:00 AM', room: 'Room 201' } ];
    const exams = [ { id: 'exam_001', title: 'Mathematics Midterm', classId: 'class_001', duration: 90, totalMarks: 100, status: 'scheduled' } ];
    const settings = { siteName: 'EduVersePro' };

    // Save all data to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('exams', JSON.stringify(exams));
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Set the new data version
    localStorage.setItem('data_version', DATA_VERSION);
    console.log('Mock data seeded successfully!');
  }
};

// Utility functions for data management
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (e) { return []; }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error("Failed to set item in storage", e); }
  },
  getObject: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : {};
    } catch (e) { return {}; }
  },
  setObject: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error("Failed to set object in storage", e); }
  }
};