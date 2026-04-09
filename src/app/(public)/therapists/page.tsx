'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface Therapist {
  id: string
  nickname: string
  image_url: string
  image_path: string
  is_active: boolean
}

interface DisplaySettings {
  therapists_mode: 'static' | 'dynamic'
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

const getTherapistImageUrl = (therapist: Therapist): string | null => {
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

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    therapists_mode: 'dynamic'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          setIsLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { data: settingsData } = await supabase
          .from('display_settings')
          .select('therapists_mode')
          .single()
        
        const therapistsMode = settingsData?.therapists_mode || 'dynamic'
        setDisplaySettings({ therapists_mode: therapistsMode })

        if (therapistsMode === 'static') {
          const { data, error } = await supabase
            .from('static_therapists')
            .select('*')
            .eq('is_active', true)
            .single()
          
          if (data && !error) {
            setTherapists([data])
          }
        } else {
          const { data, error } = await supabase
            .from('therapists')
            .select('*')
            .eq('is_active', true)
            .order('nickname')
          
          if (data && !error) {
            setTherapists(data)
          }
        }
      } catch (error) {
        console.error('Error fetching therapists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pt-20">
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="text-center mb-16 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl text-foreground">
              {displaySettings.therapists_mode === 'static' ? 'Our Model' : 'Meet Our Models'}
            </h1>
            <p className="text-text-secondary font-light max-w-2xl mx-auto">
              {displaySettings.therapists_mode === 'static' 
                ? 'Meet our skilled model dedicated to your wellness.'
                : 'Our team of skilled professionals is dedicated to providing you with the best wellness experience.'}
            </p>
          </div>

          {therapists.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary font-light">Our models will be introduced soon.</p>
            </div>
          ) : (
            <div className={`grid gap-8 justify-center ${
              displaySettings.therapists_mode === 'static' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {therapists.map((therapist, index) => {
                const imageUrl = getTherapistImageUrl(therapist)
                return (
                  <Card 
                    key={therapist.id} 
                    className="glass border-border animate-slide-up overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-square overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={therapist.nickname}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                          <User className="h-16 w-16 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className="font-heading text-lg text-foreground">
                        {therapist.nickname}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
