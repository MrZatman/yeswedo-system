'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus } from 'lucide-react'
import { inviteStaffAction } from '@/actions/staff'

interface InviteStaffModalProps {
  storeId: string
}

export function InviteStaffModal({ storeId }: InviteStaffModalProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<'store_manager' | 'staff'>('staff')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('store_id', storeId)
    formData.set('role', role)

    startTransition(async () => {
      const result = await inviteStaffAction(formData)

      if (result.error) {
        alert(result.error)
        return
      }

      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'store_manager' | 'staff')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="store_manager">Store Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
              {isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
