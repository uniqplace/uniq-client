// CreatorCard Component - displays seller/creator information
// Shows avatar, name, and provides link to seller profile (placeholder for now)

import React from 'react';
import { Link } from 'react-router-dom';
// Extend Creator type to allow followers property for this component
import type { Creator as BaseCreator } from '../../types';

type Creator = BaseCreator & {
  followers?: number;
};

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  // Default avatar when none provided
  const defaultAvatar = creator.avatar||'https://via.placeholder.com/64x64?text=User';

  // Support both number and array for followers, always return a number
  const followersCount =
    typeof creator.followers === 'number'
      ? creator.followers
      : Array.isArray(creator.followers)
        ? (creator.followers as any[]).length
        : 1;

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-gray-900">{creator.name}</span>
      <Link to={`/user/${creator.id}`} className="shrink-0 relative">
        <img
          src={defaultAvatar}
          alt={`${creator.name}'s avatar`}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-blue-400 transition"
          style={{ cursor: 'pointer' }}
        />
        {followersCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5 border border-white shadow"
            style={{ minWidth: 18, minHeight: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="עוקבים"
          >
            {followersCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default CreatorCard;
