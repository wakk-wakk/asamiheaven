'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function AccountSettingsPage() {
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountSuccess, setAccountSuccess] = useState('')

  const updateEmail = async () => {
    setIsUpdatingEmail(true)
    setAccountError('')
    setAccountSuccess('')
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setAccountSuccess(`Confirmation email sent to ${newEmail}. Please check ${newEmail} to confirm the change.`)
      setNewEmail('')
    } catch (error) {
      setAccountError((error as Error).message)
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setAccountError('New passwords do not match')
      return
    }
    setIsUpdatingPassword(true)
    setAccountError('')
    setAccountSuccess('')
    try {
      // Re-authenticate first
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: currentPassword
      })
      if (authError) throw authError
      // Now update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setAccountSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setAccountError((error as Error).message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground">Account Settings</h1>
            <p className="text-text-secondary font-light mt-2">Update your email address and password</p>
          </div>

          <Card className="glass border-border">
            <CardContent className="p-6">
              {accountError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">Error</p>
                    <p className="text-red-700 text-sm">{accountError}</p>
                  </div>
                </div>
              )}
              {accountSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 text-sm font-medium">Success</p>
                    <p className="text-green-700 text-sm">{accountSuccess}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Change Email</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                  />
                  <Button
                    onClick={updateEmail}
                    disabled={isUpdatingEmail || !newEmail}
                    className="w-full bg-primary hover:bg-primary-hover"
                  >
                    {isUpdatingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Email'
                    )}
                  </Button>
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-medium">Change Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                  />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    onClick={updatePassword}
                    disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full bg-primary hover:bg-primary-hover"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}