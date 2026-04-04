'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, ArrowRight, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface Service {
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-light">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, index) => (
                <Card 
                  key={service.id} 
                  className="glass border-border hover:border-primary/30 transition-all duration-300 animate-slide-up flex flex-col h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {service.image_url && isValidImageUrl(service.image_url) ? (
                    <div className="w-full h-64 overflow-hidden rounded-t-lg bg-secondary/20 relative">
                      <img 
                        src={service.image_url} 
                        alt={service.name}
                        className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 rounded-t-lg flex items-center justify-center bg-secondary/20">
                      <ImageIcon className="h-12 w-12 text-text-muted" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col gap-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-foreground font-medium mb-1">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Clock size={14} />
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>
                      {service.price && service.price > 0 && (
                        <div className="text-right">
                          <span className="text-primary font-heading text-lg font-medium">
                            ₱{service.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-text-secondary font-light text-sm leading-relaxed flex-grow">
                      {service.description}
                    </p>
                    <div className="mt-auto">
                      <Link href={`/booking?service=${encodeURIComponent(service.name)}`}>
                        <Button 
                          variant="outline" 
                          className="w-full border-border hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-lg font-light"
                        >
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
            <Link href="/contact">
              <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-lg font-light">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}