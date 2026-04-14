'use client'

import { useEffect, useState } from 'react'
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
    // Priority: image_path (Supabase Storage) > image_url (external)
    if (service.image_path) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data } = supabase.storage
          .from('services-images')
          .getPublicUrl(service.image_path)
        return data?.publicUrl || null
      }
    }
    if (service.image_url && isValidImageUrl(service.image_url)) {
      return service.image_url
    }
    return null
  }

  // Get the display image URL for a therapist (Supabase Storage or external URL)
  const getTherapistImageUrl = (therapist: Therapist): string | null => {
    // Priority: image_path (Supabase Storage) > image_url (external)
    if (therapist.image_path) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data } = supabase.storage
          .from('therapists-images')
          .getPublicUrl(therapist.image_path)
        return data?.publicUrl || null
      }
    }
    if (therapist.image_url && isValidImageUrl(therapist.image_url)) {
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
          aria-label="Contact us on WhatsApp"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm font-light">WhatsApp</span>
        </button>
      )}

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex items-center justify-center px-2 md:px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>
        
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[60px]" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[80px]" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center w-full -mt-12 md:mt-0">
          <div className="space-y-4 md:space-y-10 animate-slide-up">
            {/* Brand Name */}
            <h1 className="font-heading text-[4rem] md:text-[8rem] lg:text-[14rem] xl:text-[20rem] text-foreground leading-[0.75] tracking-tight">
              <span className="relative inline-block">
                <span className="relative z-10 text-primary font-semibold drop-shadow-[0_0_50px_rgba(212,175,55,0.7)]">Asami</span>
                <span className="absolute inset-0 text-primary blur-[100px] opacity-70">Asami</span>
              </span>
              <span className="hidden md:inline">&nbsp;</span>
              <br className="md:hidden" />
              <span className="hidden md:inline">
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary font-medium drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]">Heaven</span>
                  <span className="absolute inset-0 text-primary blur-[80px] opacity-60">Heaven</span>
                </span>
              </span>
              <span className="md:hidden">
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary font-medium drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]">Heaven</span>
                  <span className="absolute inset-0 text-primary blur-[80px] opacity-60">Heaven</span>
                </span>
              </span>
            </h1>

            {/* About Us Content */}
            <div className="max-w-2xl mx-auto px-4">
              <p className="text-base md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed">
                Step into a world of luxury and indulgence. We offer an exclusive selection of Metro Manila's most captivating and refined companions, chosen for their elegance and presence. Experience satisfaction as the standard—proudly recognized as the No. 1 Japanese Nuru in the Philippines.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {/* Telegram button - shown on both mobile and desktop */}
              {telegramValue && (
                <Button 
                  onClick={handleTelegramClick}
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-base border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-xl font-light backdrop-blur-sm cursor-pointer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Message us on Telegram
                </Button>
              )}
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-8 py-6 text-base bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-xl font-light shadow-lg hover:scale-105 group">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Services Section */}
      {displaySettings.services_mode === 'static' && displaySettings.therapists_mode === 'static' && services.length > 0 && therapists.length > 0 ? (
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-heading text-3xl md:text-4xl text-foreground">Our Team</h2>
              <p className="text-text-secondary font-light max-w-2xl mx-auto">
                Discover our premium service and meet our skilled therapist.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
              {services[0] && (
                <Card className="group glass border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow-card transition-all duration-500 ease-out flex flex-col h-full">
                  {(() => {
                    const imageUrl = getServiceImageUrl(services[0]);
                    return (
                      <>
                        <div className="w-full h-80 overflow-hidden bg-secondary/10 relative">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={services[0].name}
                              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-90"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                              <ImageIcon className="h-16 w-16 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col gap-4 flex-grow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-heading text-2xl text-foreground font-medium mb-1">
                                {services[0].name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Clock size={16} />
                                <span>{services[0].duration} minutes</span>
                              </div>
                            </div>
                            {services[0].price > 0 && (
                              <div className="text-right">
                                <span className="text-primary font-heading text-lg font-medium">
                                  ₱{services[0].price.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-text-secondary font-light leading-relaxed line-clamp-3 flex-grow">
                            {services[0].description}
                          </p>
                        <div className="mt-auto">
                          <Link href="/contact">
                            <Button className="w-full bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-xl group/btn">
                              Inquire Now
                              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                        </div>
                      </>
                    );
                  })()}
                </Card>
              )}

              {therapists[0] && (
                <Card className="glass border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow-card transition-all duration-500 ease-out flex flex-col overflow-hidden group">
                  {(() => {
                    const therapistImageUrl = getTherapistImageUrl(therapists[0]);
                    return (
                      <>
                        <div className="w-full h-[500px] overflow-hidden bg-secondary/10 relative">
                          {therapistImageUrl ? (
                            <img 
                              src={therapistImageUrl} 
                              alt={therapists[0].nickname}
                              className="absolute inset-0 min-w-full min-h-full w-full h-full object-cover object-top transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-90"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                              <User className="h-20 w-20 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 text-center">
                          <CardTitle className="font-heading text-2xl text-foreground font-medium">
                            {therapists[0].nickname}
                          </CardTitle>
                        </CardContent>
                      </>
                    );
                  })()}
                </Card>
              )}
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="py-16 md:py-20 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto relative">
              <div className="text-center mb-16 space-y-4">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground font-medium">
                  Featuring
                </h2>
                <p className="text-lg text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
                  Metro Manila's most captivating top-tier models.
                </p>
              </div>

              {isLoadingTherapists ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                </div>
              ) : therapists.length === 0 ? (
                <div className="text-center py-16 glass rounded-3xl p-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-text-secondary font-light text-lg">Our models will be introduced soon.</p>
                </div>
) : (
                <>
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {therapists.slice(0, displayedTherapistsCount).map((therapist, index) => {
                      const therapistImageUrl = getTherapistImageUrl(therapist);
                      return (
                        <div key={therapist.id} className="break-inside-avoid mb-4 md:mb-6">
                          <Card 
                            className="group glass border-border hover:border-primary/40 hover:-translate-y-2 hover:shadow-glow-card transition-all duration-500 ease-out flex flex-col overflow-hidden cursor-pointer"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="relative overflow-hidden bg-secondary/10">
                              {therapistImageUrl ? (
                                <img 
                                  src={therapistImageUrl} 
                                  alt={therapist.nickname}
                                  className="w-full h-auto object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-90"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="w-full aspect-[3/4] flex items-center justify-center bg-secondary/20">
                                  <User className="h-20 w-20 text-text-muted" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
                            </div>
                            <div className="p-4 text-center relative bg-card/90 backdrop-blur-sm">
                              <CardTitle className="font-heading text-xl text-foreground font-medium transition-colors duration-300 group-hover:text-primary">
                                {therapist.nickname}
                              </CardTitle>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-500" />
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                  {displayedTherapistsCount < totalTherapistsCount ? (
                    <div className="text-center mt-8">
                      <Button
                        onClick={() => setDisplayedTherapistsCount(prev => prev + 8)}
                        variant="outline"
                        className="px-8 border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5"
                      >
                        Load More Models
                      </Button>
                    </div>
                  ) : displayedTherapistsCount > 8 && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={() => setDisplayedTherapistsCount(8)}
                        variant="outline"
                        className="px-8 border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5"
                      >
                        Load Less
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="py-12 md:py-16 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
            </div>

            <div className="max-w-7xl mx-auto relative">
              <div className="text-center mb-16 space-y-4">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground font-medium">
                  Our Packages
                </h2>
                <p className="text-lg text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
                  Premium massage and spa packages tailored to your wellness needs.
                </p>
              </div>

              {isLoadingServices ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-16 glass rounded-3xl p-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-text-secondary font-light text-lg">Our services will be available soon.</p>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-8">
                {services.slice(0, 6).map((service, index) => {
                  const serviceImageUrl = getServiceImageUrl(service);
                  return (
                    <Card key={service.id} className="group glass border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow-card transition-all duration-500 ease-out flex flex-col h-full w-full sm:w-[380px] max-w-[420px]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="w-full h-64 overflow-hidden bg-secondary/10 relative">
                        {serviceImageUrl ? (
                          <img 
                            src={serviceImageUrl} 
                            alt={service.name}
                            className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-90"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                            <ImageIcon className="h-16 w-16 text-text-muted" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col gap-4 flex-grow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-heading text-2xl text-foreground font-medium mb-1">
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                          {service.price > 0 && (
                            <div className="text-right">
                              <span className="text-primary font-heading text-lg font-medium">
                                ₱{service.price.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-text-secondary font-light leading-relaxed line-clamp-3 flex-grow">
                          {service.description}
                        </p>
                        <div className="mt-auto">
                          <Link href="/contact">
                            <Button className="w-full bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-xl group/btn">
                              Inquire Now
                              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Reviews Section - Horizontal Scrolling Carousel */}
      {!isLoadingReviews && reviews.length > 0 && (
        <section className="py-16 md:py-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="font-heading text-3xl md:text-4xl text-foreground">Client Reviews</h2>
            </div>
            
            {/* Horizontal scrolling container with auto-scroll */}
            <div className="relative overflow-hidden">
              <div className="flex gap-6 pb-8 w-max animate-scroll-reviews">
                {/* First set of reviews */}
                {reviews.map((review) => {
                  // Get the image URL from Supabase Storage if image_path exists
                  const getReviewImageUrl = (): string | null => {
                    if (review.image_path) {
                      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      
                      if (supabaseUrl && supabaseAnonKey) {
                        const supabase = createClient(supabaseUrl, supabaseAnonKey)
                        const { data } = supabase.storage
                          .from('reviews-images')
                          .getPublicUrl(review.image_path)
                        return data?.publicUrl || null
                      }
                    }
                    return review.image_url
                  }
                  const reviewImageUrl = getReviewImageUrl()

                  return (
                    <Card key={review.id} className="glass border-border flex-shrink-0 w-[320px] md:w-[380px] snap-center">
                      <CardContent className="p-6">
                        {review.review_type === 'image' && reviewImageUrl ? (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <img 
                              src={reviewImageUrl} 
                              alt="Review screenshot"
                              className="w-full h-48 object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-4xl text-primary opacity-50 font-heading">&ldquo;</div>
                            <p className="text-foreground font-light leading-relaxed">
                              {review.review_text}
                            </p>
                            {review.reviewer_name && (
                              <p className="text-text-secondary text-sm font-light">
                                &mdash; {review.reviewer_name}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {/* Duplicate set of reviews for seamless infinite scroll */}
                {reviews.map((review) => {
                  // Get the image URL from Supabase Storage if image_path exists
                  const getReviewImageUrl = (): string | null => {
                    if (review.image_path) {
                      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      
                      if (supabaseUrl && supabaseAnonKey) {
                        const supabase = createClient(supabaseUrl, supabaseAnonKey)
                        const { data } = supabase.storage
                          .from('reviews-images')
                          .getPublicUrl(review.image_path)
                        return data?.publicUrl || null
                      }
                    }
                    return review.image_url
                  }
                  const reviewImageUrl = getReviewImageUrl()

                  return (
                    <Card key={`duplicate-${review.id}`} className="glass border-border flex-shrink-0 w-[320px] md:w-[380px] snap-center">
                      <CardContent className="p-6">
                        {review.review_type === 'image' && reviewImageUrl ? (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <img 
                              src={reviewImageUrl} 
                              alt="Review screenshot"
                              className="w-full h-48 object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-4xl text-primary opacity-50 font-heading">&ldquo;</div>
                            <p className="text-foreground font-light leading-relaxed">
                              {review.review_text}
                            </p>
                            {review.reviewer_name && (
                              <p className="text-text-secondary text-sm font-light">
                                &mdash; {review.reviewer_name}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              {/* Gradient fade on right edge */}
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-background to-transparent pointer-events-none hidden md:block" />
              <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-background to-transparent pointer-events-none hidden md:block" />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          <div className="glass rounded-3xl p-8 md:p-12 animate-slide-up relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute inset-0 rounded-3xl border border-primary/10" />
            
            {/* Image on left */}
            <div className="w-full md:w-1/2 relative">
              <img 
                src="/og-image.jpg" 
                alt="Asami Heaven - Relaxation"
                className="w-full h-64 md:h-80 object-cover rounded-2xl"
              />
            </div>
            
            {/* Content on right */}
            <div className="w-full md:w-1/2 relative space-y-6 text-center md:text-left">
              <h2 className="font-heading text-3xl md:text-5xl text-foreground font-medium">
                Ready to <span className="text-primary">Relax</span>?
              </h2>
              
              <p className="text-base md:text-lg text-text-secondary font-light">
                Contact us today and discover the art of true relaxation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Link href="/contact">
                  <Button size="lg" className="px-8 py-6 text-base bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-full font-light shadow-lg hover:scale-105 group">
                    Contact Us
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="px-8 py-6 text-base border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-full font-light backdrop-blur-sm">
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}