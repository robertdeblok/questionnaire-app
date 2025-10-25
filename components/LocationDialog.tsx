'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionnaireId: string
  onSaved: () => void
}

export default function LocationDialog({ open, onOpenChange, questionnaireId, onSaved }: LocationDialogProps) {
  const [locationName, setLocationName] = useState('')

  const createLocation = async () => {
    if (!locationName.trim()) return

    try {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireId, name: locationName })
      })
      setLocationName('')
      onOpenChange(false)
      onSaved()
    } catch (error) {
      console.error('Failed to create location:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
          <DialogDescription>Create a location to generate a unique QR code</DialogDescription>
        </DialogHeader>
        <div>
          <Label>Location Name</Label>
          <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Main Entrance, Store #1" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={createLocation} disabled={!locationName.trim()}>Create Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
