'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateProfile } from '@/services/profile/updateProfile';

const adminProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactNumber: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type AdminProfileFormData = z.infer<typeof adminProfileSchema>;

interface AdminProfileFormProps {
  initialData: {
    name?: string;
    email?: string;
    contactNumber?: string;
    bio?: string;
    profilePhoto?: string;
  };
  onSuccess?: () => void;
}

export function AdminProfileForm({
  initialData,
  onSuccess,
}: AdminProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    initialData.profilePhoto || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.profilePhoto || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProfileFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: initialData.name || '',
      contactNumber: initialData.contactNumber || '',
      bio: initialData.bio || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: AdminProfileFormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      if (imageFile) {
        formData.append('file', imageFile);
      }

      const response = await updateProfile(formData);

      if (response.success) {
        toast.success('Admin profile updated successfully!');
        setImageFile(null);
        if (response.data?.profilePhoto) setProfileImage(response.data.profilePhoto);
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Profile Photo</Label>
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-sm">No image</div>
            )}
          </div>
          <div>
            <Label
              htmlFor="profileImage"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Change Photo
            </Label>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Max 5MB, JPG or PNG
            </p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">
          Full Name *
        </Label>
        <Input
          id="name"
          placeholder="Admin Name"
          {...register('name')}
          className="rounded-lg"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Contact Number */}
      <div className="space-y-2">
        <Label htmlFor="contactNumber" className="text-base font-semibold">
          Phone Number
        </Label>
        <Input
          id="contactNumber"
          placeholder="+1 (555) 123-4567"
          {...register('contactNumber')}
          className="rounded-lg"
          disabled={isLoading}
        />
        {errors.contactNumber && (
          <p className="text-sm text-red-500">
            {errors.contactNumber.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-base font-semibold">
          Bio
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          rows={4}
          {...register('bio')}
          className="rounded-lg resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Maximum 500 characters
        </p>
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg"
        size="lg"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
