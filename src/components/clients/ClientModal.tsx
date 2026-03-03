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
import { ClientForm } from './ClientForm'
import { Plus } from 'lucide-react'
import type { Client } from '@/types/database'

interface ClientModalProps {
  storeId: string
  client?: Client
  trigger?: React.ReactNode
}

export function ClientModal({ storeId, client, trigger }: ClientModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>
        <ClientForm
          client={client}
          storeId={storeId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
