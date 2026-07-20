# 📁 Estructura de Carpetas - Componentes Compartidos

## Visión General

```
src/app/
├── core/                          # Servicios globales, interceptors
├── shared/
│   ├── components/               # ← AQUÍ VAN TODOS LOS COMPONENTES
│   │   ├── badges/              # ✨ REUTILIZABLE EN CUALQUIER LUGAR
│   │   │   ├── author-badge.component.ts
│   │   │   ├── tag-badge.component.ts
│   │   │   └── index.ts          # Barrel export
│   │   │
│   │   ├── card/                # Composición específica de card
│   │   │   ├── card.component.ts
│   │   │   ├── card-header.component.ts
│   │   │   ├── card-title.component.ts
│   │   │   ├── card-description.component.ts
│   │   │   ├── card-footer.component.ts
│   │   │   └── index.ts          # Barrel export
│   │   │
│   │   └── index.ts              # Barrel export principal
│   │
│   └── styles/                   # Estilos globales, variables de Tailwind
│
├── features/
│   ├── blog/                     # Feature que usa CardComponent
│   │   ├── blog.component.ts
│   │   └── blog.routes.ts
│   │
│   ├── team/                     # Feature que usa AuthorBadgeComponent
│   │   ├── team.component.ts
│   │   └── team.routes.ts
│   │
│   └── kanban/                   # Feature que usa TagBadgeComponent
│       ├── kanban.component.ts
│       └── kanban.routes.ts
│
└── app.config.ts
```

---

## 🔄 Dependencias entre Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                   CardComponent                             │
│  (Composición de alto nivel para cards de contenido)       │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
    ┌──────────────┐ ┌──────────────────┐
    │CardHeader    │ │CardTitle         │
    │CardFooter    │ │CardDescription   │
    └──────────────┘ └──────────────────┘
            │                 │
            └─────────┬───────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    ┌─────────────┐          ┌─────────────┐
    │AuthorBadge  │          │TagBadge     │
    │(REUTILIZABLE)          │(REUTILIZABLE)
    └─────────────┘          └─────────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼────────┐
              │shared/badges/  │
              │(Atómicos)      │
              └────────────────┘
```

### Leyenda
- **CardComponent** → Uso específico en cards
- **AuthorBadgeComponent** → Reutilizable en cualquier lugar (perfil, team, comentarios, etc.)
- **TagBadgeComponent** → Reutilizable en cualquier lugar (filtros, estado, etiquetas, etc.)

---

## 📋 Checklist de Instalación

### ✅ Paso 1: Crear Carpetas
```bash
mkdir -p src/app/shared/components/badges
mkdir -p src/app/shared/components/card
```

### ✅ Paso 2: Copiar Archivos de BADGES

**Carpeta:** `src/app/shared/components/badges/`

```
author-badge.component.ts   ← Del archivo descargado
tag-badge.component.ts      ← Del archivo descargado
index.ts                    ← Del archivo "badges-index.ts" descargado
```

### ✅ Paso 3: Copiar Archivos de CARD

**Carpeta:** `src/app/shared/components/card/`

```
card.component.ts           ← Del archivo descargado
card-header.component.ts    ← Del archivo descargado
card-title.component.ts     ← Del archivo descargado
card-description.component.ts ← Del archivo descargado
card-footer.component.ts    ← Del archivo descargado
index.ts                    ← Del archivo "card-index.ts" descargado
```

### ✅ Paso 4: Copiar Barrel Export Principal

**Ubicación:** `src/app/shared/components/index.ts`

```typescript
// src/app/shared/components/index.ts
export * from './badges';
export * from './card';
```

---

## 🚀 Cómo Importar en Tus Features

### Opción A: Importar desde el Barrel Principal (RECOMENDADO) ⭐
```typescript
// features/blog/blog.component.ts
import { CardComponent } from '@app/shared/components';
// o
import { AuthorBadgeComponent, TagBadgeComponent } from '@app/shared/components';

@Component({
  imports: [CardComponent, AuthorBadgeComponent],
  template: `...`
})
export class BlogComponent {}
```

### Opción B: Importar desde Carpeta Específica
```typescript
// features/team/team.component.ts
import { AuthorBadgeComponent } from '@app/shared/components/badges';

@Component({
  imports: [AuthorBadgeComponent],
  template: `...`
})
export class TeamComponent {}
```

### Opción C: Importar Directamente
```typescript
// features/kanban/kanban.component.ts
import { TagBadgeComponent } from '@app/shared/components/badges/tag-badge.component';

