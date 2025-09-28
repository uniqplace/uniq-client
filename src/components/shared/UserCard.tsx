import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import type { User } from '../../types';

type UserCardProps = {
  user: User;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <Link
      to={`/${user.role}/${user.id}`}
      state={{ user }}
      className="flex flex-row items-end gap-3 p-1 rounded-md"
      style={{ width: 'fit-content' }}
    >
      <Avatar
        image={user.avatarUrl || undefined}
        icon={!user.avatarUrl ? 'pi pi-user' : undefined}
        shape="circle"
        size="large"
        className="w-12 h-12 [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
        style={{
          backgroundColor: !user.avatarUrl ? '#e5e7eb' : undefined,
          color: !user.avatarUrl ? '#2563eb' : undefined,
          fontSize: 18,
          fontWeight: 'bold'
        }}
      />
      <span className="text-base font-semibold text-gray-900 truncate mb-1">{user.name}</span>
    </Link>
  );
};

export default UserCard;
