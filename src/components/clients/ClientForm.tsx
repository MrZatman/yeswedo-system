'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientAction, updateClientAction } from '@/actions/clients'
import type { Client } from '@/types/database'

interface ClientFormProps {
  client?: Client
  storeId: string
  onSuccess?: () => void
}

export function ClientForm({ client, storeId, onSuccess }: ClientFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('store_id', storeId)

    startTransition(async () => {
      const result = client
        ? await updateClientAction(client.id, formData)
        : await createClientAction(formData)

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
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name}
            required
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ''}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ''}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={client?.address ?? ''}
            placeholder="123 Main St"
          />
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={client?.city ?? ''}
            placeholder="El Paso"
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            defaultValue={client?.state ?? 'TX'}
            placeholder="TX"
          />
        </div>

        <div>
          <Label htmlFor="zip_code">Zip Code</Label>
          <Input
            id="zip_code"
            name="zip_code"
            defaultValue={client?.zip_code ?? ''}
            placeholder="79912"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            name="notes"
            defaultValue={client?.notes ?? ''}
            placeholder="Any notes about the client"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          {isPending ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  )
}
