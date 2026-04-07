# Supabase Storage Setup for Service Images

This guide will help you set up Supabase Storage to handle image uploads for your services.

## Step 1: Run the Database Migration

First, run the migration to add the `image_path` column to your services table:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/add_image_path_to_services.sql`
4. Click **Run** to execute the migration

## Step 2: Create the Storage Bucket

1. In your Supabase dashboard, go to **Storage** (in the left sidebar)
2. Click **New bucket**
3. Fill in the details:
   - **Name**: `services-images`
   - **Public**: ✅ (check this box - makes files publicly accessible)
   - **File size limit**: `5242880` (5MB in bytes)
4. Click **Save**

## Step 3: Configure Storage Policies

You need to set up Row Level Security (RLS) policies to control who can upload, update, and delete files.

### 3.1: Enable RLS on the Bucket

1. In the Storage section, click on the `services-images` bucket
2. Go to the **Policies** tab
3. Click **Enable RLS** (if not already enabled)

### 3.2: Add Upload Policy (for authenticated users)

1. Click **New policy**
2. Select **Insert** operation
3. Choose **For authenticated users only**
4. Name: `Allow authenticated users to upload files`
5. Policy definition (SQL):
```sql
bucket_id = 'services-images'::text AND auth.role() = 'authenticated'::text
```
6. Click **Save**

### 3.3: Add Update Policy (for authenticated users)

1. Click **New policy**
2. Select **Update** operation
3. Choose **For authenticated users only**
4. Name: `Allow authenticated users to update files`
5. Policy definition (SQL):
```sql
bucket_id = 'services-images'::text AND auth.role() = 'authenticated'::text
```
6. Click **Save**

### 3.4: Add Delete Policy (for authenticated users)

1. Click **New policy**
2. Select **Delete** operation
3. Choose **For authenticated users only**
4. Name: `Allow authenticated users to delete files`
5. Policy definition (SQL):
```sql
bucket_id = 'services-images'::text AND auth.role() = 'authenticated'::text
```
6. Click **Save**

### 3.5: Add Select Policy (for public access)

1. Click **New policy**
2. Select **Select** operation
3. Choose **For all users (public)**
4. Name: `Allow public to view files`
5. Policy definition (SQL):
```sql
bucket_id = 'services-images'::text
```
6. Click **Save**

## Step 4: Test the Setup

### Quick Test in Supabase Dashboard

1. Go to the `services-images` bucket in Storage
2. Click **Upload** and upload a test image
3. After upload, click on the file and copy the **Public URL**
4. Open the URL in a new tab - it should display the image

### Test in Your Application

1. Start your development server: `npm run dev`
2. Log in to the admin panel (`/admin/login`)
3. Go to **Manage Services** (`/admin/services`)
4. Click **Add Service**
5. In the image upload section, click **Choose Image** and select an image file
6. You should see:
   - A preview of the image
   - An upload progress bar
   - The image saved when you click **Save Service**

## Troubleshooting

### Error: "Permission denied"

If you get permission errors when uploading:
1. Double-check that all RLS policies are correctly set up
2. Ensure the user is authenticated (logged in to admin)
3. Verify the bucket name is exactly `services-images`

### Error: "Bucket not found"

If you get a bucket not found error:
1. Make sure you created the bucket with the exact name `services-images`
2. Check that the bucket is in the same Supabase project as your database

### Images not displaying

If images upload but don't display:
1. Check that the bucket is set to **Public**
2. Verify the Select policy allows public access
3. Check browser console for any CORS errors

## Migration from External URLs

If you have existing services with external image URLs:

1. **Keep existing URLs**: The system will continue to work with existing `image_url` values
2. **Gradual migration**: As you edit services, you can upload new images which will replace the external URLs
3. **Manual migration**: You can manually upload images and update the `image_path` field in the database

## Best Practices

1. **Image Optimization**: Before uploading, optimize images to reduce file size (aim for <500KB per image)
2. **Consistent Dimensions**: Use consistent aspect ratios for service images (e.g., 16:9 or 4:3)
3. **Descriptive Filenames**: The system auto-generates unique filenames, but you can rename files in Storage if needed
4. **Regular Backups**: Supabase automatically backs up storage files, but consider downloading important images

## Storage Limits (Free Tier)

- **Storage Space**: 1 GB total
- **Estimated capacity**: 
  - ~2,000 images at 500KB each
  - Your 15 images + 2 videos will use approximately 30-50MB

## Next Steps

After setting up storage, you might want to:

1. Add image upload to other sections (therapists, reviews, etc.)
2. Implement image compression before upload
3. Add drag-and-drop functionality
4. Create an image gallery/manager in the admin panel