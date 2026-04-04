'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { 
  Loader2,
  Clock,
  Image as ImageIcon,
  ArrowLeft,
  Save
} from 'lucide-react'
import Link from 'next/link'

interface StaticService {
  id: string
  name: string
  description: string
  price: number
  duration: number
  image_url: string
  is_active: boolean
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

export default function AdminStaticServicesPage() {
  const [service, setService] = useState<StaticService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image_url: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchService()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('static_services')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (data && !error) {
        setService(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price?.toString() || '',
          duration: data.duration.toString(),
          image_url: data.image_url || ''
        })
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        throw error
      }
    } catch (error) {
      console.error('Error fetching static service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.duration) {
      alert('Please fill in name and duration')
      return
    }

    // Validate image URL if provided
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
        is_active: boolean
        price?: number
      } = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        image_url: formData.image_url,
        is_active: true,
        price: formData.price ? parseFloat(formData.price) : 0
      }

      if (service) {
        // Update existing service
        const { error } = await supabase
          .from('static_services')
          .update(serviceData)
          .eq('id', service.id)
        
        if (error) throw error
        
        // Update local state immediately
        setService({ ...service, ...serviceData })
      } else {
        // Create new service
        const { data, error } = await supabase
          .from('static_services')
          .insert(serviceData)
          .select()
          .single()
        
        if (error) throw error
        
        // Update local state with new service
        if (data) {
          setService(data)
        }
      }

      // Refresh from database to ensure consistency
      await fetchService()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error saving service')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!service) return
    if (!confirm('Are you sure you want to remove this static service?')) return

    try {
      const { error } = await supabase
        .from('static_services')
        .delete()
        .eq('id', service.id)
      
      if (error) throw error
      setService(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        image_url: ''
      })
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error deleting service')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading static service...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground">Static Service</h1>
          <p className="text-text-secondary font-light mt-2">
            This service will be displayed when Services Display Mode is set to Static
          </p>
        </div>
      </div>

      {/* Service Form */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">
                {service ? 'Edit Static Service' : 'Create Static Service'}
              </CardTitle>
              <CardDescription className="text-text-secondary font-light">
                {service 
                  ? 'Update your static service details below' 
                  : 'Set up a single static service to display on your website'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <Label htmlFor="price">Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="1500"
                  />
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

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-text-muted">Enter a URL for the service image</p>
              </div>

              {service && service.image_url && isValidImageUrl(service.image_url) && (
                <div className="space-y-2">
                  <Label>Current Image Preview</Label>
                  <div className="h-48 rounded-lg overflow-hidden bg-secondary/20">
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-hover w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Service
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}