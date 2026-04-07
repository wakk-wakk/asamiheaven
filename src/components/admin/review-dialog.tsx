'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Save, Upload, X, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (review: {
    review_type: 'image' | 'text'
    image_url: string
    image_path: string
    review_text: string
    reviewer_name: string
    is_active: boolean
  }) => void
}

// Constants for file upload
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ReviewDialog({ open, onOpenChange, onSave }: ReviewDialogProps) {
  const [reviewType, setReviewType] = useState<'image' | 'text'>('image')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  
  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection and upload
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setUploadingImage(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not configured')
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `reviews/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from('reviews-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: undefined
        })

      if (error) throw error

      // Update state with the new path
      setImagePath(filePath)
      setUploadProgress(100)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      setUploadError(errorMessage)
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove uploaded image
  const removeImage = async () => {
    // If there's an existing image_path, delete it from storage
    if (imagePath) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)
          await supabase.storage
            .from('reviews-images')
            .remove([imagePath])
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    setImagePath('')
    setPreviewUrl(null)
    setUploadError(null)
  }

  const handleSave = () => {
    if (reviewType === 'image' && !imagePath && !previewUrl) {
      alert('Please upload a review screenshot')
      return
    }
    if (reviewType === 'text' && !reviewText) {
      alert('Please enter the review text')
      return
    }

    onSave({
      review_type: reviewType,
      image_url: '', // No longer using external URLs
      image_path: imagePath,
      review_text: reviewType === 'text' ? reviewText : '',
      reviewer_name: reviewerName,
      is_active: true
    })

    // Reset form
    setReviewType('image')
    setImageUrl('')
    setImagePath('')
    setReviewText('')
    setReviewerName('')
    setPreviewUrl(null)
    setUploadError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setReviewType('image')
      setImageUrl('')
      setImagePath('')
      setReviewText('')
      setReviewerName('')
      setPreviewUrl(null)
      setUploadError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Review</DialogTitle>
          <DialogDescription>
            Add a review screenshot or text testimonial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Review Type</Label>
            <div className="flex gap-3">
              <div
                className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  reviewType === 'image'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setReviewType('image')}
              >
                <div className="flex items-center justify-center mb-2">
                  <ImageIcon className="h-5 w-5 text-foreground" />
                </div>
                <p className="font-heading text-sm text-foreground">Image</p>
                <p className="text-xs text-text-secondary mt-1">Screenshot</p>
              </div>
              <div
                className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  reviewType === 'text'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setReviewType('text')}
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="font-heading text-sm text-foreground">Text</p>
                <p className="text-xs text-text-secondary mt-1">Testimonial</p>
              </div>
            </div>
          </div>

          {reviewType === 'image' ? (
            <div className="space-y-2">
              <Label>Review Screenshot</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 rounded-lg object-contain mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                      disabled={uploadingImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-text-muted mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm text-text-secondary">
                        Drag and drop a screenshot, or click to browse
                      </p>
                      <p className="text-xs text-text-muted">
                        JPEG, PNG, or WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
                
                {!previewUrl && (
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="review-image-upload"
                  />
                )}
                
                {!previewUrl && (
                  <Label
                    htmlFor="review-image-upload"
                    className="cursor-pointer"
                  >
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="pointer-events-none"
                      >
                        Choose Screenshot
                      </Button>
                    </div>
                  </Label>
                )}

                {uploadingImage && (
                  <div className="mt-4">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">Uploading...</p>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-4 flex items-center gap-2 text-error text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="review_text">Review Text *</Label>
                <Textarea
                  id="review_text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Enter the testimonial text..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewer_name">Reviewer Name (Optional)</Label>
                <Input
                  id="reviewer_name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={uploadingImage}
            className="bg-primary hover:bg-primary-hover"
          >
            {uploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}