export interface UploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export const uploadImageToCloudinary = async (
  file: File,
  uploadPreset: string = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'luxe_commerce'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Image upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteImageFromCloudinary = async (publicId: string) => {
  try {
    // Note: Deletion via frontend is not secure. This should be done server-side.
    // This function is for reference only. Use the backend endpoint instead.
    console.warn('Use server-side deletion endpoint for security');
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
