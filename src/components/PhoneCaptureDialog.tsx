'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'

interface VisitorContact {
  phone: string
  consent: boolean
  user_agent: string
}

export default function PhoneCaptureDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showCount, setShowCount] = useState(0)
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('visitor_lead_capture')
    if (stored === 'submitted' || stored === 'dismissed') {
      if (stored === 'dismissed') setIsPermanentlyDismissed(true)
      return // Don't show dialog
    }

    // Start timing for first show (10 seconds)
    const firstTimer = setTimeout(() => {
      if (showCount < 3 && !isPermanentlyDismissed) {
        setIsOpen(true)
        setShowCount(prev => prev + 1)
      }
    }, 10000)

    // Set up recurring timer (every 60 seconds, max 3 times)
    const recurringTimer = setInterval(() => {
      if (showCount < 3 && !isPermanentlyDismissed) {
        setIsOpen(true)
        setShowCount(prev => prev + 1)
      } else {
        clearInterval(recurringTimer)
      }
    }, 60000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(recurringTimer)
    }
  }, [showCount, isPermanentlyDismissed])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setErrorMessage('Please agree to our terms to continue.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const contactData: VisitorContact = {
        phone: phone.trim(),
        consent,
        user_agent: navigator.userAgent
      }

      const { error } = await supabase
        .from('visitor_contacts')
        .insert([contactData])

      if (error) throw error

      setSubmitStatus('success')
      localStorage.setItem('visitor_lead_capture', 'submitted')

      // Close after success
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
      setErrorMessage('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDismiss = () => {
    setIsOpen(false)
    // For permanent dismiss, user would need a separate action (e.g., "Don't show again" checkbox)
  }

  const handlePermanentDismiss = () => {
    localStorage.setItem('visitor_lead_capture', 'dismissed')
    setIsPermanentlyDismissed(true)
    setIsOpen(false)
  }

  if (isPermanentlyDismissed) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Get a Free Callback
          </DialogTitle>
          <DialogDescription>
            Leave your number and we&apos;ll call you back within 24 hours. No spam, guaranteed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">Thank you! We&apos;ll call you soon.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              disabled={isSubmitting}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to be contacted and accept the{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !phone.trim() || !consent}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Callback'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDismiss}
              disabled={isSubmitting}
            >
              Maybe Later
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handlePermanentDismiss}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Don&apos;t show again
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure & Private</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}