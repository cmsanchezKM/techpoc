import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let translocoServiceMock: { setActiveLang: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    translocoServiceMock = { setActiveLang: vi.fn() };
  });

  afterEach(() => {
    localStorage.clear();
  });

  function setup(platform: 'browser' | 'server' = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslocoService, useValue: translocoServiceMock },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return TestBed.inject(LanguageService);
  }

  it('defaults to "es" when there is nothing saved', () => {
    const service = setup();

    expect(service.current()).toBe('es');
    expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('es');
  });

  it('loads the language saved in localStorage on init', () => {
    localStorage.setItem('techpoc.lang', 'en');

    const service = setup();

    expect(service.current()).toBe('en');
    expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
  });

  it('defaults to "es" on the server without reading localStorage', () => {
    localStorage.setItem('techpoc.lang', 'en');

    const service = setup('server');

    expect(service.current()).toBe('es');
  });

  it('use() updates the active language, the signal and localStorage', () => {
    const service = setup();

    service.use('en');

    expect(service.current()).toBe('en');
    expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('techpoc.lang')).toBe('en');
  });

  it('use() does not touch localStorage on the server', () => {
    const service = setup('server');

    service.use('en');

    expect(service.current()).toBe('en');
    expect(localStorage.getItem('techpoc.lang')).toBeNull();
  });

  it('toggle() switches from "es" to "en"', () => {
    const service = setup();

    service.toggle();

    expect(service.current()).toBe('en');
  });

  it('toggle() switches from "en" back to "es"', () => {
    const service = setup();
    service.use('en');

    service.toggle();

    expect(service.current()).toBe('es');
  });
});
