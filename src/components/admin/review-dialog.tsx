'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Save } from 'lucide-react'

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (review: {
    review_type: 'image' | 'text'
    image_url: string
    review_text: string
    reviewer_name: string
    is_active: boolean
  }) => void
}

export function ReviewDialog({ open, onOpenChange, onSave }: ReviewDialogProps) {
  const [reviewType, setReviewType] = useState<'image' | 'text'>('text')
  const [imageUrl, setImageUrl] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewerName, setReviewerName] = useState('')

  const handleSave = () => {
    if ((reviewType === 'image' && !imageUrl) || 
        (reviewType === 'text' && !reviewText)) {
      alert('Please fill in the review content')
      return
    }

    onSave({
      review_type: reviewType,
      image_url: reviewType === 'image' ? imageUrl : '',
      review_text: reviewType === 'text' ? reviewText : '',
      reviewer_name: reviewerName,
      is_active: true
    })

    // Reset form
    setReviewType('text')
    setImageUrl('')
    setReviewText('')
    setReviewerName('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setReviewType('text')
      setImageUrl('')
      setReviewText('')
      setReviewerName('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Review</DialogTitle>
          <DialogDescription>
            Add a review screenshot or text testimonial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Review Type</Label>
            <div className="flex gap-3">
              <div
                className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  reviewType === 'image'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setReviewType('image')}
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className="font-heading text-sm text-foreground">Image</p>
                <p className="text-xs text-text-secondary mt-1">Screenshot</p>
              </div>
              <div
                className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  reviewType === 'text'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setReviewType('text')}
              >
                <div className="flex items-center justify-center mb-2">
                  <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="font-heading text-sm text-foreground">Text</p>
                <p className="text-xs text-text-secondary mt-1">Testimonial</p>
              </div>
            </div>
          </div>

          {reviewType === 'image' ? (
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/review-screenshot.jpg"
              />
              <p className="text-xs text-text-muted">Paste the URL of the review screenshot</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="review_text">Review Text *</Label>
                <Textarea
                  id="review_text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Enter the testimonial text..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewer_name">Reviewer Name (Optional)</Label>
                <Input
                  id="reviewer_name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
            <Save className="h-4 w-4 mr-2" />
            Save Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}