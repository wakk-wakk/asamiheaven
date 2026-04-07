'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2,
  Clock,
  Image as ImageIcon,
  Upload,
  X,
  AlertCircle
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
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
    fetchServices()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name')
      
      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get the display image URL for a service
  const getServiceImageUrl = (service: Service): string | null => {
    // Priority: image_path (Supabase Storage) > image_url (external)
    if (service.image_path) {
      const { data } = supabase.storage
        .from('services-images')
        .getPublicUrl(service.image_path)
      return data?.publicUrl || null
    }
    if (service.image_url && isValidImageUrl(service.image_url)) {
      return service.image_url
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
      const filePath = `services/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from('services-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: undefined // Fix for TypeScript error
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
          .from('services-images')
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
    if (!formData.name || !formData.duration) {
      alert('Please fill in name and duration')
      return
    }

    // Validate image URL if provided (for external URLs)
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      alert('Please enter a valid image URL (must start with http:// or https://)')
      return
    }

    setIsSaving(true)
    try {
      const serviceData: {
        name: string
        description: string
        duration: number
        image_url: string
        image_path: string
        is_active: boolean
        price?: number
      } = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        image_url: formData.image_url,
        image_path: formData.image_path,
        is_active: true
      }
      
      // Set price to 0 if not provided (to avoid NOT NULL constraint)
      serviceData.price = formData.price ? parseFloat(formData.price) : 0

      if (editingService) {
        // If replacing image, delete old image from storage
        if (editingService.image_path && formData.image_path !== editingService.image_path) {
          try {
            await supabase.storage
              .from('services-images')
              .remove([editingService.image_path])
          } catch (error) {
            console.error('Error deleting old image:', error)
          }
        }

        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData)
        
        if (error) throw error
      }

      setShowDialog(false)
      resetForm()
      fetchServices()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error saving service')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    
    // Get the current image for preview
    const currentImageUrl = getServiceImageUrl(service)
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl)
    } else {
      setPreviewUrl(null)
    }
    
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      image_url: service.image_url || '',
      image_path: service.image_path || ''
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      // Find the service to delete its image from storage
      const service = services.find(s => s.id === id)
      if (service?.image_path) {
        try {
          await supabase.storage
            .from('services-images')
            .remove([service.image_path])
        } catch (error) {
          console.error('Error deleting image from storage:', error)
        }
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error deleting service')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      image_url: '',
      image_path: ''
    })
    setEditingService(null)
    setPreviewUrl(null)
    setUploadError(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl text-foreground">Manage Services</h1>
              <p className="text-text-secondary font-light mt-2">Add, edit, and remove spa services</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={fetchServices}
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
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                    <DialogDescription>
                      {editingService ? 'Update service details' : 'Add a new spa service to your offerings'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Swedish Massage"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the service..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₱) - Optional</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="1500"
                      />
                      <p className="text-xs text-text-muted">Leave empty or set to 0 to hide price</p>
                    </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                          <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="60"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <Label>Service Image</Label>
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
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
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
                        'Save Service'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {services.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-12 text-center">
                <p className="text-text-secondary font-light">No services found. Add your first service!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const imageUrl = getServiceImageUrl(service)
                return (
                  <Card key={service.id} className="glass border-border">
                    {imageUrl ? (
                      <div className="h-48 overflow-hidden rounded-t-lg flex items-center justify-center bg-secondary/20">
                        <img 
                          src={imageUrl} 
                          alt={service.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-48 rounded-t-lg flex items-center justify-center bg-secondary/20">
                        <ImageIcon className="h-12 w-12 text-text-muted" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-heading text-xl text-foreground">
                            {service.name}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                            {service.price && service.price > 0 && (
                              <span>₱{service.price.toLocaleString()}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text-secondary text-sm font-light line-clamp-3">
                        {service.description}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(service)}
                          className="flex-1"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
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