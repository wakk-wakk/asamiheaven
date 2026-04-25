import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ArrowRight, Phone, CheckCircle2, Shield, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Validate image URL helper
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Get therapist image URL
const getTherapistImageUrl = (therapist: { image_path?: string; image_url?: string }): string | null => {
  if (therapist.image_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/therapists-images/${therapist.image_path}`
    }
  }
  if (therapist.image_url && isValidImageUrl(therapist.image_url)) {
    return therapist.image_url
  }
  return null
}

// Get service image URL
const getServiceImageUrl = (service: { image_path?: string; image_url?: string }): string | null => {
  if (service.image_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/services-images/${service.image_path}`
    }
  }
  if (service.image_url && isValidImageUrl(service.image_url)) {
    return service.image_url
  }
  return null
}

export const metadata = {
  title: "Nuru Massage Manila | Asami Heaven",
  description: "Experience premium Nuru massage in Metro Manila at Asami Heaven. Sensory body-to-body massage using premium seaweed gel. Licensed therapists. Inquire today.",
  keywords: [
    "nuru massage",
    "nuru massage manila",
    "nuru spa",
    "body to body massage",
    "seaweed massage",
    "nuru Philippines",
    "Asami Heaven nuru",
    "premium nuru massage"
  ],
  alternates: {
    canonical: "/services/nuru-massage",
  },
  openGraph: {
    title: "Nuru Massage Manila | Asami Heaven",
    description: "Premium Nuru body-to-body massage at Asami Heaven spa in Metro Manila",
    url: "https://asamiheaven.vercel.app/services/nuru-massage",
    images: [
      {
        url: "https://asamiheaven.vercel.app/og-image-v5.jpg",
        secureUrl: "https://asamiheaven.vercel.app/og-image-v5.jpg",
        width: 1200,
        height: 630,
        alt: "Nuru Massage at Asami Heaven - Metro Manila",
        type: "image/jpeg",
      },
    ],
  },
}

// FAQ Data for schema
const faqData = [
  {
    question: "What is Nuru Massage?",
    answer: "Nuru massage is a premium body-to-body massage technique using a special seaweed-derived gel that creates a smooth, gliding sensation. Our licensed therapists at Asami Heaven provide this immersive wellness treatment in a professional spa environment. The word 'nuru' means 'slippery,' referring to the unique texture of the gel."
  },
  {
    question: "Is Nuru massage legal in Manila?",
    answer: "Yes, Nuru massage is legal when provided as a professional wellness service by licensed therapists in a registered spa. Asami Heaven operates legally with all required permits and follows local regulations for massage services."
  },
  {
    question: "How much does Nuru massage cost?",
    answer: "Our Nuru massage sessions start at competitive rates. Contact Asami Heaven directly for current pricing, session durations, and package options. All sessions include shower facilities and use premium organic seaweed gel."
  },
  {
    question: "What is the difference between Nuru and traditional massage?",
    answer: "Traditional massage uses hands-on techniques with oils, focusing on muscle relief. Nuru massage is a full-body technique using special seaweed gel for body-to-body contact, emphasizing sensory relaxation and deep tissue release. Both provide wellness benefits, but Nuru offers a unique, immersive experience."
  },
  {
    question: "What should I expect during a Nuru massage session?",
    answer: "Your session begins with a shower to prepare for the treatment. Our therapist will apply warm, organic seaweed gel to create the signature slippery texture. Using smooth, flowing body-to-body movements, the therapist provides deep relaxation and stress relief. The session concludes with a cleansing shower."
  }
]

const benefits = [
  {
    icon: "shield",
    title: "Deep Relaxation",
    description: "Release accumulated stress and tension through our immersive technique"
  },
  {
    icon: "check",
    title: "Skin Health",
    description: "Natural seaweed gel hydrates and nourishes your skin"
  },
  {
    icon: "clock",
    title: "Sensory Awakening",
    description: "Experience heightened sensory awareness and body connection"
  },
  {
    icon: "star",
    title: "Muscle Relief",
    description: "Deep tissue release without the pressure of traditional massage"
  }
]

