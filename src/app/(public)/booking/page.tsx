'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface DisplaySettings {
  services_mode: 'static' | 'dynamic'
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

// Simple validation function
function validateBooking(data: Record<string, string>, isStaticMode: boolean) {
  const errors: Record<string, string> = {}
  
  if (!data.name || data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email'
  }
  
  if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Please enter a valid phone number'
  }
  
  // Only validate service if not in static mode (where it's auto-selected)
  if (!isStaticMode && !data.service) {
    errors.service = 'Please select a service'
  }
  
  if (!data.date) {
    errors.date = 'Please select a date'
  } else if (new Date(data.date) < new Date()) {
    errors.date = 'Date must be in the future'
  }
  
  // Time is no longer required (uses default value)
  
  return errors
}

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    notes: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [services, setServices] = useState<Service[]>([])
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({ services_mode: 'dynamic' })
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [staticService, setStaticService] = useState<Service | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch display settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('display_settings')
          .select('*')
          .single()
        
        const servicesMode = settingsData?.services_mode || 'dynamic'
        setDisplaySettings({ services_mode: servicesMode })

        if (servicesMode === 'static') {
          // Fetch static service
          const { data: staticData, error: staticError } = await supabase
            .from('static_services')
            .select('id, name, price, duration')
            .eq('is_active', true)
            .single()
          
          if (staticData && !staticError) {
            setStaticService(staticData)
            // Set the service automatically
            setFormData(prev => ({ ...prev, service: staticData.name }))
          }
        } else {
          // Fetch dynamic services
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('id, name, price, duration')
            .eq('is_active', true)
            .order('name')
          
          if (servicesData && !servicesError) {
            setServices(servicesData)
          }
        }
      } catch (error) {
        console.error('Error fetching booking data:', error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateBooking(formData, displaySettings.services_mode === 'static')
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const bookingData: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_name: formData.service,
        appointment_date: formData.date,
        appointment_time: '09:00', // Default time
        notes: formData.notes,
        status: 'pending',
      }

      // Only add service_id in dynamic mode (where service_id references services table)
      // In static mode, don't add service_id since static_services IDs don't exist in services table
      if (displaySettings.services_mode === 'dynamic' && formData.service) {
        const selectedService = services.find(s => s.name === formData.service)
        if (selectedService) {
          bookingData.service_id = selectedService.id
        }
      }

      const { error } = await supabase
        .from('bookings')
        .insert(bookingData)
      
      if (error) throw error
      
      setSubmitStatus('success')
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        notes: '',
      })
    } catch (error) {
      console.error('Booking error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-heading text-4xl md:text-5xl text-foreground">Book Your Appointment</h1>
          <p className="text-text-secondary font-light text-lg max-w-2xl mx-auto">
            Select your preferred service and time. We will confirm your booking shortly.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground">Appointment Details</CardTitle>
              <CardDescription className="text-text-secondary font-light">
                Fill out the form below to book your spa session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <p className="text-success font-light">
                    Booking submitted successfully! We will contact you to confirm.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-error" />
                  <p className="text-error font-light">
                    Something went wrong. Please try again or contact us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-text-secondary font-light">Service</Label>
                  {displaySettings.services_mode === 'static' && staticService ? (
                    // Static mode: show read-only service name only
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-foreground">{staticService.name}</p>
                    </div>
                  ) : isLoadingServices ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    // Dynamic mode: show dropdown
                    <Select value={formData.service} onValueChange={(value: string) => handleChange('service', value)}>
                      <SelectTrigger className={`bg-background-alt border-border focus:border-primary/50 ${errors.service ? 'border-error' : ''}`}>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.service && <p className="text-error text-sm font-light">{errors.service}</p>}
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-text-secondary font-light">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    min={today}
                    className={`bg-background-alt border-border focus:border-primary/50 ${errors.date ? 'border-error' : ''}`}
                  />
                  {errors.date && <p className="text-error text-sm font-light">{errors.date}</p>}
                </div>

                {/* Personal Information */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-heading text-lg text-foreground">Your Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-text-secondary font-light">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      className={`bg-background-alt border-border focus:border-primary/50 ${errors.name ? 'border-error' : ''}`}
                    />
                    {errors.name && <p className="text-error text-sm font-light">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-text-secondary font-light">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className={`bg-background-alt border-border focus:border-primary/50 ${errors.email ? 'border-error' : ''}`}
                      />
                      {errors.email && <p className="text-error text-sm font-light">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-text-secondary font-light">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className={`bg-background-alt border-border focus:border-primary/50 ${errors.phone ? 'border-error' : ''}`}
                      />
                      {errors.phone && <p className="text-error text-sm font-light">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-text-secondary font-light">
                    Special Requests (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Any special requests or information we should know?"
                    rows={3}
                    className="bg-background-alt border-border focus:border-primary/50 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}