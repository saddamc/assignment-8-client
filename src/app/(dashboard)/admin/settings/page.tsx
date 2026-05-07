import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminProfileForm } from '@/components/modules/Profile/AdminProfileForm';
import { Mail, Shield } from 'lucide-react';

export const metadata = {
  title: 'Admin Settings | Cabro',
  description: 'Manage your admin profile and settings',
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Admin Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your administrator account and profile
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
              Your email is used for account recovery and admin notifications
            </p>
          </CardContent>
        </Card>

        {/* Admin Profile Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile photo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminProfileForm
              initialData={{
                name: user.name || '',
                email: user.email,
                contactNumber: user.contactNumber ?? undefined,
                bio: user.bio ?? undefined,
                profilePhoto: user.profilePhoto ?? undefined,
              }}
            />
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-sm text-purple-900">🔐 Administrator Account</h3>
          <p className="text-sm text-purple-800 mt-1">
            As an administrator, your actions are logged for security purposes. Ensure
            your profile information is accurate and your account is secure.
          </p>
        </div>
      </div>
    </div>
  );
}
