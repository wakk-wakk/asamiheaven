'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2,
  Image as ImageIcon,
  User
} from 'lucide-react'

interface Therapist {
  id: string
  nickname: string
  image_url: string
  is_active: boolean
  created_at: string
}

// Validate image URL to prevent infinite loop errors
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    image_url: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchTherapists()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('nickname')
      
      if (error) throw error
      setTherapists(data || [])
    } catch (error) {
      console.error('Error fetching therapists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.nickname) {
      alert('Please enter a nickname')
      return
    }

    // Validate image URL if provided
    if (formData.image_url && !isValidImageUrl(formData.image_url)) {
      alert('Please enter a valid image URL (must start with http:// or https://)')
      return
    }

    setIsSaving(true)
    try {
      const therapistData = {
        nickname: formData.nickname,
        image_url: formData.image_url,
        is_active: true
      }

      if (editingTherapist) {
        const { error } = await supabase
          .from('therapists')
          .update(therapistData)
          .eq('id', editingTherapist.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('therapists')
          .insert(therapistData)
        
        if (error) throw error
      }

      setShowDialog(false)
      resetForm()
      fetchTherapists()
    } catch (error) {
      console.error('Error saving therapist:', error)
      alert('Error saving therapist')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (therapist: Therapist) => {
    setEditingTherapist(therapist)
    setFormData({
      nickname: therapist.nickname,
      image_url: therapist.image_url || ''
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this therapist?')) return

    try {
      const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchTherapists()
    } catch (error) {
      console.error('Error deleting therapist:', error)
      alert('Error deleting therapist')
    }
  }

  const resetForm = () => {
    setFormData({
      nickname: '',
      image_url: ''
    })
    setEditingTherapist(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-text-secondary font-light">Loading therapists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl text-foreground">Manage Therapists</h1>
              <p className="text-text-secondary font-light mt-2">Add, edit, and remove spa therapists</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={fetchTherapists}
                className="border-border hover:border-primary/50 hover:text-primary"
              >
                Refresh
              </Button>
              <Dialog open={showDialog} onOpenChange={(open) => {
                setShowDialog(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Therapist
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}</DialogTitle>
                    <DialogDescription>
                      {editingTherapist ? 'Update therapist details' : 'Add a new therapist to your team'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname *</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                        placeholder="e.g., Maria"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-text-muted">Enter a URL for the therapist photo</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary-hover"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Therapist'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Therapists Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {therapists.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-12 text-center">
                <p className="text-text-secondary font-light">No therapists found. Add your first therapist!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {therapists.map((therapist) => (
                <Card key={therapist.id} className="glass border-border">
                  <div className="aspect-square overflow-hidden rounded-t-lg flex items-center justify-center bg-secondary/20">
                    {therapist.image_url && isValidImageUrl(therapist.image_url) ? (
                      <img 
                        src={therapist.image_url} 
                        alt={therapist.nickname}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <User className="h-16 w-16 text-text-muted" />
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-heading text-lg text-foreground">
                        {therapist.nickname}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(therapist)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(therapist.id)}
                          className="text-error hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}