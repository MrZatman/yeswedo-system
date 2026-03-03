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
import { MembershipPlanForm } from './MembershipPlanForm'
import { Plus } from 'lucide-react'
import type { MembershipPlan } from '@/types/database'

interface MembershipPlanModalProps {
  storeId: string
  plan?: MembershipPlan
  trigger?: React.ReactNode
}

export function MembershipPlanModal({ storeId, plan, trigger }: MembershipPlanModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Membership Plan' : 'Create Membership Plan'}</DialogTitle>
        </DialogHeader>
        <MembershipPlanForm
          plan={plan}
          storeId={storeId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
