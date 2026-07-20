# Badges Components

## 🏷️ Descripción

Componentes de badges atómicos y reutilizables que pueden usarse en cualquier contexto dentro de la aplicación. Están ubicados en **`src/app/shared/components/badges/`** para facilitar su reuso en múltiples features.

## 📦 Componentes

### AuthorBadgeComponent
Avatar circular con iniciales + nombre del autor.

**Props:**
```typescript
interface Author {
  name: string;
  initials: string;
}

@Input() author = input.required<Author>();
```

**Ejemplo:**
```typescript
<app-author-badge [author]="{ name: 'Alex Rivera', initials: 'AR' }" />
```

**Casos de Uso:**
- Panel de usuario
- Perfiles
- Comentarios
- Listas de team members
- About sections

---

### TagBadgeComponent
Etiqueta con múltiples variantes de color.

**Props:**
```typescript
type TagVariant = 'default' | 'accent' | 'success' | 'warning' | 'error';

@Input() tag = input.required<string>();
@Input() variant = input<TagVariant>('default');
```

**Variantes:**
```typescript
// Gris
<app-tag-badge tag="GENERAL" variant="default" />

// Azul
<app-tag-badge tag="FEATURE" variant="accent" />

// Verde
<app-tag-badge tag="DONE" variant="success" />

// Amarillo
<app-tag-badge tag="TODO" variant="warning" />

// Rojo
<app-tag-badge tag="ERROR" variant="error" />
```

**Casos de Uso:**
- Filtros y categorías
- Estados de tareas
- Niveles de severidad
- Etiquetado de contenido
- Status badges
- Skill tags

---

## 🎨 Estilos

### AuthorBadgeComponent
```
Avatar:  h-10 w-10, rounded-full, gradient blue
Nombre:  text-base, font-medium, gray-900
Contenedor: flex gap-3
```

### TagBadgeComponent
```
Base:    text-xs, uppercase, tracking-wide
Padding: px-3 py-1
Border:  rounded-md
Inline:  inline-block

default:  bg-gray-100, text-gray-600
accent:   bg-blue-100, text-blue-600
success:  bg-green-100, text-green-600
warning:  bg-yellow-100, text-yellow-600
error:    bg-red-100, text-red-600
```

---

## ♿ Accesibilidad

✅ **WCAG AA Compliant**

- AuthorBadgeComponent:
  - `role="img"` en avatar
  - `aria-label` dinámico con el nombre
  
- TagBadgeComponent:
  - `role="status"` para status badges
  - Contraste >= 4.5:1

---

## 📚 Ejemplos de Integración

### Ejemplo 1: Panel de Usuario
```typescript
// shared/components/user-panel/user-panel.component.ts
import { AuthorBadgeComponent } from '@app/shared/components';

@Component({
  imports: [AuthorBadgeComponent],
  template: `
    <aside class="border-l border-gray-200 p-4">
      <h3 class="mb-4 font-semibold">Sesión Activa</h3>
      <app-author-badge [author]="currentUser" />
    </aside>
  `
})
export class UserPanelComponent {
  currentUser = { name: 'Alex Rivera', initials: 'AR' };
}
```

### Ejemplo 2: Filtros de Categorías
```typescript
// features/marketplace/marketplace.component.ts
import { TagBadgeComponent } from '@app/shared/components';

@Component({
  imports: [TagBadgeComponent],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (category of categories(); track category) {
        <button
          (click)="filterByCategory(category)"
          class="cursor-pointer hover:opacity-80"
        >
          <app-tag-badge [tag]="category" variant="accent" />
        </button>
      }
    </div>
  `
})
export class MarketplaceComponent {
  categories = () => ['FEATURED', 'NEW', 'POPULAR'];
}
```

### Ejemplo 3: Estado de Tareas
```typescript
// features/kanban/task-card/task-card.component.ts
import { TagBadgeComponent } from '@app/shared/components';

@Component({
  imports: [TagBadgeComponent],
  template: `
    <div class="rounded-lg bg-white p-4">
      <h4>{{ task().title }}</h4>
      <app-tag-badge 
        [tag]="task().status" 
        [variant]="getStatusVariant(task().status)"
      />
    </div>
  `
})
export class TaskCardComponent {
  task = input.required<Task>();

  getStatusVariant(status: string) {
    const variants = {
      'TODO': 'warning',
      'IN PROGRESS': 'accent',
      'DONE': 'success',
      'BLOCKED': 'error',
    };
    return variants[status] || 'default';
  }
}
```

### Ejemplo 4: Skills del Team
```typescript
// features/team/member-profile/member-profile.component.ts
import { AuthorBadgeComponent, TagBadgeComponent } from '@app/shared/components';

@Component({
  imports: [AuthorBadgeComponent, TagBadgeComponent],
  template: `
    <article class="rounded-lg bg-white p-6">
      <app-author-badge [author]="member().author" />
      
      <section class="mt-4">
        <h4 class="mb-2 font-semibold">Habilidades</h4>
        <div class="flex flex-wrap gap-2">
          @for (skill of member().skills; track skill) {
            <app-tag-badge [tag]="skill" variant="accent" />
          }
        </div>
      </section>
    </article>
  `
})
export class MemberProfileComponent {
  member = input.required<TeamMember>();
}
```

---

## 🔗 Importación

### Desde Barrel Export Principal
```typescript
import { AuthorBadgeComponent, TagBadgeComponent } from '@app/shared/components';
```

### Desde Carpeta Específica
```typescript
import { AuthorBadgeComponent, TagBadgeComponent } from '@app/shared/components/badges';
```

---

## 🚀 Extensiones Futuras

### AuthorBadgeComponent
- [ ] Soportar imagen de perfil además de iniciales
- [ ] Tamaño configurable (small, medium, large)
- [ ] Estados (online, offline, away)
- [ ] Click para navegar a perfil

### TagBadgeComponent
- [ ] Dismissible (con botón X)
- [ ] Icon support
- [ ] Animated badge (pulse, bounce)
- [ ] Custom colors

---

## ✨ Best Practices

1. **Reutilización**: Estos badges están en `shared/` porque son genéricos. Úsalos en múltiples features.

2. **Composición**: Combina badges para crear interfaces complejas (ej: autor + tags juntos)

3. **Accesibilidad**: Todos tienen ARIA attributes. No elimines `role` ni `aria-label`.

4. **Responsive**: Son mobile-first. Ajusta el tamaño con TailwindCSS si necesitas.

5. **Type-Safe**: Usa TypeScript strict para los tipos de `variant` y `author`.

---

## 📝 Convenciones

- **Prefijo**: Todos usan `app-` en el selector
- **Ubicación**: `src/app/shared/components/badges/`
- **Exports**: Via barrel export en `index.ts`
- **Imports**: Prefer el barrel export principal
