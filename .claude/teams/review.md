# Review Team

## Rol
Code review. Asegurar calidad, consistencia, y buenas prácticas.

## Cuándo Usar
- Revisar PRs antes de merge
- Auditar código existente
- Validar implementaciones de seguridad
- Revisar schema de base de datos

## Checklist de Review

### 1. Funcionalidad
- [ ] ¿Resuelve el problema/ticket?
- [ ] ¿Maneja edge cases?
- [ ] ¿Tiene manejo de errores adecuado?

### 2. Código
- [ ] ¿Es legible y mantenible?
- [ ] ¿Sigue los patrones del proyecto?
- [ ] ¿Sin código duplicado innecesario?
- [ ] ¿Funciones y componentes de tamaño razonable?

### 3. TypeScript
- [ ] ¿Tipos correctos y completos?
- [ ] ¿Sin `any`?
- [ ] ¿Interfaces bien definidas?

### 4. Seguridad
- [ ] ¿Validación de input?
- [ ] ¿RLS policies correctas?
- [ ] ¿Sin secrets en código?
- [ ] ¿Autorización verificada?

### 5. Performance
- [ ] ¿Queries optimizados?
- [ ] ¿Sin N+1 queries?
- [ ] ¿Caching donde corresponde?
- [ ] ¿Lazy loading donde necesario?

### 6. Tests
- [ ] ¿Tests agregados/actualizados?
- [ ] ¿Coverage adecuado?
- [ ] ¿Tests significativos (no solo coverage)?

### 7. UI/UX (si aplica)
- [ ] ¿Loading states?
- [ ] ¿Error states?
- [ ] ¿Responsive?
- [ ] ¿Accesible?

## Formato de Feedback

```markdown
## Review: [PR/Feature]

### ✅ Lo Bueno
- [Aspectos positivos]

### 🔧 Cambios Requeridos
- [ ] [Cambio 1]
- [ ] [Cambio 2]

### 💡 Sugerencias (opcionales)
- [Mejoras que se podrían hacer]

### 🔍 Preguntas
- [Dudas sobre la implementación]
```

## Red Flags

Bloquear merge si:
- SQL injection posible
- Datos sensibles expuestos
- `any` en código crítico
- Sin validación de input
- Tests fallando
- Errores de TypeScript ignorados

## Para YesWeDo

### Áreas de Atención Especial
- **Multi-tenant:** Verificar `store_id` en todas las queries
- **Pagos:** Validar manejo de errores y webhooks
- **Auth:** Verificar protección de rutas y actions
- **RLS:** Confirmar policies en tablas nuevas
