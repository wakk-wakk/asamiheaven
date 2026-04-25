'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  return (
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
              Thank you! Your message has been sent successfully. We will get back to you soon.
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
  )
}
