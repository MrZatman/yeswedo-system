'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, CreditCard, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    todayAppointments: number
    todayRevenue: number
    weekAppointments: number
    weekRevenue: number
    monthAppointments: number
    monthRevenue: number
    activeClients: number
    activeMemberships: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayAppointments}</div>
          <p className="text-xs text-gray-500">
            appointments · {formatCurrency(stats.todayRevenue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.weekRevenue)}</div>
          <p className="text-xs text-gray-500">
            {stats.weekAppointments} appointments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthRevenue)}</div>
          <p className="text-xs text-gray-500">
            {stats.monthAppointments} appointments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeClients}</div>
          <p className="text-xs text-gray-500">
            <CreditCard className="h-3 w-3 inline mr-1" />
            {stats.activeMemberships} memberships
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
