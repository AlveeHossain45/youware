import React from 'react';
import ManageUsers from '../../components/ManageUsers'; // Reusable component

const ManageStudents = () => {
    return (
        <ManageUsers
            role="student"
            title="Manage Students"
            description="Add, edit, and manage all student accounts"
        />
    );
};

export default ManageStudents;