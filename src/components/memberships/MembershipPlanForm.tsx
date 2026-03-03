'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMembershipPlanAction, updateMembershipPlanAction } from '@/actions/memberships'
import type { MembershipPlan } from '@/types/database'

interface MembershipPlanFormProps {
  plan?: MembershipPlan
  storeId: string
  onSuccess?: () => void
}

export function MembershipPlanForm({ plan, storeId, onSuccess }: MembershipPlanFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(plan?.is_active ?? true)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(plan?.billing_period ?? 'monthly')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('store_id', storeId)
    formData.set('is_active', String(isActive))
    formData.set('billing_period', billingPeriod)

    startTransition(async () => {
      const result = plan
        ? await updateMembershipPlanAction(plan.id, formData)
        : await createMembershipPlanAction(formData)

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
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={plan?.name}
            required
            placeholder="e.g., Gold Membership"
          />
        </div>

        <div>
          <Label htmlFor="shortcode">Shortcode *</Label>
          <Input
            id="shortcode"
            name="shortcode"
            defaultValue={plan?.shortcode}
            required
            maxLength={10}
            placeholder="e.g., GOLD"
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
            defaultValue={plan?.price ?? 0}
            required
          />
        </div>

        <div>
          <Label htmlFor="billing_period">Billing Period *</Label>
          <Select value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'yearly')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="haircuts_included">Haircuts Included</Label>
          <Input
            id="haircuts_included"
            name="haircuts_included"
            type="number"
            min="0"
            defaultValue={plan?.haircuts_included ?? 0}
            placeholder="0 = unlimited"
          />
        </div>

        <div>
          <Label htmlFor="discount_percentage">Product Discount %</Label>
          <Input
            id="discount_percentage"
            name="discount_percentage"
            type="number"
            min="0"
            max="100"
            defaultValue={plan?.discount_percentage ?? 0}
          />
        </div>

        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            min="0"
            defaultValue={plan?.sort_order ?? 0}
          />
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={plan?.description ?? ''}
            placeholder="Plan benefits and features..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          {isPending ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
}
