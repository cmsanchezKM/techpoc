import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export type Lang = 'es' | 'en';
const STORAGE_KEY = 'techpoc.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private transloco = inject(TranslocoService);
  private currentLangSignal = signal<Lang>('es');

  readonly current = this.currentLangSignal.asReadonly();

  constructor() {
    const saved = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? 'es';
    this.currentLangSignal.set(saved);
    if (saved !== 'es') {
      this.transloco.setActiveLang(saved);
    } else {
      this.transloco.setActiveLang('es');
    }
  }

  use(lang: Lang) {
    this.transloco.setActiveLang(lang);
    this.currentLangSignal.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  toggle() {
    this.use(this.current() === 'es' ? 'en' : 'es');
  }
}
