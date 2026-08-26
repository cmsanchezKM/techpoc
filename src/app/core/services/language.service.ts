import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export type Lang = 'es' | 'en';
const STORAGE_KEY = 'techpoc.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);
  private currentLangSignal = signal<Lang>('es');

  readonly current = this.currentLangSignal.asReadonly();

  constructor() {
    const saved: Lang = isPlatformBrowser(this.platformId)
      ? ((localStorage.getItem(STORAGE_KEY) as Lang | null) ?? 'es')
      : 'es';
    this.currentLangSignal.set(saved);
    this.transloco.setActiveLang(saved);
  }

  use(lang: Lang) {
    this.transloco.setActiveLang(lang);
    this.currentLangSignal.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  toggle() {
    this.use(this.current() === 'es' ? 'en' : 'es');
  }
}
