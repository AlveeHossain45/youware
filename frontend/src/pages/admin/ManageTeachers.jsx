import React from 'react';
import { Users } from 'lucide-react';
import ManageUsers from '../../components/ManageUsers'; // Reusable component

const ManageTeachers = () => {
    return (
        <ManageUsers
            role="teacher"
            title="Manage Teachers"
            description="Add, edit, and manage all teachers"
            icon={Users}
        />
    );
};

export default ManageTeachers;