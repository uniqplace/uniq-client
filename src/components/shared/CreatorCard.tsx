// CreatorCard Component - displays seller/creator information
// Shows avatarUrl, name, and provides link to seller profile (placeholder for now)
import React from 'react';
import { Link } from 'react-router-dom';
import type { Creator as BaseCreator, User } from '../../types';
import { Avatar } from 'primereact/avatar';

type Creator = BaseCreator & {
  followers?: number | User[];
};

// Helper function to get followers count
const getFollowersCount = (followers: unknown): number => {
  if (typeof followers === 'number') return followers;
  if (Array.isArray(followers)) return followers.length;
  return 1;
};

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const defaultAvatar = creator.avatarUrl || creator.name.charAt(0).toUpperCase();
  // Use the helper function to get followers count
  const followersCount = getFollowersCount(creator.followers);

  return (
    <div className="luxury-card p-4 bg-white/80 backdrop-blur-sm border border-neutral-200">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <Link to={`/user/${creator._id}`} className="shrink-0 relative group">
            <Avatar
              image={defaultAvatar}
              label={!creator.avatarUrl && creator.name ? creator.name.charAt(0).toUpperCase() : undefined}
              shape="circle"
              size="normal"
              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200 hover:border-brand-300 transition-all duration-200 group-hover:scale-105 shadow-soft"
              style={{ backgroundColor: !creator.avatarUrl ? '#d4a01f' : undefined, color: '#fff', fontSize: 20 }}
            />
            {followersCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5 border-2 border-white shadow-medium"
                style={{ minWidth: 20, minHeight: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="followers"
              >
                {followersCount}
              </span>
            )}
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-neutral-900 text-sm truncate">
              {creator.name}
            </span>
            <i className="pi pi-verified text-brand-500 text-xs"></i>
          </div>
          <p className="text-neutral-500 text-xs">
            {followersCount} follower{followersCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link 
          to={`/user/${creator._id}`}
          className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-xs font-medium hover:bg-brand-100 transition-colors duration-200 border border-brand-200"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default CreatorCard;
