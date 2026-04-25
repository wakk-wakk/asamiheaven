import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowLeft, User } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

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

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

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
  if (therapist.image_path && typeof therapist.image_path === 'string') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/therapists-images/${therapist.image_path}`
    }
  }
  if (therapist.image_url && typeof therapist.image_url === 'string' && isValidImageUrl(therapist.image_url)) {
    return therapist.image_url
  }
  return null
}

export default async function TherapistsPage() {
  const supabase = createServerClient()

  // Fetch display settings
  const { data: settingsData } = await supabase
    .from('display_settings')
    .select('therapists_mode')
    .single()

  const therapistsMode = settingsData?.therapists_mode || 'dynamic'
  const displaySettings: DisplaySettings = { therapists_mode: therapistsMode }

  // Fetch therapists based on mode
  let therapists: Therapist[] = []
  
  if (therapistsMode === 'static') {
    const { data } = await supabase
      .from('static_therapists')
      .select('*')
      .eq('is_active', true)
      .single()
    
    if (data) {
      therapists = [data]
    }
  } else {
    const { data } = await supabase
      .from('therapists')
      .select('*')
      .eq('is_active', true)
      .order('nickname')
    
    therapists = data ?? []
  }

  return (
    <div className="animate-fade-in">
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="text-center mb-8 md:mb-16 space-y-4">
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
            <div className={`grid gap-6 md:gap-8 justify-center ${
              displaySettings.therapists_mode === 'static' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {therapists.map((therapist, index) => {
                const imageUrl = getTherapistImageUrl(therapist)
                return (
                  <div 
                    key={therapist.id} 
                    className="group relative overflow-hidden cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-secondary/10">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={therapist.nickname}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                          <User className="h-16 w-16 text-text-muted" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="bg-background/80 backdrop-blur-sm px-4 py-2 text-primary font-heading text-xl tracking-widest uppercase">
                          {therapist.nickname}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
