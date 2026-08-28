import { render } from '@testing-library/angular';
import { Component, Injectable, signal } from '@angular/core';
import { RelativeTimeDirective } from './relative-time.directive';
import { provideTransloco, TranslocoLoader, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      comments: {
        secondAgo: 'hace {{count}} segundo',
        secondsAgo: 'hace {{count}} segundos',
        minuteAgo: 'hace {{count}} minuto',
        minutesAgo: 'hace {{count}} minutos',
        hourAgo: 'hace {{count}} hora',
        hoursAgo: 'hace {{count}} horas',
        yesterday: 'ayer',
      },
    });
  }
}

@Component({
  standalone: true,
  imports: [RelativeTimeDirective],
  template: '<time appRelativeTime [date]="date()"></time>',
})
class TestComponent {
  date = signal('2024-01-01T12:00:00.000Z');
}

async function setup() {
  const result = await render(TestComponent, {
    providers: [
      provideTransloco({
        config: {
          availableLangs: ['es', 'en'],
          defaultLang: 'es',
        },
        loader: TranslocoLoaderMock,
      }),
    ],
  });
  const translocoService = result.fixture.debugElement.injector.get(TranslocoService);
  await firstValueFrom(translocoService.load('es'));
  translocoService.setActiveLang('es');
  result.fixture.detectChanges();

  const timeElement = result.fixture.nativeElement.querySelector('time') as HTMLTimeElement;
  return { ...result, timeElement };
}

describe('RelativeTimeDirective', () => {
  it('should create', async () => {
    const { timeElement } = await setup();
    expect(timeElement).toBeTruthy();
  });

  it('should set datetime attribute', async () => {
    const { fixture, timeElement } = await setup();
    const date = '2024-01-01T12:00:00.000Z';
    fixture.componentInstance.date.set(date);
    fixture.detectChanges();
    expect(timeElement.dateTime).toBe(date);
  });

  it('should display seconds ago', async () => {
    const { fixture, timeElement } = await setup();
    const now = Date.now();
    const date = new Date(now - 5000).toISOString();
    fixture.componentInstance.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toContain('hace');
    expect(timeElement.textContent).toContain('segundo');
  });

  it('should display minutes ago', async () => {
    const { fixture, timeElement } = await setup();
    const now = Date.now();
    const date = new Date(now - 15 * 60 * 1000).toISOString();
    fixture.componentInstance.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toContain('hace');
    expect(timeElement.textContent).toContain('minuto');
  });

  it('should display hours ago', async () => {
    const { fixture, timeElement } = await setup();
    const now = Date.now();
    const date = new Date(now - 3 * 60 * 60 * 1000).toISOString();
    fixture.componentInstance.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toContain('hace');
    expect(timeElement.textContent).toContain('hora');
  });

  it('should display yesterday', async () => {
    const { fixture, timeElement } = await setup();
    const now = Date.now();
    const date = new Date(now - 30 * 60 * 60 * 1000).toISOString();
    fixture.componentInstance.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toBe('ayer');
  });

  it('should display date format for older dates', async () => {
    const { fixture, timeElement } = await setup();
    const now = Date.now();
    const date = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
    fixture.componentInstance.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toMatch(/\d{2} [A-Z]{3}/);
  });

  it('should update when date changes', async () => {
    const { fixture, timeElement } = await setup();
    const date1 = new Date(Date.now() - 5000).toISOString();
    const date2 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    fixture.componentInstance.date.set(date1);
    fixture.detectChanges();
    const text1 = timeElement.textContent;

    fixture.componentInstance.date.set(date2);
    fixture.detectChanges();
    const text2 = timeElement.textContent;

    expect(text1).not.toBe(text2);
  });
});
