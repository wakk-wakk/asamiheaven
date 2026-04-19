'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, Clock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

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

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

// Social media icon components
const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const ViberIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.319 13.82c-1.16-0.58-2.34-1.16-3.38-1.74-0.44-0.24-0.84-0.22-1.14 0.14l-0.86 1.02c-0.28 0.34-0.6 0.38-1 0.18-0.74-0.38-1.48-0.88-2.14-1.54-0.66-0.66-1.16-1.4-1.54-2.14-0.2-0.4-0.16-0.72 0.18-1l1.02-0.86c0.36-0.3 0.38-0.7 0.14-1.14-0.58-1.04-1.16-2.22-1.74-3.38-0.24-0.48-0.64-0.66-1.16-0.54l-1.44 0.32c-0.52 0.12-0.86 0.52-0.88 1.06-0.04 1.46 0.36 2.88 1.14 4.14 0.86 1.4 2.02 2.56 3.42 3.42 1.26 0.78 2.68 1.18 4.14 1.14 0.54-0.02 0.94-0.36 1.06-0.88l0.32-1.44c0.12-0.52-0.06-0.92-0.54-1.16zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012 0C5.405 0 .049 5.365.049 11.97c0 2.11.547 4.17 1.588 5.983L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.595 0 11.96-5.365 11.96-11.97A11.82 11.82 0 0020.83 3.083z"/>
  </svg>
)

const TelegramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-1.07.495-1.532.474z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const defaultContact: ContactSettings = {
  phone: '+63 9XX XXX XXXX',
  email: 'info@asamihaven.com',
  address: '',
  viber: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  twitter: '',
  youtube: '',
  telegram: '',
  website: ''
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactSettings>(defaultContact)
  const [isLoading, setIsLoading] = useState(true)
  const [whatsappValue, setWhatsappValue] = useState<string>('')
  const [viberValue, setViberValue] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const loadContact = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)
          const { data, error } = await supabase
            .from('contact_settings')
            .select('*')
            .single()
          
          if (data && !error) {
            setContact(data)
            setWhatsappValue(data.whatsapp || '')
            setViberValue(data.viber || '')
          }
        }
      } catch (error) {
        console.error('Error loading contact settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContact()

    // Listen for storage events to refresh contact info when admin updates it
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contact_settings_updated') {
        loadContact()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event (same-tab updates)
    const handleCustomEvent = () => {
      loadContact()
    }
    
    window.addEventListener('contactSettingsUpdated', handleCustomEvent)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contactSettingsUpdated', handleCustomEvent)
    }
  }, [])

  const socialLinks = [
    { href: contact.viber, icon: ViberIcon, label: 'Viber' },
    { href: contact.whatsapp, icon: WhatsAppIcon, label: 'WhatsApp' },
    { href: contact.telegram, icon: TelegramIcon, label: 'Telegram' },
    { href: contact.youtube, icon: YoutubeIcon, label: 'YouTube' },
    { href: contact.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: contact.facebook, icon: FacebookIcon, label: 'Facebook' },
    { href: contact.twitter, icon: TwitterIcon, label: 'Twitter' },
  ].filter(link => link.href)

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

  // Clean phone number for messaging apps
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[^0-9+]/g, '')
  }

  // Handle WhatsApp click
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!whatsappValue) return
    
    const message = encodeURIComponent("Hello! I'm interested in your services. Could you please provide more information?")
    
    if (isUrl(whatsappValue)) {
      window.open(formatUrl(whatsappValue), '_blank', 'noopener,noreferrer')
    } else {
      const phoneNumber = cleanPhoneNumber(whatsappValue)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Handle Viber click - open app on mobile, copy on desktop
  const handleViberClick = (e: React.MouseEvent) => {
    e.preventDefault()
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

  // Handle Telegram click - open Telegram
  const handleTelegramClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!contact.telegram) return
    
    if (isUrl(contact.telegram)) {
      window.open(formatUrl(contact.telegram), '_blank', 'noopener,noreferrer')
    } else {
      const telegramUrl = `https://t.me/${contact.telegram.replace('@', '')}`
      window.open(telegramUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied to clipboard: ${text}`)
    } catch (err) {
      console.error('Failed to copy:', err)
      window.prompt(`Copy ${label} to clipboard:`, text)
    }
  }

  // Handle social link click
  const handleSocialClick = (href: string, label: string, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isUrl(href)) {
      const url = formatUrl(href)
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      copyToClipboard(href, label)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT
      
      if (!endpoint) {
        throw new Error('Formspree endpoint not configured')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="font-heading text-4xl md:text-5xl text-foreground">Reach Us</h1>
            <p className="text-text-secondary font-light text-lg max-w-2xl mx-auto">
              Have questions? We would love to hear from you. Reach out to us and we will respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Info - Left Side */}
            <div className="space-y-6">
              {/* Social Media */}
              {(contact.whatsapp || contact.viber || contact.instagram || contact.facebook || contact.twitter) && (
                <Card className="glass border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl text-foreground">Contact Us</CardTitle>
                    <CardDescription className="text-text-secondary font-light">
                      Stay connected on social media.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {/* WhatsApp */}
                      {contact.whatsapp && (
                        <button
                          onClick={handleWhatsAppClick}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
                          title={`WhatsApp: ${contact.whatsapp}`}
                          aria-label="Contact via WhatsApp"
                        >
                          <WhatsAppIcon />
                          <span className="text-sm font-light">WhatsApp</span>
                        </button>
                      )}
                      {/* Viber */}
                      {contact.viber && (
                        <button
                          onClick={handleViberClick}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
                          title={`Viber: ${contact.viber}`}
                          aria-label="Contact via Viber"
                        >
                          <ViberIcon />
                          <span className="text-sm font-light">Viber</span>
                        </button>
                      )}
                      {/* Telegram */}
                      {contact.telegram && (
                        <button
                          onClick={handleTelegramClick}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
                          title={`Telegram: ${contact.telegram}`}
                          aria-label="Contact via Telegram"
                        >
                          <TelegramIcon />
                          <span className="text-sm font-light">Telegram</span>
                        </button>
                      )}
                      {/* Instagram */}
                      {contact.instagram && (
                        <button
                          onClick={(e) => handleSocialClick(contact.instagram, 'Instagram', e)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
                          title={`Instagram: ${contact.instagram}`}
                          aria-label="View Instagram"
                        >
                          <InstagramIcon />
                          <span className="text-sm font-light">Instagram</span>
                        </button>
                      )}
                      {/* Facebook */}
                      {contact.facebook && (
                        <button
                          onClick={(e) => handleSocialClick(contact.facebook, 'Facebook', e)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
                          title={`Facebook: ${contact.facebook}`}
                          aria-label="View Facebook"
                        >
                          <FacebookIcon />
                          <span className="text-sm font-light">Facebook</span>
                        </button>
                      )}
                      {/* Twitter */}
                      {contact.twitter && (
                        <button
                          onClick={(e) => handleSocialClick(contact.twitter, 'Twitter', e)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary"
                          title={`Twitter: ${contact.twitter}`}
                          aria-label="View Twitter"
                        >
                          <TwitterIcon />
                          <span className="text-sm font-light">Twitter</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Details */}
              <Card className="glass border-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-foreground">Get in Touch</CardTitle>
                  <CardDescription className="text-text-secondary font-light">
                    Here is how you can reach us directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contact.phone && (
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-foreground mb-1">Phone</h3>
                        <p className="text-text-secondary font-light">{contact.phone}</p>
                      </div>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-foreground mb-1">Email</h3>
                        <a href={`mailto:${contact.email}`} className="text-text-secondary font-light hover:text-primary transition-colors">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-foreground mb-1">Hours</h3>
                      <p className="text-text-secondary font-light">
                        Open 24/7
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="glass border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-foreground">Email Us</CardTitle>
                <CardDescription className="text-text-secondary font-light">
                  Fill out the form below and we will get back to you shortly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {submitStatus === 'success' && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <p className="text-success text-sm font-light">
                      Thank you! Your message has been sent successfully. We ll get back to you soon.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-destructive text-sm font-light">
                      Oops! Something went wrong. Please try again or contact us directly via email.
                    </p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-text-secondary font-light">Name *</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name" 
                        className={`bg-background-alt border-border focus:border-primary/50 transition-colors ${errors.name ? 'border-destructive' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-destructive text-xs font-light">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-text-secondary font-light">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com" 
                        className={`bg-background-alt border-border focus:border-primary/50 transition-colors ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-destructive text-xs font-light">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-text-secondary font-light">Subject *</Label>
                    <Input 
                      id="subject" 
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?" 
                      className={`bg-background-alt border-border focus:border-primary/50 transition-colors ${errors.subject ? 'border-destructive' : ''}`}
                    />
                    {errors.subject && (
                      <p className="text-destructive text-xs font-light">{errors.subject}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-text-secondary font-light">Message *</Label>
                    <Textarea 
                      id="message" 
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..." 
                      rows={5}
                      className={`bg-background-alt border-border focus:border-primary/50 transition-colors resize-none ${errors.message ? 'border-destructive' : ''}`}
                    />
                    {errors.message && (
                      <p className="text-destructive text-xs font-light">{errors.message}</p>
                    )}
                  </div>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-glow transition-all duration-300 rounded-lg font-light cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}