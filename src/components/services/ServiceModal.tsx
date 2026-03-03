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
import { ServiceForm } from './ServiceForm'
import { Plus } from 'lucide-react'
import type { Service } from '@/types/database'

interface ServiceModalProps {
  storeId: string
  service?: Service
  trigger?: React.ReactNode
}

export function ServiceModal({ storeId, service, trigger }: ServiceModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
            <Plus className="mr-2 h-4 w-4" />
            New Service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <ServiceForm
          service={service}
          storeId={storeId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
