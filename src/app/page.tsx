'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Leaf, Clock, Heart, Image as ImageIcon, User, Star, Zap, Calendar, MessageCircle, Copy, ExternalLink, MessageSquare } from 'lucide-react'
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
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    services_mode: 'dynamic',
    therapists_mode: 'dynamic'
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [viberValue, setViberValue] = useState<string>('')
  const [whatsappValue, setWhatsappValue] = useState<string>('')

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
          .limit(6)
        
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
          .limit(6)
        
        if (data && !error) {
          setTherapists(data)
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
          .limit(3)
        
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
          .select('viber, whatsapp')
          .single()
        
        if (data && !error) {
          if (data.viber) {
            setViberValue(data.viber)
          }
          if (data.whatsapp) {
            setWhatsappValue(data.whatsapp)
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

  // Handle Viber click
  const handleViberClick = () => {
    if (!viberValue) return
    
    if (isUrl(viberValue)) {
      // Open URL in new tab
      const url = formatUrl(viberValue)
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Copy to clipboard
      copyToClipboard(viberValue, 'Viber contact')
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

  // Handle WhatsApp click
  const handleWhatsappClick = () => {
    if (!whatsappValue) return
    
    if (isUrl(whatsappValue)) {
      // Open URL in new tab
      const url = formatUrl(whatsappValue)
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Copy to clipboard
      copyToClipboard(whatsappValue, 'WhatsApp contact')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Floating WhatsApp Button */}
      {whatsappValue && (
        <button
          onClick={handleWhatsappClick}
          className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
          aria-label="Contact us on WhatsApp"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-text-secondary text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Contact us
          </span>
        </button>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full max-h-screen overflow-hidden">
          <img 
            src="https://i.pinimg.com/736x/3d/ef/fd/3deffdc624ae766115fa72a308833fb5.jpg" 
            alt="Spa background" 
            className="w-full h-full min-w-full min-h-full max-h-screen object-cover object-[center_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center w-full">
          <div className="space-y-10 animate-slide-up">
            {/* Brand Name */}
            <h1 className="font-heading text-[10rem] md:text-[14rem] lg:text-[18rem] xl:text-[20rem] text-foreground font-medium leading-tight">
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Asami</span>
                <span className="absolute inset-0 text-primary blur-xl opacity-40">Asami</span>
              </span>
              {' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Heaven</span>
                <span className="absolute inset-0 text-primary blur-xl opacity-40">Heaven</span>
              </span>
            </h1>

            {/* About Us Content */}
            <div className="max-w-2xl mx-auto">
              <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed">
                Step into a realm where luxury meets desire. We present an exclusive selection of Metro Manila's most captivating, top-tier models—chosen for their beauty, poise, and exceptional presence. Here, satisfaction isn't simply expected—it is effortlessly delivered as the standard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/booking">
                <Button size="lg" className="px-10 py-7 text-lg bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-xl font-light shadow-lg hover:scale-105 group">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {viberValue && (
                <Button 
                  onClick={handleViberClick}
                  variant="outline" 
                  size="lg" 
                  className="px-6 py-4 sm:px-10 sm:py-7 text-base sm:text-lg border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-xl font-light backdrop-blur-sm cursor-pointer w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Message us on Viber
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground/50 rounded-full animate-pulse" />
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
                <Card className="glass border-border hover:border-primary/30 transition-all duration-300 animate-slide-up flex flex-col h-full">
                  {(() => {
                    const imageUrl = getServiceImageUrl(services[0]);
                    return (
                      <>
                        <div className="w-full h-80 overflow-hidden bg-secondary/10 relative">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={services[0].name}
                              className="absolute inset-0 w-full h-full object-cover object-center"
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
                            <Link href={`/booking?service=${encodeURIComponent(services[0].name)}`}>
                              <Button className="w-full bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-xl group/btn">
                                Book Now
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
                <Card className="glass border-border hover:border-primary/30 transition-all duration-300 animate-slide-up flex flex-col overflow-hidden">
                  {(() => {
                    const therapistImageUrl = getTherapistImageUrl(therapists[0]);
                    return (
                      <>
                        <div className="w-full h-[500px] overflow-hidden bg-secondary/10 relative">
                          {therapistImageUrl ? (
                            <img 
                              src={therapistImageUrl} 
                              alt={therapists[0].nickname}
                              className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover object-top"
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
                          <p className="text-text-secondary font-light text-sm mt-2">Model</p>
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
          <section className="py-12 md:py-16 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto relative">
              <div className="text-center mb-16 space-y-4">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground font-medium">
                  Featuring
                </h2>
                <p className="text-lg text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
                  Metro Manila&apos;s most captivating top-tier models.
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
                <div className={`gap-8 ${
                  displaySettings.therapists_mode === 'static'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto'
                    : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}>
                  {therapists.map((therapist, index) => {
                    const therapistImageUrl = getTherapistImageUrl(therapist);
                    return (
                      <Card key={therapist.id} className="glass border-border hover:border-primary/30 transition-all duration-300 animate-slide-up flex flex-col overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="w-full h-80 overflow-hidden bg-secondary/10 relative">
                          {therapistImageUrl ? (
                            <img 
                              src={therapistImageUrl} 
                              alt={therapist.nickname}
                              className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
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
                            {therapist.nickname}
                          </CardTitle>
                          <p className="text-text-secondary font-light text-sm mt-2">Model</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="py-12 md:py-16 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto relative">
              <div className="text-center mb-16 space-y-4">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground font-medium">
                  Our Services
                </h2>
                <p className="text-lg text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
                  Premium massage and spa services tailored to your wellness needs.
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
                    <Card key={service.id} className="glass border-border hover:border-primary/30 transition-all duration-300 animate-slide-up flex flex-col h-full w-full sm:w-[380px] max-w-[420px]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="w-full h-64 overflow-hidden bg-secondary/10 relative">
                        {serviceImageUrl ? (
                          <img 
                            src={serviceImageUrl} 
                            alt={service.name}
                            className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
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
                          <Link href={`/booking?service=${encodeURIComponent(service.name)}`}>
                            <Button className="w-full bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-xl group/btn">
                              Book Now
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

      {/* Reviews Section */}
      {!isLoadingReviews && reviews.length > 0 && (
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="font-heading text-3xl md:text-4xl text-foreground">What Our Clients Say</h2>
              <p className="text-text-secondary font-light max-w-2xl mx-auto">
                Do not just take our word for it - hear from our satisfied clients
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {reviews.map((review) => (
                <Card key={review.id} className="glass border-border">
                  <CardContent className="p-6">
                    {review.review_type === 'image' && review.image_url ? (
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img 
                          src={review.image_url} 
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
              ))}
            </div>

            <div className="text-center">
              <Link href="/reviews">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-full font-light backdrop-blur-sm">
                  View All Reviews
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="glass rounded-[2.5rem] p-8 md:p-16 text-center space-y-8 animate-slide-up relative overflow-hidden">
            <div className="absolute inset-0 rounded-[2.5rem] border border-primary/10" />
            
            <div className="absolute top-8 left-8 w-16 h-16 rounded-full border border-primary/20 animate-pulse" />
            <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full border border-primary/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-4 w-8 h-8 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/4 right-12 w-12 h-12 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="relative space-y-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm text-primary font-light tracking-wide">Book Today</span>
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground font-medium">
                  Ready to <span className="relative inline-block">
                    <span className="relative z-10 text-primary">Relax</span>
                    <span className="absolute inset-0 text-primary blur-lg opacity-40">Relax</span>
                  </span>?
                  <span className="ml-2">✨</span>
                </h2>
                
                <p className="text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto leading-relaxed">
                  Treat yourself to a rejuvenating experience. Book your appointment today 
                  and discover the art of true relaxation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link href="/booking">
                  <Button size="lg" className="px-10 py-7 text-lg bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-full font-light shadow-lg hover:scale-105 group">
                    Book Your Session
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg" className="px-10 py-7 text-lg border-primary/30 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-full font-light backdrop-blur-sm">
                    View All Services
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-text-muted font-light pt-4">
                For detailed pricing information, please feel free to reach out to us directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}