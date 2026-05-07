import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SellerProfileForm } from '@/components/modules/Profile/SellerProfileForm';
import { Mail, Store } from 'lucide-react';

export const metadata = {
  title: 'Store Settings | Cabro',
  description: 'Manage your store information and settings',
};

export default async function SellerSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'SELLER') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Store Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your store information and profile
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
              Your email is used for account recovery and store notifications
            </p>
          </CardContent>
        </Card>

        {/* Store Settings Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              Update your store logo, name, description, and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SellerProfileForm
              initialData={{
                name: user.name || '',
                email: user.email,
                storeName: user.storeName,
                storeDescription: user.storeDescription,
                contactNumber: user.contactNumber,
                address: user.address,
                bio: user.bio,
                profilePhoto: user.profilePhoto,
              }}
            />
          </CardContent>
        </Card>

        {/* Info Sections */}
        <div className="mt-8 grid gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-sm text-blue-900">💼 Store Logo</h3>
            <p className="text-sm text-blue-800 mt-1">
              Your store logo appears in your store profile and customer communications.
              Use a clear, professional image for best results.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h3 className="font-semibold text-sm text-amber-900">📝 Store Description</h3>
            <p className="text-sm text-amber-800 mt-1">
              Write a compelling description of your store to help customers understand
              what you sell and why they should shop with you.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-semibold text-sm text-green-900">🔗 Contact Info</h3>
            <p className="text-sm text-green-800 mt-1">
              Keep your phone number and address up to date so customers can reach you
              with questions about your products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
