// CreatorCard Component - displays seller/creator information
// Shows avatar, name, and provides link to seller profile (placeholder for now)

import React from 'react';
import { Link } from 'react-router-dom';
import type { Creator } from '../../types';

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  // Default avatar when none provided
  const defaultAvatar = creator.avatar||'https://via.placeholder.com/64x64?text=User';

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-gray-900">{creator.name}</span>
      <Link to={`/user/${creator.id}`} className="shrink-0">
        <img
          src={creator.avatar || defaultAvatar}
          alt={`${creator.name}'s avatar`}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-blue-400 transition"
          style={{ cursor: 'pointer' }}
        />
      </Link>
    </div>
  );
};

export default CreatorCard;
