'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Leaf, Clock, Heart, Image as ImageIcon, User, Star, Zap, Calendar, MessageCircle, Copy, ExternalLink, MessageSquare } from 'lucide-react'

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
import { createClient } from '@supabase/supabase-js'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  image_url: string
  image_path: string
  is_active: boolean
}

interface Therapist {
  id: string
  nickname: string
  image_url: string
  image_path: string
  is_active: boolean
}

interface Review {
  id: string
  review_type: 'image' | 'text'
  image_url: string | null
  image_path: string | null
  review_text: string | null
  reviewer_name: string | null
  is_active: boolean
}

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

interface DisplaySettings {
  services_mode: 'static' | 'dynamic'
  therapists_mode: 'static' | 'dynamic'
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true)
  const [displayedTherapistsCount, setDisplayedTherapistsCount] = useState(8)
  const [totalTherapistsCount, setTotalTherapistsCount] = useState(0)
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    services_mode: 'dynamic',
    therapists_mode: 'dynamic'
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [viberValue, setViberValue] = useState<string>('')
  const [whatsappValue, setWhatsappValue] = useState<string>('')
  const [facebookValue, setFacebookValue] = useState<string>('')
  const [telegramValue, setTelegramValue] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      setIsLoadingServices(false)
      setIsLoadingTherapists(false)
      setIsLoadingReviews(false)
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const fetchDisplaySettings = async () => {
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
        console.error('Error fetching display settings:', error)
      }
    }

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name')
          .limit(20)
        
        if (data && !error) {
          setServices(data)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    const fetchStaticServices = async () => {
      try {
        const { data, error } = await supabase
          .from('static_services')
          .select('*')
          .eq('is_active', true)
          .single()
        
        if (data && !error) {
          setServices([data])
        }
      } catch (error) {
        console.error('Error fetching static services:', error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    const fetchTherapists = async () => {
      try {
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('is_active', true)
          .order('nickname')
          .limit(20)
        
        if (data && !error) {
          setTherapists(data)
          setTotalTherapistsCount(data.length)
        }
      } catch (error) {
        console.error('Error fetching therapists:', error)
      } finally {
        setIsLoadingTherapists(false)
      }
    }

    const fetchStaticTherapists = async () => {
      try {
        const { data, error } = await supabase
          .from('static_therapists')
          .select('*')
          .eq('is_active', true)
          .single()
        
        if (data && !error) {
          setTherapists([data])
        }
      } catch (error) {
        console.error('Error fetching static therapists:', error)
      } finally {
        setIsLoadingTherapists(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
        
        if (data && !error) {
          setReviews(data)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    const fetchContactSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_settings')
          .select('viber, whatsapp, facebook, telegram')
          .single()
        
        if (data && !error) {
          if (data.viber) {
            setViberValue(data.viber)
          }
          if (data.whatsapp) {
            setWhatsappValue(data.whatsapp)
          }
          if (data.facebook) {
            setFacebookValue(data.facebook)
          }
          if (data.telegram) {
            setTelegramValue(data.telegram)
          }
        }
      } catch (error) {
        console.error('Error fetching contact settings:', error)
      }
    }

    const initPage = async () => {
      try {
        const { data: settingsData } = await supabase
          .from('display_settings')
          .select('*')
          .single()
        
        const servicesMode = settingsData?.services_mode || 'dynamic'
        const therapistsMode = settingsData?.therapists_mode || 'dynamic'
        
        setDisplaySettings({
          services_mode: servicesMode,
          therapists_mode: therapistsMode
        })

        if (servicesMode === 'static') {
          await fetchStaticServices()
        } else {
          await fetchServices()
        }

        if (therapistsMode === 'static') {
          await fetchStaticTherapists()
        } else {
          await fetchTherapists()
        }
      } catch (error) {
        console.error('Error initializing page:', error)
        await fetchServices()
        await fetchTherapists()
      }
      
      await fetchReviews()
    }

    initPage()
    fetchContactSettings()
  }, [])

  // Clean phone number - remove all non-numeric characters except +
  const cleanPhoneNumber = (phone: string): string => {
    // If it's a URL, return as is
    if (isUrl(phone)) {
      return phone
    }
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '')
    // If it doesn't start with +, add the country code (Philippines +63)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        // Replace leading 0 with +63 (Philippines country code)
        cleaned = '+63' + cleaned.substring(1)
      } else if (!cleaned.startsWith('63')) {
        cleaned = '+63' + cleaned
      } else {
        cleaned = '+' + cleaned
      }
    }
    return cleaned
  }

  // Helper function to check if a value is a URL
  const isUrl = (value: string): boolean => {
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('www.')
  }

  // Helper function to format URL if it doesn't have protocol
  const formatUrl = (value: string): string => {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value
    }
    if (value.startsWith('www.')) {
      return `https://${value}`
    }
    return `https://${value}`
  }

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(label + ' copied to clipboard: ' + text)
    } catch (err) {
      console.error('Failed to copy:', err)
      window.prompt('Copy ' + label + ' to clipboard:', text)
    }
  }

  // Handle Viber click - open app on mobile, copy on desktop
  const handleViberClick = () => {
    if (!viberValue) return
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    let phoneNumber = cleanPhoneNumber(viberValue).replace(/^\+/, '').replace(/^63/, '').replace(/^0/, '')
    phoneNumber = '63' + phoneNumber
    
    if (isMobile) {
      // Open Viber app on mobile with correct format
      const viberAppUrl = `viber://chat?number=${phoneNumber}`
      window.location.href = viberAppUrl
    } else {
      // Copy to clipboard on desktop
      copyToClipboard(viberValue, 'Viber')
    }
  }

  // Handle Facebook click - open Facebook page/messenger
  const handleFacebookClick = () => {
    if (!facebookValue) return
    
    if (isUrl(facebookValue)) {
      const url = formatUrl(facebookValue)
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // If it's not a URL, treat it as a Facebook username/page
      const fbUrl = `https://www.facebook.com/${facebookValue}`
      window.open(fbUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Handle Telegram click - open Telegram chat
  const handleTelegramClick = () => {
    if (!telegramValue) return
    
    if (isUrl(telegramValue)) {
      window.open(formatUrl(telegramValue), '_blank', 'noopener,noreferrer')
    } else {
      const telegramUrl = `https://t.me/${telegramValue.replace('@', '')}`
      window.open(telegramUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Get the display image URL for a service (Supabase Storage or external URL)
  const getServiceImageUrl = (service: Service): string | null => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (service.image_path && typeof service.image_path === 'string' && supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/services-images/${service.image_path}`
    }
    if (service.image_url && typeof service.image_url === 'string' && isValidImageUrl(service.image_url)) {
      return service.image_url
    }
    return null
  }

  // Get the display image URL for a therapist (Supabase Storage or external URL)
  const getTherapistImageUrl = (therapist: Therapist): string | null => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (therapist.image_path && typeof therapist.image_path === 'string' && supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/therapists-images/${therapist.image_path}`
    }
    if (therapist.image_url && typeof therapist.image_url === 'string' && isValidImageUrl(therapist.image_url)) {
      return therapist.image_url
    }
    return null
  }

  // Handle WhatsApp click - open WhatsApp app with initiation message
  const handleWhatsappClick = () => {
    if (!whatsappValue) return
    
    if (isUrl(whatsappValue)) {
      // If it's already a URL, open it directly
      const url = formatUrl(whatsappValue)
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Clean the phone number
      const phoneNumber = cleanPhoneNumber(whatsappValue)
      const message = encodeURIComponent("Hello! I'm interested in your services. Could you please provide more information?")
      
      // Use WhatsApp's official click-to-chat URL
      // Remove the + from phone number for wa.me URL
      const cleanNumber = phoneNumber.replace('+', '')
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`
      
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }
  return (
  <div className="animate-fade-in">
    {/* Floating WhatsApp Button */}
    {whatsappValue && (
      <button
        onClick={handleWhatsappClick}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-primary hover:bg-primary-hover text-background rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm font-light">WhatsApp</span>
      </button>
    )}

    {/* Hero Section */}
    <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center px-2 md:px-4 overflow-hidden">
      {/* your hero content stays unchanged */}
    </section>

    {/* CONDITIONAL CONTENT */}
    {displaySettings.services_mode === 'static' &&
    displaySettings.therapists_mode === 'static' &&
    services.length > 0 &&
    therapists.length > 0 ? (
      
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* STATIC CONTENT (unchanged) */}
        </div>
      </section>

    ) : (
      <>
        {/* ===== THERAPISTS SECTION ===== */}
        <section className="py-16 md:py-20 px-4 relative overflow-hidden">
          {/* your therapists code unchanged */}
        </section>

        {/* ===== SERVICES SECTION ===== */}
        <section className="py-12 md:py-16 px-4 relative overflow-hidden">
          {/* your services code unchanged */}
        </section>

        {/* ===== REVIEWS SECTION ===== */}
        {!isLoadingReviews && reviews.length > 0 && (
          <section className="py-16 md:py-20 px-4 overflow-hidden">
            {/* your reviews code unchanged */}
          </section>
        )}

        {/* ===== CTA SECTION ===== */}
        <section className="py-12 px-4 relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              
              <div className="w-full md:w-1/2">
                <img
                  src="/og-image.jpg"
                  className="w-full h-64 md:h-80 object-cover rounded-2xl"
                />
              </div>

              <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <h2 className="font-heading text-3xl md:text-5xl text-foreground">
                  Ready to <span className="text-primary">Relax</span>?
                </h2>

                <p className="text-text-secondary">
                  Contact us today and discover the art of true relaxation.
                </p>

                <div className="flex gap-4">
                  <Button onClick={() => router.push('/contact')}>
                    Contact Us
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/services')}>
                    View Services
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    )}
  </div>
  )
}
  
   
        