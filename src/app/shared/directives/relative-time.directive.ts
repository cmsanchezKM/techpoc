import { Directive, input, computed, inject, ElementRef, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { getRelativeDateInfo } from '@core/utils/date.utils';

/**
 * Directiva que muestra fechas en formato relativo (hace X minutos, ayer, etc.)
 *
 * @example
 * <time appRelativeTime [date]="comment.createdAt"></time>
 */
@Directive({
  selector: 'time[appRelativeTime]',
  standalone: true,
  providers: [DatePipe],
})
export class RelativeTimeDirective {
  private readonly el = inject(ElementRef<HTMLTimeElement>);
  private readonly transloco = inject(TranslocoService);
  private readonly datePipe = inject(DatePipe);

  /** La fecha a mostrar en formato relativo */
  readonly date = input.required<string>();

  /** Prefijo de traducción (por defecto 'comments') */
  readonly translationPrefix = input<string>('comments');

  private readonly dateInfo = computed(() => getRelativeDateInfo(this.date()));

  constructor() {
    // Establecer el atributo datetime
    effect(() => {
      this.el.nativeElement.dateTime = this.date();
    });

    // Actualizar el contenido según el tipo de fecha
    effect(() => {
      const info = this.dateInfo();
      const prefix = this.translationPrefix();
      let text = '';

      switch (info.type) {
        case 'seconds':
          text = this.transloco.translate(
            `${prefix}.${info.count === 1 ? 'secondAgo' : 'secondsAgo'}`,
            { count: info.count },
          );
          break;
        case 'minutes':
          text = this.transloco.translate(
            `${prefix}.${info.count === 1 ? 'minuteAgo' : 'minutesAgo'}`,
            { count: info.count },
          );
          break;
        case 'hours':
          text = this.transloco.translate(
            `${prefix}.${info.count === 1 ? 'hourAgo' : 'hoursAgo'}`,
            { count: info.count },
          );
          break;
        case 'yesterday':
          text = this.transloco.translate(`${prefix}.yesterday`);
          break;
        case 'date':
          text = (this.datePipe.transform(this.date(), 'dd MMM') || '').toUpperCase();
          break;
      }

      this.el.nativeElement.textContent = text;
    });
  }
}
