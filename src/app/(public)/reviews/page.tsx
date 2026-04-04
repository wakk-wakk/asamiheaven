'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface Review {
  id: string
  review_type: 'image' | 'text'
  image_url: string | null
  review_text: string | null
  reviewer_name: string | null
  is_active: boolean
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      setIsLoading(false)
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Link href="/" className="inline-flex items-center text-text-secondary hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl text-foreground">What Our Clients Say</h1>
          <p className="text-text-secondary font-light text-lg max-w-2xl mx-auto">
            Dont just take our word for it - hear from our satisfied clients
          </p>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-12 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl p-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="h-10 w-10 text-primary" />
              </div>
              <p className="text-text-secondary font-light text-lg">No reviews available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="glass border-border">
                  <CardContent className="p-6">
                    {review.review_type === 'image' && review.image_url ? (
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img 
                          src={review.image_url} 
                          alt="Review screenshot"
                          className="w-full h-48 object-cover"
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
          )}
        </div>
      </section>
    </div>
  )
}