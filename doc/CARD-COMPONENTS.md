# Card Components - Documentación

## 📋 Descripción

Conjunto de componentes atómicos y composables para construir cards reutilizables en Angular Moderno. Diseñados siguiendo los principios de **screaming architecture** y **atomic design**.

## 🏗️ Estructura de Componentes

```
shared/components/
├── badges/
│   ├── author-badge.component.ts  # Avatar + nombre (REUTILIZABLE)
│   ├── tag-badge.component.ts     # Etiqueta individual (REUTILIZABLE)
│   └── index.ts                   # Barrel export
├── card/
│   ├── card.component.ts          # Contenedor principal
│   ├── card-header.component.ts   # Header con fecha
│   ├── card-title.component.ts    # Título
│   ├── card-description.component.ts # Descripción
│   ├── card-footer.component.ts   # Pie con autor y tags
│   └── index.ts                   # Barrel export
└── index.ts                       # Barrel export principal
```

### Razón de la Estructura
- **`badges/`**: Componentes atómicos reutilizables en cualquier contexto (perfiles, listas, etc.)
- **`card/`**: Composición específica de card que usa badges
- **Barrel exports (`index.ts`)**: Facilitan imports limpios desde cualquier lugar

## 💡 Casos de Uso

### CardComponent
- 📝 Blogs y artículos
- 📰 Noticias
- 🎨 Portfolio
- 🖼️ Galerías de contenido
- 📊 Feed de actividades

### AuthorBadgeComponent (Badge Independiente)
- 👤 Perfiles de usuario
- 👥 Listas de team members
- 💬 Comentarios de autores
- ℹ️ Secciones "Acerca del Autor"
- 🔐 Panel de usuario / Cierre de sesión

### TagBadgeComponent (Badge Independiente)
- 🔍 Filtros y categorías
- 🏷️ Etiquetado de contenido
- ✅ Estados de tareas (TODO, DONE, IN PROGRESS)
- 🚨 Niveles de severidad (ERROR, WARNING, INFO)
- 🛠️ Badges de habilidades
- 📍 Labels en listas

## 🎯 Componentes

### 1. **CardComponent** - Contenedor Principal
Orquesta todos los sub-componentes y gestiona la estructura general.

```typescript
interface CardConfig {
  date?: string;
  title: string;
  description: string;
  author: {
    name: string;
    initials: string;
  };
  tags: string[];
}

@Input() config = input.required<CardConfig>();
```

**Uso:**
```typescript
<app-card [config]="{
  date: 'OCT 2023',
  title: 'Mi Artículo',
  description: 'Descripción...',
  author: { name: 'Alex Rivera', initials: 'AR' },
  tags: ['ENGINEERING', 'THEORY']
}" />
```

---

### 2. **CardHeaderComponent**
Muestra la fecha de forma accesible con `<time>`.

```typescript
@Input() date = input<string | undefined>();
```

---

### 3. **CardTitleComponent**
Título principal de la card.

```typescript
@Input() title = input.required<string>();
```

---

### 4. **CardDescriptionComponent**
Descripción o subtítulo.

```typescript
@Input() description = input.required<string>();
```

---

### 5. **AuthorBadgeComponent**
Avatar con iniciales + nombre del autor.

```typescript
interface Author {
  name: string;
  initials: string;
}

@Input() author = input.required<Author>();
```

**Características:**
- Avatar circular con gradiente
- Iniciales centradas
- Accesibilidad con `aria-label`

---

### 6. **TagBadgeComponent**
Etiqueta individual reutilizable con múltiples variantes.

```typescript
type TagVariant = 'default' | 'accent' | 'success' | 'warning' | 'error';

@Input() tag = input.required<string>();
@Input() variant = input<TagVariant>('default');
```

**Variantes:**
| Variante | Color |
|----------|-------|
| `default` | Gris (gray-100/gray-600) |
| `accent` | Azul (blue-100/blue-600) |
| `success` | Verde (green-100/green-600) |
| `warning` | Amarillo (yellow-100/yellow-600) |
| `error` | Rojo (red-100/red-600) |

**Uso:**
```typescript
<app-tag-badge tag="ENGINEERING" variant="accent" />
<app-tag-badge tag="DONE" variant="success" />
<app-tag-badge tag="TODO" variant="warning" />
```

---

### 7. **CardFooterComponent**
Contenedor del pie con autor y tags.

```typescript
@Input() author = input.required<Author>();
@Input() tags = input.required<string[]>();
```

---

## 🎨 Estilos (TailwindCSS v4)

Todos los componentes usan TailwindCSS con una paleta consistente:

| Elemento | Clase Base |
|----------|-----------|
| Card | `rounded-lg bg-white p-8 shadow-sm` |
| Título | `text-3xl font-bold text-gray-900` |
| Descripción | `text-lg leading-relaxed text-gray-600` |
| Header | `text-sm uppercase tracking-wide text-gray-400` |
| Avatar | `h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200` |
| Tag | `text-xs uppercase tracking-wide text-gray-600 bg-gray-100` |

