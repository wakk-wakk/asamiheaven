'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Edit3, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface NavLink {
  href: string
  label: string
  icon?: LucideIcon
}

const publicNavLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/therapists', label: 'Therapists' },
  { href: '/contact', label: 'Contact' },
]

const adminNavLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/admin/login', label: 'Logout', icon: LogOut },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showServicesLink, setShowServicesLink] = useState(true)
  const [showTherapistsLink, setShowTherapistsLink] = useState(true)
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) return

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const fetchDisplaySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('display_settings')
          .select('services_mode, therapists_mode')
          .single()
        
        if (data && !error) {
          // Show Services link only when mode is 'dynamic'
          setShowServicesLink(data.services_mode !== 'static')
          // Show Therapists link only when mode is 'dynamic'
          setShowTherapistsLink(data.therapists_mode !== 'static')
        }
      } catch (error) {
        console.error('Error fetching display settings:', error)
      }
    }

    fetchDisplaySettings()
    
    // Listen for display settings changes
    const handleSettingsUpdate = () => fetchDisplaySettings()
    window.addEventListener('displaySettingsUpdated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('displaySettingsUpdated', handleSettingsUpdate)
    }
  }, [])

  // Filter nav links based on display settings (only for public pages)
  const navLinks = isAdminPage 
    ? adminNavLinks 
    : publicNavLinks.filter(link => {
        if (link.label === 'Services') return showServicesLink
        if (link.label === 'Therapists') return showTherapistsLink
        return true
      })

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/iconwoutline.png" alt="Asami Heaven" className="!h-6 md:!h-8 w-auto object-contain max-h-full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.label === 'Logout') {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all duration-200 text-sm font-light"
                  >
                    {link.icon && <link.icon size={14} />}
                    {link.label}
                  </Link>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors duration-200 text-sm font-light tracking-wide"
                >
                  {link.icon && <link.icon size={14} />}
                  {link.label}
                </Link>
              )
            })}
            {!isAdminPage && (
              <Link
                href="/booking"
                className="px-6 py-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-300 text-sm font-light whitespace-nowrap"
              >
                Book Now
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 py-2 text-text-secondary hover:text-primary transition-colors duration-200 ${link.label === 'Logout' ? 'text-error hover:text-error' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && <link.icon size={16} />}
                {link.label}
              </Link>
            ))}
            {!isAdminPage && (
              <Link
                href="/booking"
                className="block w-full text-center px-6 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-300 font-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}