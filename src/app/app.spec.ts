import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideRouter } from '@angular/router';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: {
            es: { title: 'Hello, techpoc' },
            en: { title: 'Hello, techpoc' },
          },
          translocoConfig: {
            availableLangs: ['es', 'en'],
            defaultLang: 'es',
          },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand logo text', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const logoText = compiled.querySelector('.logo')?.textContent ?? '';

    expect(logoText).toContain('Blog Tech');
  });
});
