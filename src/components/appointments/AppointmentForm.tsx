'use client'

import { useTransition, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createAppointmentAction, getActiveClients, getActiveServices, getAvailableStaff } from '@/actions/appointments'

interface AppointmentFormProps {
  storeId: string
  onSuccess?: () => void
}

interface Client {
  id: string
  name: string
  phone: string | null
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

interface Staff {
  id: string
  name: string
}

export function AppointmentForm({ storeId, onSuccess }: AppointmentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [clientId, setClientId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const [clientsData, servicesData, staffData] = await Promise.all([
        getActiveClients(storeId),
        getActiveServices(storeId),
        getAvailableStaff(storeId),
      ])
      setClients(clientsData)
      setServices(servicesData)
      setStaff(staffData)
    }
    loadData()
  }, [storeId])

  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length >= 2) {
        const data = await getActiveClients(storeId, clientSearch)
        setClients(data)
      }
    }
    const timeout = setTimeout(searchClients, 300)
    return () => clearTimeout(timeout)
  }, [clientSearch, storeId])

  const totalDuration = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.duration_minutes, 0) || 30

  const totalPrice = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('store_id', storeId)
    formData.set('client_id', clientId)
    formData.set('staff_id', staffId)
    formData.set('services', selectedServices.join(','))
    formData.set('duration_minutes', String(totalDuration))

    startTransition(async () => {
      const result = await createAppointmentAction(formData)

      if (result.error) {
        alert(result.error)
        return
      }

      onSuccess?.()
      router.refresh()
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Client *</Label>
          <Input
            placeholder="Search client by name or phone..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="mb-2"
          />
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} {client.phone && `(${client.phone})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Staff *</Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Select barber" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            min={today}
            defaultValue={today}
            required
          />
        </div>

        <div>
          <Label htmlFor="start_time">Time *</Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            defaultValue="09:00"
            required
          />
        </div>

        <div>
          <Label>Duration</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 text-sm">
            {totalDuration} minutes
          </div>
        </div>

        <div className="col-span-2">
          <Label>Services</Label>
          <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedServices([...selectedServices, service.id])
                    } else {
                      setSelectedServices(selectedServices.filter(id => id !== service.id))
                    }
                  }}
                />
                <span className="text-sm">{service.name}</span>
                <span className="text-sm text-gray-500">${service.price}</span>
              </label>
            ))}
          </div>
          {totalPrice > 0 && (
            <p className="text-sm text-right mt-1 font-medium">
              Total: ${totalPrice.toFixed(2)}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any special requests..."
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending || !clientId || !staffId} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          {isPending ? 'Booking...' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  )
}
