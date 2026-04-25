'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { ReviewDialog } from '@/components/admin/review-dialog'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  LogOut, 
  RefreshCw, 
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3,
  Save,
  MessageCircle,
  Globe,
  Award,
  LayoutGrid,
  Database
} from 'lucide-react'

// Social media icon components using SVG
const InstagramIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const TelegramIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-1.07.495-1.532.474z"/>
  </svg>
)

interface ContactSettings {
  phone: string
  email: string
  address: string
  viber: string
  whatsapp: string
  instagram: string
  facebook: string
  twitter: string
  youtube: string
  telegram: string
  website: string
}

interface DisplaySettings {
  services_mode: 'static' | 'dynamic'
  therapists_mode: 'static' | 'dynamic'
}

interface Review {
  id: string
  review_type: 'image' | 'text'
  image_url: string | null
  image_path: string | null
  review_text: string | null
  reviewer_name: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showContactEditor, setShowContactEditor] = useState(false)
  const [showDisplaySettingsEditor, setShowDisplaySettingsEditor] = useState(false)
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    phone: '+1 (555) 123-4567',
    email: 'hello@asamihaven.com',
    address: '123 Serenity Lane, Wellness City, WC 12345',
    viber: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    telegram: '',
    website: ''
  })
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    services_mode: 'dynamic',
    therapists_mode: 'dynamic'
  })
  const [isSavingDisplaySettings, setIsSavingDisplaySettings] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewsEditor, setShowReviewsEditor] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadContactSettings()
    loadDisplaySettings()
    fetchReviews()
    setIsLoading(false)
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const loadContactSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .single()
      
      if (data && !error) {
        setContactSettings(data)
      }
    } catch (error) {
      console.log('No contact settings found, using defaults')
    }
  }

  const saveContactSettings = async () => {
    setIsSavingContact(true)
    try {
      // Upsert contact settings
      const { error } = await supabase
        .from('contact_settings')
        .upsert({ id: 1, ...contactSettings })
      
      if (error) throw error
      
      // Trigger event to refresh footer contact info
      window.dispatchEvent(new CustomEvent('contactSettingsUpdated'))
      
      setShowContactEditor(false)
    } catch (error) {
      console.error('Error saving contact settings:', error)
    } finally {
      setIsSavingContact(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const loadDisplaySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('display_settings')
        .select('*')
        .single()
      
      if (data && !error) {
        setDisplaySettings({
          services_mode: data.services_mode || 'dynamic',
          therapists_mode: data.therapists_mode || 'dynamic'
        })
      }
    } catch (error) {
      console.log('No display settings found, using defaults')
    }
  }

  const handleSaveReview = async (reviewData: {
    review_type: 'image' | 'text'
    image_url: string
    image_path: string
    review_text: string
    reviewer_name: string
    is_active: boolean
  }) => {
    try {
      const dataToSave = {
        review_type: reviewData.review_type,
        image_url: null,
        image_path: reviewData.image_path,
        review_text: reviewData.review_type === 'text' ? reviewData.review_text : null,
        reviewer_name: reviewData.reviewer_name || null,
        is_active: reviewData.is_active,
        display_order: reviews.length
      }

      const { error } = await supabase
        .from('reviews')
        .insert(dataToSave)

      if (error) throw error

      setShowReviewsEditor(false)
      fetchReviews()
    } catch (error) {
      console.error('Error saving review:', error)
      alert('Error saving review')
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Error deleting review')
    }
  }

  const toggleReviewActive = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_active: !currentStatus })
        .eq('id', reviewId)

      if (error) throw error
      fetchReviews()
    } catch (error) {
      console.error('Error toggling review status:', error)
    }
  }

  const saveDisplaySettings = async () => {
    setIsSavingDisplaySettings(true)
    try {
      const { error } = await supabase
        .from('display_settings')
        .upsert({ 
          id: 1, 
          services_mode: displaySettings.services_mode,
          therapists_mode: displaySettings.therapists_mode
        })
      
      if (error) throw error
      
      // Trigger event to refresh display
      window.dispatchEvent(new CustomEvent('displaySettingsUpdated'))
      
      setShowDisplaySettingsEditor(false)
    } catch (error) {
      console.error('Error saving display settings:', error)
    } finally {
      setIsSavingDisplaySettings(false)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading dashboard...</p>
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
              <h1 className="font-heading text-3xl md:text-4xl text-foreground">Admin Dashboard</h1>
              <p className="text-text-secondary font-light mt-2">Manage your spa contact info and reviews</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/services')}
                className="border-border hover:border-primary/50 hover:text-primary"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Manage Services
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/therapists')}
                className="border-border hover:border-primary/50 hover:text-primary"
              >
                <User className="h-4 w-4 mr-2" />
                Manage Models
              </Button>
              <Dialog open={showContactEditor} onOpenChange={setShowContactEditor}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border hover:border-primary/50 hover:text-primary"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Contact Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Contact Information</DialogTitle>
                    <DialogDescription>
                      Update your spa contact details and social media links.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={contactSettings.phone}
                          onChange={(e) => setContactSettings(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactSettings.email}
                          onChange={(e) => setContactSettings(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="hello@asamihaven.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={contactSettings.address}
                        onChange={(e) => setContactSettings(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Serenity Lane, Wellness City"
                      />
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-heading text-lg text-foreground mb-4">Social Media & Messaging</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" /> Viber
                          </Label>
                          <Input
                            value={contactSettings.viber}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, viber: e.target.value }))}
                            placeholder="Viber number or link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                          </Label>
                          <Input
                            value={contactSettings.whatsapp}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                            placeholder="WhatsApp number or link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <InstagramIcon /> Instagram
                          </Label>
                          <Input
                            value={contactSettings.instagram}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, instagram: e.target.value }))}
                            placeholder="Instagram username or link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FacebookIcon /> Facebook
                          </Label>
                          <Input
                            value={contactSettings.facebook}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, facebook: e.target.value }))}
                            placeholder="Facebook page link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <TwitterIcon /> Twitter / X
                          </Label>
                          <Input
                            value={contactSettings.twitter}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, twitter: e.target.value }))}
                            placeholder="Twitter username or link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <YoutubeIcon /> YouTube
                          </Label>
                          <Input
                            value={contactSettings.youtube}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, youtube: e.target.value }))}
                            placeholder="YouTube channel link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <TelegramIcon /> Telegram
                          </Label>
                          <Input
                            value={contactSettings.telegram}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, telegram: e.target.value }))}
                            placeholder="Telegram username or link"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Website
                          </Label>
                          <Input
                            value={contactSettings.website}
                            onChange={(e) => setContactSettings(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowContactEditor(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveContactSettings} 
                      disabled={isSavingContact}
                      className="bg-primary hover:bg-primary-hover"
                    >
                      {isSavingContact ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </div>
          </div>
        </div>
      </div>


      {/* Display Settings Dialog */}
      <Dialog open={showDisplaySettingsEditor} onOpenChange={setShowDisplaySettingsEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Display Settings</DialogTitle>
            <DialogDescription>
              Choose how services and therapists are displayed on your website.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Services Display Mode</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    displaySettings.services_mode === 'static'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setDisplaySettings(prev => ({ ...prev, services_mode: 'static' }))}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Edit3 className="h-5 w-5 text-foreground" />
                  </div>
                  <p className="font-heading text-sm text-foreground">Static</p>
                  <p className="text-xs text-text-secondary mt-1">Manual content</p>
                </button>
                <button
                  type="button"
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    displaySettings.services_mode === 'dynamic'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setDisplaySettings(prev => ({ ...prev, services_mode: 'dynamic' }))}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-5 w-5 text-foreground" />
                  </div>
                  <p className="font-heading text-sm text-foreground">Dynamic</p>
                  <p className="text-xs text-text-secondary mt-1">Database content</p>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Therapists Display Mode</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    displaySettings.therapists_mode === 'static'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setDisplaySettings(prev => ({ ...prev, therapists_mode: 'static' }))}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Edit3 className="h-5 w-5 text-foreground" />
                  </div>
                  <p className="font-heading text-sm text-foreground">Static</p>
                  <p className="text-xs text-text-secondary mt-1">Manual content</p>
                </button>
                <button
                  type="button"
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    displaySettings.therapists_mode === 'dynamic'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setDisplaySettings(prev => ({ ...prev, therapists_mode: 'dynamic' }))}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-5 w-5 text-foreground" />
                  </div>
                  <p className="font-heading text-sm text-foreground">Dynamic</p>
                  <p className="text-xs text-text-secondary mt-1">Database content</p>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisplaySettingsEditor(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveDisplaySettings} 
              disabled={isSavingDisplaySettings}
              className="bg-primary hover:bg-primary-hover"
            >
              {isSavingDisplaySettings ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Section */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <Card className="glass border-border">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="font-heading text-xl text-foreground">Reviews</CardTitle>
                  <CardDescription className="text-text-secondary font-light">
                    {reviews.length} reviews managed
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowReviewsEditor(true)}
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-secondary font-light">No reviews added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviews.map((review) => {
                    // Get the image URL from Supabase Storage if image_path exists
                    const getImageUrl = () => {
                      if (review.image_path) {
                        const { data } = supabase.storage
                          .from('reviews-images')
                          .getPublicUrl(review.image_path)
                        return data?.publicUrl
                      }
                      return review.image_url
                    }
                    const imageUrl = getImageUrl()

                    return (
                      <Card key={review.id} className="glass border-border flex flex-col">
                        <CardContent className="p-4 flex flex-col flex-grow">
                          {review.review_type === 'image' && imageUrl ? (
                            <div className="flex-grow min-h-0">
                              <div className="h-40 rounded-lg overflow-hidden bg-secondary/10">
                                <img 
                                  src={imageUrl} 
                                  alt="Review screenshot"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex-grow">
                              <p className="text-foreground font-light line-clamp-3">
                                {review.review_text}
                              </p>
                              {review.reviewer_name && (
                                <p className="text-text-secondary text-sm mt-2">— {review.reviewer_name}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-auto pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleReviewActive(review.id, review.is_active)}
                              className="flex-1"
                            >
                              {review.is_active ? 'Hide' : 'Unhide'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteReview(review.id)}
                              className="text-error hover:text-error"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Dialog */}
      <ReviewDialog 
        open={showReviewsEditor}
        onOpenChange={setShowReviewsEditor}
        onSave={handleSaveReview}
      />
    </div>
  )
}
