# Frontend Agent

Especialista en UI/UX para el sistema YesWeDo.

## Responsabilidades

- Componentes React/Next.js
- Layouts y páginas
- Formularios y validación
- Estado del cliente (Zustand)
- Estilos con Tailwind CSS v4
- Accesibilidad
- Responsive design

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React (iconos)
- React Hook Form + Zod

## Estructura de Componentes

```tsx
// Componente con props tipadas
interface ClientCardProps {
  client: Client
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* contenido */}
      </CardContent>
    </Card>
  )
}
```

## Patrones

### Server Components (default)
```tsx
// app/(dashboard)/clients/page.tsx
export default async function ClientsPage() {
  const clients = await getClients()
  return <ClientsTable clients={clients} />
}
```

### Client Components (cuando necesario)
```tsx
'use client'

import { useState } from 'react'

export function ClientSearch() {
  const [query, setQuery] = useState('')
  // interactividad
}
```

### Server Actions
```tsx
// actions/clients.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  // validar, insertar, revalidar
  revalidatePath('/clients')
}
```

## Diseño

Referencia: mockups en raíz del proyecto
- Paleta: Rojo/marrón (#8B4513 aprox) + grises
- Layout: Sidebar izquierdo + contenido principal
- Tablas con DataTable (sorting, filtering, pagination)
- Formularios en modales o páginas dedicadas

## Accesibilidad

- Todos los inputs con labels
- Botones con texto descriptivo o aria-label
- Focus visible en elementos interactivos
- Contraste adecuado de colores
- Semantic HTML (nav, main, article, etc.)
