import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import type { User } from '../../types';

type UserCardProps = {
  user: User;
  userType: 'creator' | 'manufacturer';
};

const UserCard: React.FC<UserCardProps> = ({ user, userType }) => {
  return (
    <Link
      to={`/${userType}/${user.id}`}
      state={{ user }}
      className="flex items-center gap-2 p-2 border rounded-md shadow-sm hover:shadow-md transition w-64"
    >
      <Avatar
        image={user.avatarUrl}
        label={!user.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
        shape="circle"
        size="normal"
        className="border border-gray-300"
        style={{ backgroundColor: !user.avatarUrl ? '#1d4ed8' : undefined, color: '#fff' }}
      />
      <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
    </Link>
  );
};

export default UserCard;
