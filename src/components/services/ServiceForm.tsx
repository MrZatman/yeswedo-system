'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createServiceAction, updateServiceAction } from '@/actions/services'
import type { Service } from '@/types/database'

interface ServiceFormProps {
  service?: Service
  storeId: string
  onSuccess?: () => void
}

export function ServiceForm({ service, storeId, onSuccess }: ServiceFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(service?.is_active ?? true)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('store_id', storeId)
    formData.set('is_active', String(isActive))

    startTransition(async () => {
      const result = service
        ? await updateServiceAction(service.id, formData)
        : await createServiceAction(formData)

      if (result.error) {
        alert(result.error)
        return
      }

      onSuccess?.()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={service?.name}
            required
            placeholder="e.g., Haircut"
          />
        </div>

        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={service?.price ?? 0}
            required
          />
        </div>

        <div>
          <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min="5"
            step="5"
            defaultValue={service?.duration_minutes ?? 30}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={service?.category ?? ''}
            placeholder="e.g., Hair, Beard, Combo"
          />
        </div>

        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            min="0"
            defaultValue={service?.sort_order ?? 0}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ''}
            placeholder="Service description..."
            rows={3}
          />
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          {isPending ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  )
}
