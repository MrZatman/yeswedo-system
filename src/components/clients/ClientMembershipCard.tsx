'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreditCard, Pause, Play, X } from 'lucide-react'
import {
  assignMembershipAction,
  cancelMembershipAction,
  pauseMembershipAction,
  resumeMembershipAction,
} from '@/actions/client-memberships'
import { getMembershipPlans } from '@/actions/memberships'

interface MembershipPlan {
  id: string
  name: string
  shortcode: string
  price: number
  billing_period: string
  haircuts_included: number
  is_active?: boolean
}

interface ClientMembership {
  id: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  start_date: string
  end_date: string | null
  visits_used: number
  visits_remaining: number
  plan: MembershipPlan
}

interface ClientMembershipCardProps {
  clientId: string
  storeId: string
  membership: ClientMembership | null
}

export function ClientMembershipCard({ clientId, storeId, membership }: ClientMembershipCardProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getMembershipPlans(storeId).then(setPlans)
    }
  }, [open, storeId])

  const handleAssign = () => {
    if (!selectedPlanId) return
    const formData = new FormData()
    formData.set('client_id', clientId)
    formData.set('plan_id', selectedPlanId)
    formData.set('store_id', storeId)

    startTransition(async () => {
      const result = await assignMembershipAction(formData)
      if (result.error) {
        alert(result.error)
        return
      }
      setOpen(false)
      setSelectedPlanId('')
      router.refresh()
    })
  }

  const handleCancel = () => {
    if (!membership || !confirm('Cancel this membership?')) return
    startTransition(async () => {
      await cancelMembershipAction(membership.id, clientId)
      router.refresh()
    })
  }

  const handlePause = () => {
    if (!membership) return
    startTransition(async () => {
      await pauseMembershipAction(membership.id, clientId)
      router.refresh()
    })
  }

  const handleResume = () => {
    if (!membership) return
    startTransition(async () => {
      await resumeMembershipAction(membership.id, clientId)
      router.refresh()
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Membership
        </CardTitle>
      </CardHeader>
      <CardContent>
        {membership ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{membership.plan.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatCurrency(membership.plan.price)}/{membership.plan.billing_period === 'monthly' ? 'mo' : 'yr'}
                </p>
              </div>
              {getStatusBadge(membership.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Started</p>
                <p className="font-medium">{formatDate(membership.start_date)}</p>
              </div>
              {membership.end_date && (
                <div>
                  <p className="text-gray-500">Expires</p>
                  <p className="font-medium">{formatDate(membership.end_date)}</p>
                </div>
              )}
              {membership.plan.haircuts_included > 0 && (
                <>
                  <div>
                    <p className="text-gray-500">Visits Used</p>
                    <p className="font-medium">{membership.visits_used}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Remaining</p>
                    <p className="font-medium">{membership.visits_remaining}</p>
                  </div>
                </>
              )}
            </div>

            {membership.status === 'active' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  disabled={isPending}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}

            {membership.status === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResume}
                disabled={isPending}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Badge variant="outline" className="mb-2">No active membership</Badge>
            <p className="text-sm text-gray-500 mb-4">
              This client doesn&apos;t have an active membership plan.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
                  Assign Membership
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Membership Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.filter(p => p.is_active !== false).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {formatCurrency(plan.price)}/{plan.billing_period === 'monthly' ? 'mo' : 'yr'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssign}
                      disabled={!selectedPlanId || isPending}
                      className="bg-[#8B3A3A] hover:bg-[#722F2F]"
                    >
                      {isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
