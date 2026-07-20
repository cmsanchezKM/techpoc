import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  template: `
    <nav
      class="flex items-center justify-between gap-2 px-4 py-3"
      [attr.aria-label]="'Navegación de páginas'"
      role="navigation"
    >
      <!-- Botón Previous -->
      <button
        (click)="onPreviousClick()"
        [disabled]="currentPage() === 1"
        [attr.aria-label]="'Ir a página anterior'"
        class="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium
               transition-colors duration-200
               disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent
               hover:bg-gray-100 active:bg-gray-200
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <span aria-hidden="true">←</span>
        <span>{{ 'Anterior' }}</span>
      </button>

      <!-- Números de página -->
      <div class="flex items-center gap-1" role="group" [attr.aria-label]="'Números de página'">
        @for (page of visiblePages(); track page) {
          @if (page === 'ellipsis') {
            <span class="px-2 py-2 text-sm text-gray-500" aria-hidden="true"> ... </span>
          } @else {
            <button
              (click)="onPageClick(page)"
              [attr.aria-label]="'Ir a página ' + page"
              [attr.aria-current]="currentPage() === page ? 'page' : undefined"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium
                     transition-colors duration-200
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              [class.bg-blue-600]="currentPage() === page"
              [class.text-white]="currentPage() === page"
              [class.text-gray-700]="currentPage() !== page"
              [class.hover:bg-gray-100]="currentPage() !== page"
              [class.active:bg-gray-200]="currentPage() !== page"
            >
              {{ page }}
            </button>
          }
        }
      </div>

      <!-- Botón Next -->
      <button
        (click)="onNextClick()"
        [disabled]="currentPage() === totalPages()"
        [attr.aria-label]="'Ir a página siguiente'"
        class="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium
               transition-colors duration-200
               disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent
               hover:bg-gray-100 active:bg-gray-200
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <span>{{ 'Siguiente' }}</span>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class PaginationComponent {
  currentPage = input(1, { alias: 'page' });
  totalPages = input(1, { alias: 'total' });
  maxVisiblePages = input(5, { alias: 'maxVisible' });

  pageChange = output<number>();

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let start = Math.max(1, current - halfVisible);
    const end = Math.min(total, start + maxVisible - 1);

    // Ajusta el inicio si llegamos al final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Siempre mostrar primera página
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }

    // Añade rango visible
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Siempre mostrar última página
    if (end < total) {
      if (end < total - 1) {
        pages.push('ellipsis');
      }
      pages.push(total);
    }

    return pages;
  });

  onPageClick(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPreviousClick(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.pageChange.emit(current - 1);
    }
  }

  onNextClick(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.pageChange.emit(current + 1);
    }
  }
}
