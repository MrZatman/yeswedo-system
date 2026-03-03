# Table Patterns - YesWeDo

Patrones para tablas de datos con TanStack Table (DataTable).

## Setup con shadcn/ui

```bash
npx shadcn-ui@latest add table
pnpm add @tanstack/react-table
```

## DataTable Component Base

```tsx
// components/ui/data-table.tsx
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

## Definir Columnas

```tsx
// components/tables/clients-columns.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  membership: string | null
  status: 'active' | 'inactive'
}

export const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.id.slice(0, 8)}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || '-',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    accessorKey: 'membership',
    header: 'Membership',
    cell: ({ row }) => (
      row.original.membership ? (
        <Badge variant="secondary">{row.original.membership}</Badge>
      ) : (
        <Badge variant="outline">None</Badge>
      )
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'active' ? 'default' : 'destructive'}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const client = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>New Appointment</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

## Uso en Página

```tsx
// app/(dashboard)/clients/page.tsx
import { getClients } from '@/actions/clients'
import { DataTable } from '@/components/ui/data-table'
import { clientColumns } from '@/components/tables/clients-columns'
import { ClientModal } from '@/components/modals/ClientModal'
import { getCurrentStore } from '@/lib/supabase/helpers'

export default async function ClientsPage() {
  const storeId = await getCurrentStore()
  const clients = await getClients(storeId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients Database</h1>
        <ClientModal storeId={storeId} />
      </div>

      <DataTable
        columns={clientColumns}
        data={clients}
        searchKey="name"
        searchPlaceholder="Search clients..."
      />
    </div>
  )
}
```

## Row Click para Navegación

```tsx
<TableRow
  key={row.id}
  onClick={() => router.push(`/clients/${row.original.id}`)}
  className="cursor-pointer hover:bg-muted"
>
```

## Table con Server-Side Pagination

```tsx
// Para datasets grandes
interface ServerDataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  pageCount: number
  page: number
  onPageChange: (page: number) => void
}

// Uso con searchParams
const searchParams = useSearchParams()
const page = Number(searchParams.get('page')) || 1
const { data, totalPages } = await getClientsPaginated(storeId, page, 10)
```
