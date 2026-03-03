# UI Components Guide - YesWeDo

Guía de componentes UI usando shadcn/ui.

## Setup Inicial

```bash
# Inicializar shadcn
npx shadcn-ui@latest init

# Componentes esenciales
npx shadcn-ui@latest add button input label card table dialog dropdown-menu select form toast badge avatar tabs separator sheet
```

## Paleta de Colores

Basado en los mockups (rojo/marrón + grises):

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 65% 35%;        /* Rojo/marrón principal */
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --accent: 0 65% 35%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89%;
    --input: 0 0% 89%;
    --ring: 0 65% 35%;
  }
}
```

## Layout Principal

```tsx
// components/layout/DashboardLayout.tsx
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Sidebar

```tsx
// components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  CreditCard,
  Package,
  Scissors,
  BarChart,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'My Work Today', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients Database', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/memberships', label: 'Memberships', icon: CreditCard },
  { href: '/clock', label: 'Clock In & Out', icon: Clock },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: BarChart },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
      <div className="p-6 border-b border-primary-foreground/20">
        <h1 className="text-xl font-bold">MENU</h1>
        <p className="text-sm opacity-80">Hey, Username!</p>
        <p className="text-xs opacity-60">Here's how things are going...</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
              pathname === item.href
                ? 'bg-primary-foreground/20 border-l-4 border-white'
                : 'hover:bg-primary-foreground/10'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 text-xs opacity-60 border-t border-primary-foreground/20">
        <p>Privacy Policy | Terms</p>
        <p>(915) 585.0713</p>
      </div>
    </aside>
  )
}
```

## Page Header

```tsx
// components/layout/PageHeader.tsx
interface PageHeaderProps {
  title: string
  action?: React.ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {action}
    </div>
  )
}

// Uso
<PageHeader
  title="APPOINTMENTS"
  action={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      New Appointment
    </Button>
  }
/>
```

## Cards de Métricas

```tsx
// components/dashboard/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

## Status Badge

```tsx
// components/ui/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusStyles = {
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  inactive: 'bg-red-100 text-red-800 hover:bg-red-100',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  scheduled: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
}

interface StatusBadgeProps {
  status: keyof typeof statusStyles
  children: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <Badge className={cn('font-normal', statusStyles[status])}>
      {children}
    </Badge>
  )
}
```

## Empty State

```tsx
// components/ui/empty-state.tsx
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  )
}

// Uso
<EmptyState
  icon={Calendar}
  title="No appointments today"
  description="Schedule your first appointment to get started"
  action={<Button>New Appointment</Button>}
/>
```

## Loading Skeleton

```tsx
// components/ui/table-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TableSkeletonProps {
  columns: number
  rows?: number
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```