## ♿ Accesibilidad

✅ **WCAG AA Compliance**

- ✓ `<article>` semántico en CardComponent
- ✓ `<time>` con `dateTime` en CardHeaderComponent
- ✓ `<header>` y `<footer>` en lugar de divs
- ✓ `aria-label` en avatar
- ✓ `role="list"` y `role="listitem"` en tags
- ✓ Contraste de color > 4.5:1 en todos los textos
- ✓ Focus management automático (inputs nativos)

## 📱 Responsive

Todos los componentes son **mobile-first** con TailwindCSS:

```typescript
// Ejemplo: Avatar escalable
class="h-10 w-10 md:h-12 md:w-12"
```

## 🔧 Integración en el Proyecto

### Paso 1: Copiar Carpetas

```bash
src/app/shared/components/
├── badges/
│   ├── author-badge.component.ts
│   ├── tag-badge.component.ts
│   └── index.ts
├── card/
│   ├── card.component.ts
│   ├── card-header.component.ts
│   ├── card-title.component.ts
│   ├── card-description.component.ts
│   ├── card-footer.component.ts
│   └── index.ts
└── index.ts  # Barrel export principal
```

### Paso 2: Usar en Features

#### Opción A: Importar CardComponent directamente
```typescript
// features/blog/blog.component.ts
import { CardComponent } from '@app/shared/components/card';

@Component({
  imports: [CardComponent],
  template: `
    <div class="space-y-6">
      @for (article of articles(); track article.id) {
        <app-card [config]="article" />
      }
    </div>
  `
})
export class BlogComponent {}
```

#### Opción B: Importar desde barrel export principal (RECOMENDADO)
```typescript
// features/blog/blog.component.ts
import { CardComponent } from '@app/shared/components';

@Component({
  imports: [CardComponent],
  template: `...`
})
export class BlogComponent {}
```

#### Opción C: Usar Badges independientemente
```typescript
// features/team/team.component.ts
import { AuthorBadgeComponent, TagBadgeComponent } from '@app/shared/components';

@Component({
  imports: [AuthorBadgeComponent, TagBadgeComponent],
  template: `
    <div class="space-y-4">
      <app-author-badge [author]="member" />
      <app-tag-badge tag="DEVELOPER" variant="accent" />
    </div>
  `
})
export class TeamComponent {}
```

## 🎓 Patrones Utilizados

### 1. **Standalone Components**
Todos los componentes son standalone (Angular 22+).

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ...],
})
```

### 2. **Signals para Inputs**
Reemplaza `@Input()` decorators:

```typescript
// ✅ Moderno
title = input.required<string>();

// ❌ Antiguo
@Input() required title!: string;
```

### 3. **OnPush Change Detection**
Máximo rendimiento:

```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

### 4. **Native Control Flow**
Usa `@if` y `@for` en lugar de `*ngIf` y `*ngFor`:

```typescript
// ✅
@if (date()) { ... }
@for (tag of tags(); track tag) { ... }

// ❌
*ngIf="date"
*ngFor="let tag of tags"
```

### 5. **Composición sobre Herencia**
CardComponent orquesta componentes pequeños y enfocados.

---

## 🧪 Testing

### Ejemplo con Vitest

```typescript
import { render, screen } from '@testing-library/angular';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  it('should render card with title', async () => {
    const config = {
      title: 'Test Title',
      description: 'Test Desc',
      author: { name: 'Test', initials: 'T' },
      tags: [],
    };
    
    await render(CardComponent, { componentProperties: { config } });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

---

## 🚀 Extensiones Futuras

### Variantes del Avatar
```typescript
// Soportar imagen en lugar de iniciales
type AvatarType = 'initials' | 'image';
@Input() avatarType = input<AvatarType>('initials');
```

### Interactividad
```typescript
@Output() cardClicked = output<CardConfig>();
// Emitir cuando se haga click en la card
```

### Temas
```typescript
type CardTheme = 'light' | 'dark' | 'blue' | 'green';
@Input() theme = input<CardTheme>('light');
```

---

## 📝 Notas

- **No usar `@HostBinding` ni `@HostListener`**: Ya implementado con `host` en decoradores
- **No usar `ngClass` ni `ngStyle`**: Usar directamente en templates
- **No asumir globals**: Usar `isPlatformBrowser()` para browser-only logic
- **SSR Safe**: Todos los componentes son SSR-compatible (sin `window`, `document`, etc.)

---

## 📚 Referencias

- [Angular Signals](https://angular.io/guide/signals)
- [Signal Forms](https://angular.io/guide/forms/basic-syntax#signal-based-forms)
- [TailwindCSS v4](https://tailwindcss.com/docs)
- [WCAG AA Guidelines](https://www.w3.org/WAI/WCAG2AA-Conformance)