export default async function NuruMassagePage() {
  // Server-side data fetch
  let therapists: Array<{ id: string | number; nickname: string; image_url?: string; image_path?: string }> = []
  let services: Array<{ id: string | number; name: string; description: string; price: number; duration: number; image_url?: string; image_path?: string; slug?: string }> = []
  let serviceData: { name: string; description: string; price: number; duration: number; is_active: boolean } | null = null

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Fetch therapists with images
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select('id, nickname, image_url, image_path')
        .eq('is_active', true)
        .order('nickname')
        .limit(8)

      if (therapistData && !therapistError) {
        therapists = therapistData
      }

      // Fetch all active services for packages section
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, description, price, duration, image_url, image_path, slug')
        .eq('is_active', true)
        .order('name')

      if (servicesData && !servicesError) {
        services = servicesData
      }

      // Fetch service data for dynamic pricing
      const { data: serviceResult, error: serviceError } = await supabase
        .from('services')
        .select('name, description, price, duration, is_active')
        .eq('slug', 'nuru-massage')
        .single()

      if (serviceResult && !serviceError) {
        serviceData = serviceResult
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  // Hardcoded display values for consistent messaging
  const displayPrice = 1500
  const displayDuration = '90-240'
  const isAvailable = !serviceData || serviceData.is_active !== false

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                Premium Wellness Experience
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl text-foreground leading-tight">
              Nuru Massage
            </h1>
            <p className="text-text-secondary font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Experience premium body-to-body massage at Asami Heaven.<br />
              <span className="text-text-muted">Licensed therapists • Premium wellness • Deep relaxation</span>
            </p>
            {!isAvailable && (
              <div className="inline-block px-6 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600">
                This service is currently unavailable. Please contact us for more information.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/contact?service=Nuru+Massage"
                className={`inline-flex items-center justify-center px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-lg font-light ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Inquire Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="https://wa.me/639123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-6 text-lg border border-border hover:bg-primary/5 transition-all duration-300 rounded-lg font-light"
              >
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-3xl text-foreground">100%</p>
              <p className="text-text-muted text-sm mt-1">Licensed Therapists</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-foreground">{displayDuration}</p>
              <p className="text-text-muted text-sm mt-1">Minutes</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-foreground">P{displayPrice.toLocaleString()}</p>
              <p className="text-text-muted text-sm mt-1">Starting Price</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-foreground">10+</p>
              <p className="text-text-muted text-sm mt-1">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Technique Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-medium mb-4 inline-block">Premium Body-to-Body Technique</span>
              <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-6">
                Authentic Nuru Experience
              </h2>
              <p className="text-text-secondary font-light text-lg leading-relaxed mb-6">
                Nuru massage is a premium body-to-body technique using a special seaweed-derived gel that creates a smooth, gliding sensation. This unique approach promotes deep relaxation, sensory awakening, and full-body tension release.
              </p>
              <p className="text-text-secondary font-light text-lg leading-relaxed mb-8">
                Unlike traditional massage, Nuru focuses on full-body contact and fluid movement, providing an immersive wellness experience that releases tension and restores balance.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Organic seaweed-derived gel</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Licensed, trained therapists</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Private, hygienic environment</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Premium spa facilities</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background"></div>
                <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/3c/b9/ef/3cb9ef1d212dfaa7ddb18e812cc59dca.jpg')] bg-cover bg-center opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                <div className="relative h-full flex flex-col justify-end p-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4 w-fit border border-primary/20">
                    Authentic Experience
                  </span>
                  <h3 className="font-heading text-2xl text-foreground mb-3">
                    Premium Nuru
                  </h3>
                  <p className="text-text-secondary font-light leading-relaxed mb-6">
                    Our therapists are trained in authentic techniques, using premium organic seaweed gel for the truest Nuru experience at Asami Heaven.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-text-secondary">Certified Therapists</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-text-secondary">Premium Gel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium mb-4 inline-block">Wellness Benefits</span>
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-6">
              Why Choose Nuru Massage?
            </h2>
            <p className="text-text-secondary font-light text-lg max-w-2xl mx-auto">
              Experience the unique benefits of Nuru technique for your body and mind at Asami Heaven.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-background/50 hover:bg-background/80 transition-all duration-300">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  {benefit.icon === "shield" && <Shield className="h-8 w-8 text-primary" />}
                  {benefit.icon === "check" && <CheckCircle2 className="h-8 w-8 text-primary" />}
                  {benefit.icon === "clock" && <Clock className="h-8 w-8 text-primary" />}
                  {benefit.icon === "star" && (
                    <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-heading text-xl text-foreground mb-3">{benefit.title}</h3>
                <p className="text-text-secondary font-light leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium mb-4 inline-block">Service Packages</span>
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-6">
              Choose Your Experience
            </h2>
          </div>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-light">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {services.map((service) => {
                const imageUrl = getServiceImageUrl(service)
                return (
                  <Card key={service.id} className="glass border-border hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                    {/* Service Image */}
                    {imageUrl ? (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg bg-secondary/20 relative flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt={service.name}
                          className="min-w-full min-h-full max-w-full max-h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-90"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-t-lg flex items-center justify-center bg-secondary/20">
                        <ImageIcon className="h-12 w-12 text-text-muted" />
                      </div>
                    )}
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="text-center mb-4">
                        <h3 className="font-heading text-xl text-foreground mb-2">{service.name}</h3>
                        <div className="flex items-baseline justify-center gap-2">
                          {service.price && service.price > 0 && (
                            <span className="text-3xl font-heading text-primary">P{service.price.toLocaleString()}</span>
                          )}
                          <span className="text-text-muted">/{service.duration} min</span>
                        </div>
                      </div>
                      <p className="text-text-secondary font-light text-sm leading-relaxed mb-6 text-center flex-grow">
                        {service.description}
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-xl font-medium mt-auto"
                      >
                        Inquire Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Therapists Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium mb-4 inline-block">Our Therapists</span>
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-6">
              Licensed Professionals
            </h2>
            <p className="text-text-secondary font-light text-lg max-w-2xl mx-auto">
              Our certified therapists are trained in traditional techniques to provide an authentic Nuru experience at Asami Heaven.
            </p>
          </div>
          {therapists.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {therapists.map((therapist) => {
                const therapistImageUrl = getTherapistImageUrl(therapist)
                return (
                  <Card key={therapist.id} className="glass border-border hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 overflow-hidden">
                        {therapistImageUrl ? (
                          <img
                            src={therapistImageUrl}
                            alt={therapist.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-heading text-primary">
                            {therapist.nickname.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-base text-foreground mb-1">{therapist.nickname}</h3>
                      <p className="text-xs text-text-muted">Licensed Therapist</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          {therapists.length === 0 && (
            <div className="text-center">
              <Link
                href="/therapists"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-300"
              >
                View All Models
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section with Schema */}
      <section className="py-20 px-4" id="faq">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium mb-4 inline-block">Frequently Asked Questions</span>
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-6">
              Your Questions Answered
            </h2>
          </div>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="group glass rounded-xl border border-border hover:border-primary/40 transition-all duration-300"
              >
                <details className="group/details">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:text-primary transition-colors list-none">
                    <span className="font-heading text-lg">{faq.question}</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-open/details:rotate-90" />
                  </summary>
                  <div className="px-6 pb-6 text-text-secondary">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-16 text-center space-y-8">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground">
              Ready to Experience Nuru Massage?
            </h2>
            <p className="text-text-secondary font-light text-lg max-w-xl mx-auto">
              Inquire today and discover the unique relaxation of premium Nuru body-to-body massage at Asami Heaven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact?service=Nuru+Massage"
                className="inline-flex items-center justify-center px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary-hover text-background hover:shadow-lg transition-all duration-300 rounded-lg font-light"
              >
                Inquire Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="https://wa.me/639123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-6 text-lg border border-border hover:bg-primary/5 transition-all duration-300 rounded-lg font-light"
              >
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Schema - Hidden but crawlable */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />

      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Nuru Massage",
            "provider": {
              "@type": "HealthSpa",
              "name": "Asami Heaven",
              "areaServed": "Metro Manila, Philippines"
            },
            "description": "Premium Nuru body-to-body massage using seaweed gel for deep relaxation and stress relief.",
            "areaServed": "Metro Manila, Philippines"
          })
        }}
      />
    </div>
  )
}
