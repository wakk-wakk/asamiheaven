'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import {
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface Therapist {
  id: string
  nickname: string
  image_url: string
  image_path: string
  is_active: boolean
  created_at: string
}

// Validate image URL to prevent infinite loop errors
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Constants for file upload
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    image_url: '',
    image_path: ''
  })
  
  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchTherapists()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('nickname')
      
      if (error) throw error
      setTherapists(data || [])
    } catch (error) {
      console.error('Error fetching therapists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get the display image URL for a therapist
  const getTherapistImageUrl = (therapist: Therapist): string | null => {
    // Priority: image_path (Supabase Storage) > image_url (external)
    if (therapist.image_path) {
      const { data } = supabase.storage
        .from('therapists-images')
        .getPublicUrl(therapist.image_path)
      return data?.publicUrl || null
    }
    if (therapist.image_url && isValidImageUrl(therapist.image_url)) {
      return therapist.image_url
    }
    return null
  }

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
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `therapists/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from('therapists-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: undefined
        })

      if (error) throw error

      // Update form data with the new path
      setFormData(prev => ({ ...prev, image_path: filePath, image_url: '' }))
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
    if (formData.image_path) {
      try {
        await supabase.storage
          .from('therapists-images')
          .remove([formData.image_path])
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    setFormData(prev => ({ ...prev, image_path: '', image_url: '' }))
    setPreviewUrl(null)
    setUploadError(null)
  }

  const handleSave = async () => {
    if (!formData.nickname) {
      alert('Please enter a nickname')
      return
    }

    // Validate image URL if provided (for external URLs)
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      alert('Please enter a valid image URL (must start with http:// or https://)')
      return
    }

    setIsSaving(true)
    try {
      const therapistData = {
        nickname: formData.nickname,
        image_url: formData.image_url,
        image_path: formData.image_path,
        is_active: true
      }

      if (editingTherapist) {
        // If replacing image, delete old image from storage
        if (editingTherapist.image_path && formData.image_path !== editingTherapist.image_path) {
          try {
            await supabase.storage
              .from('therapists-images')
              .remove([editingTherapist.image_path])
          } catch (error) {
            console.error('Error deleting old image:', error)
          }
        }

        const { error } = await supabase
          .from('therapists')
          .update(therapistData)
          .eq('id', editingTherapist.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('therapists')
          .insert(therapistData)
        
        if (error) throw error
      }

      setShowDialog(false)
      resetForm()
      fetchTherapists()
    } catch (error) {
      console.error('Error saving therapist:', error)
      alert('Error saving therapist')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (therapist: Therapist) => {
    setEditingTherapist(therapist)
    
    // Get the current image for preview
    const currentImageUrl = getTherapistImageUrl(therapist)
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl)
    } else {
      setPreviewUrl(null)
    }
    
    setFormData({
      nickname: therapist.nickname,
      image_url: therapist.image_url || '',
      image_path: therapist.image_path || ''
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    try {
      if (!confirm('Are you sure you want to permanently delete this therapist? This action cannot be undone.')) return

      const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      fetchTherapists()
    } catch (error) {
      console.error('Error deleting therapist:', error)
      alert('Error deleting therapist')
    }
  }

  const resetForm = () => {
    setFormData({
      nickname: '',
      image_url: '',
      image_path: ''
    })
    setEditingTherapist(null)
    setPreviewUrl(null)
    setUploadError(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading therapists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl text-foreground">Manage Models</h1>
              <p className="text-text-secondary font-light mt-2">Add, edit, and remove models</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={fetchTherapists}
                className="border-border hover:border-primary/50 hover:text-primary"
              >
                Refresh
              </Button>
              <Dialog open={showDialog} onOpenChange={(open) => {
                setShowDialog(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTherapist ? 'Edit Model' : 'Add New Model'}</DialogTitle>
                    <DialogDescription>
                      {editingTherapist ? 'Update model details' : 'Add a new model to your team'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname *</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                        placeholder="e.g., Maria"
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <Label>Therapist Photo</Label>
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
                                Drag and drop an image, or click to browse
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
                            id="image-upload"
                          />
                        )}
                        
                        {!previewUrl && (
                          <Label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <div className="mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="pointer-events-none"
                              >
                                Choose Image
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving || uploadingImage}
                      className="bg-primary hover:bg-primary-hover"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Model'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Therapists Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {therapists.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-12 text-center">
                <p className="text-text-secondary font-light">No models found. Add your first model!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {therapists.map((therapist) => {
                const imageUrl = getTherapistImageUrl(therapist)
                return (
                  <Card key={therapist.id} className="glass border-border flex flex-col">
                    {imageUrl ? (
                      <div className="aspect-square overflow-hidden rounded-t-lg flex items-center justify-center bg-secondary/20">
                        <img 
                          src={imageUrl} 
                          alt={therapist.nickname}
                          className="min-w-full min-h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-t-lg flex items-center justify-center bg-secondary/20">
                        <ImageIcon className="h-16 w-16 text-text-muted" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="font-heading text-lg text-foreground">
                              {therapist.nickname}
                            </CardTitle>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${therapist.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {therapist.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <div className="flex gap-1 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(therapist)}
                          className="flex-1"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(therapist.id)}
                          className="text-error hover:text-error hover:border-error/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}