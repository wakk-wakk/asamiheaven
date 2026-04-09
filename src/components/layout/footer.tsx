'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react'

interface ContactSettings {
  phone: string
  email: string
  address: string
  viber: string
  whatsapp: string
  instagram: string
  facebook: string
  twitter: string
  website: string
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

const defaultContact: ContactSettings = {
  phone: '+1 (555) 123-4567',
  email: 'hello@asamihaven.com',
  address: '123 Serenity Lane, Wellness City, WC 12345',
  viber: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  twitter: '',
  website: ''
}

export function Footer() {
  const [contact, setContact] = useState<ContactSettings>(defaultContact)

  const loadContact = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('Loading contact settings...', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error } = await supabase
          .from('contact_settings')
          .select('*')
          .single()
        
        console.log('Contact settings response:', { data, error })
        
        if (data && !error) {
          setContact(data)
          console.log('Contact settings loaded:', data)
        } else {
          console.log('Error loading contact settings:', error)
        }
      }
    } catch (error) {
      console.log('Could not load contact settings, using defaults', error)
    }
  }

  useEffect(() => {
    console.log('Footer useEffect running, pathname:', typeof window !== 'undefined' ? window.location.pathname : 'no window')
    // Load contact settings on all pages
    if (typeof window === 'undefined') {
      console.log('Footer: No window available')
      return
    }
    
    const isAdminPage = window.location.pathname.startsWith('/admin')
    console.log('Is admin page:', isAdminPage)
    
    console.log('Footer: Loading contact settings')
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
    { href: contact.instagram, icon: InstagramIcon, label: 'Instagram' },
    { href: contact.facebook, icon: FacebookIcon, label: 'Facebook' },
    { href: contact.twitter, icon: TwitterIcon, label: 'Twitter' },
  ].filter(link => link.href)

  // Helper function to check if a value is a URL
  const isUrl = (value: string): boolean => {
    // Check if it starts with http:// or https:// or www.
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
      // Show a brief visual feedback
      alert(`${label} copied to clipboard: ${text}`)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      window.prompt(`Copy ${label} to clipboard:`, text)
    }
  }

  // Handle social link click
  const handleSocialClick = (href: string, label: string, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isUrl(href)) {
      // Open URL in new tab
      const url = formatUrl(href)
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Copy to clipboard (for phone numbers, usernames, etc.)
      copyToClipboard(href, label)
    }
  }

  return (
    <footer className="glass border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl text-primary font-medium">
              Asami Heaven
            </h3>
            <p className="text-text-secondary text-sm font-light leading-relaxed">
              Experience tranquility and rejuvenation at our premium spa. 
              Let us help you find your inner peace.
            </p>
            <div className="flex items-center space-x-2 text-success text-sm font-light">
              <CheckCircle2 size={14} />
              <span>Open 24/7</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-foreground font-medium">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-text-secondary hover:text-primary transition-colors text-sm font-light">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-text-secondary hover:text-primary transition-colors text-sm font-light">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-text-secondary hover:text-primary transition-colors text-sm font-light">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-primary transition-colors text-sm font-light">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-foreground font-medium">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary text-sm font-light">
                  {contact.phone}
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary text-sm font-light">
                  {contact.email}
                </span>
              </li>
              {contact.address && (
                <li className="flex items-start space-x-3">
                  <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary text-sm font-light">
                    {contact.address}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-foreground font-medium">
              Follow Us
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={(e) => handleSocialClick(link.href, link.label, e)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-primary group"
                  title={`${link.label}: ${link.href}`}
                  aria-label={`Contact via ${link.label}`}
                >
                  <link.icon />
                  <span className="text-sm font-light">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-text-muted text-sm font-light">
            © {new Date().getFullYear()} Asami Heaven. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-light">
              Privacy Policy
            </Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-light">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}