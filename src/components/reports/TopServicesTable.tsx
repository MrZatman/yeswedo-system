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
import { Scissors } from 'lucide-react'

interface TopService {
  name: string
  count: number
  revenue: number
}

interface TopServicesTableProps {
  services: TopService[]
}

export function TopServicesTable({ services }: TopServicesTableProps) {
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
          <Scissors className="h-5 w-5" />
          Top Services (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No data yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-right">{service.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
