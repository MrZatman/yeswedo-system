'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Store } from 'lucide-react'

interface UserStore {
  id: string
  store_id: string
  is_default: boolean
  store: {
    id: string
    name: string
  }
}

interface StoreSelectorProps {
  stores: UserStore[]
  currentStoreId: string
}

export function StoreSelector({ stores, currentStoreId }: StoreSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStoreChange = (storeId: string) => {
    startTransition(async () => {
      const response = await fetch('/api/store/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId }),
      })

      if (response.ok) {
        router.refresh()
      }
    })
  }

  const currentStore = stores.find(s => s.store_id === currentStoreId)

  return (
    <div className="flex items-center gap-2">
      <Store className="h-4 w-4 text-gray-500" />
      <Select
        value={currentStoreId}
        onValueChange={handleStoreChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select store">
            {currentStore?.store.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stores.map((userStore) => (
            <SelectItem key={userStore.store_id} value={userStore.store_id}>
              {userStore.store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
