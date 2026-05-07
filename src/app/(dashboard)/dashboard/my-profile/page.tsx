import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerProfileForm } from '@/components/modules/Profile/CustomerProfileForm';
import { SellerProfileForm } from '@/components/modules/Profile/SellerProfileForm';
import { AdminProfileForm } from '@/components/modules/Profile/AdminProfileForm';
import { Mail } from 'lucide-react';

export const metadata = {
  title: 'My Profile | Cabro',
  description: 'Manage your profile information and preferences',
};

interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  bio?: string;
  storeName?: string;
  storeDescription?: string;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and settings
          </p>
        </div>

        {/* Email Card */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your email is used for account recovery and notifications
            </p>
          </CardContent>
        </Card>

        {/* Profile Form Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile photo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.role === 'CUSTOMER' && (
              <CustomerProfileForm
                initialData={{
                  name: user.name || '',
                  email: user.email,
                  contactNumber: user.contactNumber,
                  address: user.address,
                  bio: user.bio,
                  profilePhoto: user.profilePhoto,
                }}
              />
            )}

            {user.role === 'SELLER' && (
              <SellerProfileForm
                initialData={{
                  name: user.name || '',
                  email: user.email,
                  contactNumber: user.contactNumber,
                  address: user.address,
                  bio: user.bio,
                  storeName: user.storeName,
                  storeDescription: user.storeDescription,
                  profilePhoto: user.profilePhoto,
                }}
              />
            )}

            {user.role === 'ADMIN' && (
              <AdminProfileForm
                initialData={{
                  name: user.name || '',
                  email: user.email,
                  contactNumber: user.contactNumber,
                  bio: user.bio,
                  profilePhoto: user.profilePhoto,
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-sm text-blue-900">💡 Tip</h3>
          <p className="text-sm text-blue-800 mt-1">
            Keep your profile information up to date to help other users get to know
            you better and to receive timely notifications and updates.
          </p>
        </div>
      </div>
    </div>
  );
}
