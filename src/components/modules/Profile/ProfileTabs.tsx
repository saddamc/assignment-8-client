// components/modules/Profile/ProfileTabs.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerProfileForm } from './CustomerProfileForm';
import { SellerProfileForm } from './SellerProfileForm';
import { AdminProfileForm } from './AdminProfileForm';
import { SecurityTab } from './SecurityTab';
import { PreferencesTab } from './PreferencesTab';

const TABS = [
  { id: 'personal',     label: 'Personal',    Icon: User },
  { id: 'security',     label: 'Security',    Icon: Lock },
  { id: 'preferences',  label: 'Preferences', Icon: Settings },
];

type Profile = {
  role?: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  twoFactorEnabled?: boolean;
  locale?: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  bio?: string;
  profilePhoto?: string;
  storeName?: string;
  storeDescription?: string;
};

interface Props {
  profile: Profile;
}

export function ProfileTabs({ profile }: Props) {
  const [active, setActive] = useState('personal');
  const router = useRouter();

  const handleSuccess = async () => {
    router.refresh();
  };

  return (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-slate-100 px-6 overflow-x-auto" role="tablist">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            onClick={() => setActive(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3.5 text-sm border-b-2 whitespace-nowrap transition-colors',
              active === id
                ? 'border-slate-900 text-slate-900 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="p-6">
        {active === 'personal' && (
          <>
            {profile.role === 'CUSTOMER' && (
              <CustomerProfileForm initialData={profile} onSuccess={handleSuccess} />
            )}
            {profile.role === 'SELLER' && (
              <SellerProfileForm initialData={profile} onSuccess={handleSuccess} />
            )}
            {profile.role === 'ADMIN' && (
              <AdminProfileForm initialData={profile} onSuccess={handleSuccess} />
            )}
          </>
        )}
        {active === 'security'    && <SecurityTab    profile={profile} />}
        {active === 'preferences' && <PreferencesTab profile={profile} />}
      </div>
    </>
  );
}