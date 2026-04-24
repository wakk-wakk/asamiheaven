'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ArrowRight, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react'
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
  is_featured: boolean
  slug: string
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

// Get Supabase public URL for an image path
const getSupabaseImageUrl = (imagePath: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !imagePath) return ''
  return `${supabaseUrl}/storage/v1/object/public/services-images/${imagePath}`
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('name')
            .limit(20)
          
          if (data && !error) {
            setServices(data)
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

   // Get the display image URL for a service
   const getServiceImageUrl = (service: Service): string | null => {
    // Priority: image_path (Supabase Storage) > image_url (external)
    if (service.image_path && typeof service.image_path === 'string') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/services-images/${service.image_path}`
      }
    }
    if (service.image_url && typeof service.image_url === 'string' && isValidImageUrl(service.image_url)) {
      return service.image_url
    }
    return null
  }

    if (isLoading) {
     return (
       <div className="min-h-[60vh] flex items-center justify-center">
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
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="text-center space-y-6">
            <h1 className="font-heading text-4xl md:text-5xl text-foreground">Our Services</h1>
            <p className="text-text-secondary font-light text-lg max-w-2xl mx-auto">
              Discover our range of premium massage and spa services, 
              each designed to rejuvenate your body and calm your mind.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <p className="text-text-secondary font-light">No services available at the moment.</p>
              </div>
            ) : (
              services.map((service, index) => {
                const imageUrl = getServiceImageUrl(service)
                return (
                  <Card 
                    key={service.id} 
                    className={`group flex flex-col h-full transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-glow-card ${
                      service.is_featured 
                        ? 'glass border-primary/40 shadow-glow-card' 
                        : 'glass border-border hover:border-primary/40'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {imageUrl ? (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg bg-secondary/20 relative flex items-center justify-center">
                        <img 
                          src={imageUrl} 
                          alt={service.name}
                          className="min-w-full min-h-full max-w-full max-h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-90"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        {service.is_featured && (
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 rounded-t-lg flex items-center justify-center bg-secondary/20 relative">
                        <ImageIcon className="h-12 w-12 text-text-muted" />
                        {service.is_featured && (
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-2 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-heading text-lg text-foreground">
                          {service.name}
                        </h3>
                        {service.price && service.price > 0 && (
                          <span className="text-primary font-heading text-lg">
                            ₱{service.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Clock size={14} />
                        <span>{service.duration} min</span>
                      </div>
                      <p className="text-text-secondary font-light text-sm leading-relaxed">
                        {service.description}
                      </p>
                      <Button 
                        type="button"
                        className="w-full mt-auto bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-xl group/btn"
                        onClick={() => {
                          if (service.slug) {
                            router.push(`/services/${service.slug}`)
                          } else {
                            router.push('/contact')
                          }
                        }}
                      >
                        {service.slug ? 'Learn More' : 'Inquire Now'}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 text-center space-y-6">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground">
              Not Sure Which Service?
            </h2>
            <p className="text-text-secondary font-light max-w-xl mx-auto">
              Our team is here to help you choose the perfect treatment for your needs. 
              Contact us for a personalized recommendation.
            </p>
            <Button 
              type="button"
              size="lg"
              className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-lg font-light"
              onClick={() => router.push('/contact')}
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}