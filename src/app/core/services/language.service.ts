import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'es' | 'en';
const STORAGE_KEY = 'techpoc.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  readonly current = this.translate.currentLang;
  readonly isLoading = this.translate.isLoading;

  constructor() {
    const saved = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? 'es';
    if (saved !== 'es') {
      this.use(saved);
    }
  }

  use(lang: Lang) {
    this.translate.use(lang).subscribe(() => localStorage.setItem(STORAGE_KEY, lang));
  }

  toggle() {
    this.use(this.current() === 'es' ? 'en' : 'es');
  }
}
