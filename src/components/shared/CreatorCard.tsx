// CreatorCard Component - displays seller/creator information
// Shows avatar, name, and provides link to seller profile (placeholder for now)

import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../shared';
import type { Creator } from '../../types';

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  // Default avatar when none provided
  const defaultAvatar = 'https://via.placeholder.com/64x64?text=User';

  return (
    <Card className="creator-card">
      <div className="flex items-center space-x-4">
        {/* Creator Avatar */}
        <img
          src={creator.avatarUrl || defaultAvatar}
          alt={`${creator.name}'s avatar`}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
        
        {/* Creator Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{creator.name}</h3>
          <p className="text-sm text-gray-500">Seller</p>
          
          {/* Profile Link - placeholder route that doesn't do anything yet */}
          <Link
            to={`/user/${creator.id}`}
            className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Profile →
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default CreatorCard;
