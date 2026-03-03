'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction, updateStoreAction } from '@/actions/settings'

interface ProfileData {
  name: string
  email: string
  phone: string
}

interface StoreData {
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  email: string
}

interface SettingsFormProps {
  type: 'profile' | 'store'
  storeId?: string
  data: ProfileData | StoreData
}

export function SettingsForm({ type, storeId, data }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let result
      if (type === 'profile') {
        result = await updateProfileAction(formData)
      } else if (storeId) {
        result = await updateStoreAction(storeId, formData)
      }

      if (result?.error) {
        alert(result.error)
        return
      }

      router.refresh()
    })
  }

  if (type === 'profile') {
    const profileData = data as ProfileData
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={profileData.name}
            placeholder="Your name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profileData.email}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profileData.phone}
            placeholder="(555) 123-4567"
          />
        </div>

        <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    )
  }

  const storeData = data as StoreData
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Store Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={storeData.name}
            placeholder="Store name"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={storeData.address}
            placeholder="123 Main St"
          />
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={storeData.city}
            placeholder="El Paso"
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            defaultValue={storeData.state}
            placeholder="TX"
          />
        </div>

        <div>
          <Label htmlFor="zip_code">Zip Code</Label>
          <Input
            id="zip_code"
            name="zip_code"
            defaultValue={storeData.zip_code}
            placeholder="79912"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={storeData.phone}
            placeholder="(915) 555-1234"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="email">Store Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={storeData.email}
            placeholder="store@example.com"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
        {isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
