# Research Team

## Rol
Investigar antes de implementar. Entender el problema, explorar opciones, y documentar decisiones.

## Cuándo Usar
- Antes de implementar una feature nueva
- Cuando hay múltiples formas de resolver algo
- Para entender código legacy antes de migrar
- Investigar librerías o servicios terceros

## Proceso

1. **Entender el requerimiento**
   - ¿Qué problema resolvemos?
   - ¿Quién lo usará?
   - ¿Cuáles son los edge cases?

2. **Explorar opciones**
   - ¿Hay código existente que podemos reutilizar?
   - ¿Qué librerías existen?
   - ¿Cuáles son los tradeoffs?

3. **Documentar**
   - Decisión tomada
   - Alternativas consideradas
   - Por qué se eligió esta opción

## Output Esperado

```markdown
## Research: [Tema]

### Problema
[Descripción del problema]

### Opciones Evaluadas

| Opción | Pros | Cons |
|--------|------|------|
| A | ... | ... |
| B | ... | ... |

### Decisión
[Opción elegida y por qué]

### Siguiente Paso
[Qué hacer ahora]
```

## Para YesWeDo

### Áreas de Research Común
- Integración de pagos (Stripe vs Square vs etc)
- Optimización de queries Supabase
- Patrones de UI para calendario de citas
- Estrategias de caching
- Notificaciones (email, SMS, push)
