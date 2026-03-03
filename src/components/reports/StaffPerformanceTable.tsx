'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface StaffPerformance {
  name: string
  appointments: number
  revenue: number
  hoursWorked: number
}

interface StaffPerformanceTableProps {
  staff: StaffPerformance[]
}

export function StaffPerformanceTable({ staff }: StaffPerformanceTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Staff Performance (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No data yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead className="text-right">Appointments</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right">{s.appointments}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.revenue)}</TableCell>
                  <TableCell className="text-right">{s.hoursWorked}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