@Component({
  imports: [TagBadgeComponent],
  template: `...`
})
export class KanbanComponent {}
```

**Recomendación:** Usa la Opción A para mantener los imports limpios y centralizados.

---

## 📊 Matriz de Reutilización

| Componente | CardComponent | Blog | Team | Kanban | Profile | Comments |
|------------|:-------------:|:----:|:----:|:------:|:-------:|:--------:|
| CardComponent | - | ✅ | ✅ | ❌ | ❌ | ❌ |
| AuthorBadge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TagBadge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 Path Aliases para Facilitar Imports

Si tu proyecto usa path aliases en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"]
    }
  }
}
```

Entonces puedes:

```typescript
// ✅ Recomendado - Usar @app
import { CardComponent } from '@app/shared/components';

// ✅ O @shared
import { AuthorBadgeComponent } from '@shared/components';

// ❌ Evitar rutas relativas largas
import { CardComponent } from '../../../shared/components/card';
```

---

## 🎯 Ejemplos de Integración por Feature

### Blog Feature
```typescript
// features/blog/blog.component.ts
import { CardComponent } from '@app/shared/components';

@Component({
  imports: [CardComponent, CommonModule],
  template: `
    <div class="space-y-6">
      @for (article of articles(); track article.id) {
        <app-card [config]="article" />
      }
    </div>
  `
})
export class BlogComponent {
  articles = () => [...];
}
```

### Team Feature
```typescript
// features/team/team.component.ts
import { AuthorBadgeComponent } from '@app/shared/components';

@Component({
  imports: [AuthorBadgeComponent, CommonModule],
  template: `
    <div class="space-y-4">
      @for (member of teamMembers(); track member.id) {
        <app-author-badge [author]="member.author" />
      }
    </div>
  `
})
export class TeamComponent {
  teamMembers = () => [...];
}
```

### Kanban Feature
```typescript
// features/kanban/kanban.component.ts
import { TagBadgeComponent } from '@app/shared/components';

@Component({
  imports: [TagBadgeComponent, CommonModule],
  template: `
    <div>
      @for (task of tasks(); track task.id) {
        <div class="space-y-2">
          <h4>{{ task.title }}</h4>
          <app-tag-badge 
            [tag]="task.status" 
            [variant]="getStatusVariant(task.status)"
          />
        </div>
      }
    </div>
  `
})
export class KanbanComponent {
  tasks = () => [...];
  
  getStatusVariant(status: string) {
    return { 'TODO': 'warning', 'DONE': 'success', 'ERROR': 'error' }[status] || 'default';
  }
}
```

---

## 🔍 Validación

Después de copiar todo, valida que:

```bash
# ✅ Estructura correcta
ls -la src/app/shared/components/badges/
ls -la src/app/shared/components/card/

# ✅ No hay errores de TypeScript
ng lint
ng build

# ✅ Tests pasan (si existen)
ng test
```

---

## 📝 Notas Importantes

1. **Badges en shared/**: No duplicar `AuthorBadge` y `TagBadge` en otros lugares. Siempre importar desde `shared/components/badges/`.

2. **CardComponent específico**: Si necesitas una variación especial de card, considera crear `card-advanced/` o `card-minimal/` en lugar de duplicar.

3. **Barrel exports**: Los archivos `index.ts` facilitan imports limpios. No los elimines.

4. **Screaming Architecture**: La estructura refleja el dominio (badges son genéricos, card es composición específica).

5. **TypeScript Strict**: No usar `any`. Todos los tipos están definidos.

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@app/shared/components'"
→ Verifica que exista `src/app/shared/components/index.ts` y contiene los exports.

### Error: "Cannot find module 'card-footer'"
→ Asegúrate de que `card-footer.component.ts` importe correctamente desde `../badges`:
```typescript
import { AuthorBadgeComponent, TagBadgeComponent } from '../badges';
```

### El badge no se ve
→ Verifica que TailwindCSS esté configurado y cargado en `styles.css` o `tailwind.config.ts`.

### Build lento
→ Asegúrate de tener `changeDetection: ChangeDetectionStrategy.OnPush` en todos los componentes.

---

## 📚 Referencias Dentro del Proyecto

- Documentación General: `CARD-COMPONENTS.md`
- Documentación de Badges: `BADGES-README.md`
- Ejemplo de Uso: `example-usage.component.ts`
