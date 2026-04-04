'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { 
  Loader2,
  Image as ImageIcon,
  User,
  ArrowLeft,
  Save
} from 'lucide-react'
import Link from 'next/link'

interface StaticTherapist {
  id: string
  nickname: string
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

export default function AdminStaticTherapistsPage() {
  const [therapist, setTherapist] = useState<StaticTherapist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    image_url: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchTherapist()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchTherapist = async () => {
    try {
      const { data, error } = await supabase
        .from('static_therapists')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (data && !error) {
        setTherapist(data)
        setFormData({
          nickname: data.nickname,
          image_url: data.image_url || ''
        })
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        throw error
      }
    } catch (error) {
      console.error('Error fetching static therapist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.nickname) {
      alert('Please enter a nickname')
      return
    }

    // Validate image URL if provided
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      alert('Please enter a valid image URL (must start with http:// or https://)')
      return
    }

    setIsSaving(true)
    try {
      const therapistData: {
        nickname: string
        image_url: string
        is_active: boolean
      } = {
        nickname: formData.nickname,
        image_url: formData.image_url,
        is_active: true
      }

      if (therapist) {
        // Update existing therapist
        const { error } = await supabase
          .from('static_therapists')
          .update(therapistData)
          .eq('id', therapist.id)
        
        if (error) throw error
        
        // Update local state immediately
        setTherapist({ ...therapist, ...therapistData })
      } else {
        // Create new therapist
        const { data, error } = await supabase
          .from('static_therapists')
          .insert(therapistData)
          .select()
          .single()
        
        if (error) throw error
        
        // Update local state with new therapist
        if (data) {
          setTherapist(data)
        }
      }

      // Refresh from database to ensure consistency
      await fetchTherapist()
    } catch (error) {
      console.error('Error saving therapist:', error)
      alert('Error saving therapist')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!therapist) return
    if (!confirm('Are you sure you want to remove this static therapist?')) return

    try {
      const { error } = await supabase
        .from('static_therapists')
        .delete()
        .eq('id', therapist.id)
      
      if (error) throw error
      setTherapist(null)
      setFormData({
        nickname: '',
        image_url: ''
      })
    } catch (error) {
      console.error('Error deleting therapist:', error)
      alert('Error deleting therapist')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading static therapist...</p>
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
          <h1 className="font-heading text-3xl md:text-4xl text-foreground">Static Therapist</h1>
          <p className="text-text-secondary font-light mt-2">
            This therapist will be displayed when Therapists Display Mode is set to Static
          </p>
        </div>
      </div>

      {/* Therapist Form */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">
                {therapist ? 'Edit Static Therapist' : 'Create Static Therapist'}
              </CardTitle>
              <CardDescription className="text-text-secondary font-light">
                {therapist 
                  ? 'Update your static therapist details below' 
                  : 'Set up a single static therapist to display on your website'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">Therapist Nickname *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="e.g., Maria"
                />
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
                <p className="text-xs text-text-muted">Enter a URL for the therapist photo</p>
              </div>

              {(formData.image_url && isValidImageUrl(formData.image_url)) && (
                <div className="space-y-2">
                  <Label>Image Preview</Label>
                  <div className="h-64 rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
                    <img 
                      src={formData.image_url} 
                      alt={formData.nickname || 'Therapist preview'}
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
                      Save Therapist
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