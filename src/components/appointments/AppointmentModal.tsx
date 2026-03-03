'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AppointmentForm } from './AppointmentForm'
import { Plus } from 'lucide-react'

interface AppointmentModalProps {
  storeId: string
  trigger?: React.ReactNode
}

export function AppointmentModal({ storeId, trigger }: AppointmentModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        <AppointmentForm
          storeId={storeId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
