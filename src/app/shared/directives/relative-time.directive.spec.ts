import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injectable } from '@angular/core';
import { RelativeTimeDirective } from './relative-time.directive';
import { provideTransloco, TranslocoService, TranslocoLoader } from '@jsverse/transloco';
import { signal } from '@angular/core';
import { of } from 'rxjs';

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

describe('RelativeTimeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let timeElement: HTMLTimeElement;
  let translocoService: TranslocoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
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

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    timeElement = fixture.nativeElement.querySelector('time');
    translocoService = TestBed.inject(TranslocoService);
    translocoService.setActiveLang('es');
  });

  it('should create', () => {
    expect(timeElement).toBeTruthy();
  });

  it('should set datetime attribute', () => {
    const date = '2024-01-01T12:00:00.000Z';
    component.date.set(date);
    fixture.detectChanges();
    expect(timeElement.dateTime).toBe(date);
  });

  it('should display seconds ago', () => {
    // 5 segundos atrás
    const now = Date.now();
    const date = new Date(now - 5000).toISOString();
    component.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toContain('hace');
    expect(timeElement.textContent).toContain('segundo');
  });

  it('should display minutes ago', () => {
    // 15 minutos atrás
    const now = Date.now();
    const date = new Date(now - 15 * 60 * 1000).toISOString();
    component.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toContain('hace');
    expect(timeElement.textContent).toContain('minuto');
  });

  it('should display hours ago', () => {
    // 3 horas atrás
    const now = Date.now();
    const date = new Date(now - 3 * 60 * 60 * 1000).toISOString();
    component.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toContain('hace');
    expect(timeElement.textContent).toContain('hora');
  });

  it('should display yesterday', () => {
    // 30 horas atrás (ayer)
    const now = Date.now();
    const date = new Date(now - 30 * 60 * 60 * 1000).toISOString();
    component.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toBe('ayer');
  });

  it('should display date format for older dates', () => {
    // 3 días atrás
    const now = Date.now();
    const date = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
    component.date.set(date);
    fixture.detectChanges();
    expect(timeElement.textContent).toMatch(/\d{2} [A-Z]{3}/);
  });

  it('should update when date changes', () => {
    const date1 = new Date(Date.now() - 5000).toISOString();
    const date2 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    component.date.set(date1);
    fixture.detectChanges();
    const text1 = timeElement.textContent;

    component.date.set(date2);
    fixture.detectChanges();
    const text2 = timeElement.textContent;

    expect(text1).not.toBe(text2);
  });
});
