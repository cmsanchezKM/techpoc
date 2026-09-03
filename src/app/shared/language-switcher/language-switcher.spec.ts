import { render, screen } from '@testing-library/angular';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { LanguageSwitcherComponent } from './language-switcher';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({ header: { es: 'ES', en: 'EN', languageSelector: 'Idioma' } });
  }
}

async function setup(current: 'es' | 'en' = 'es') {
  const result = await render(LanguageSwitcherComponent, {
    componentInputs: { current },
    providers: [
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
    ],
  });

  return result;
}

describe('LanguageSwitcherComponent', () => {
  it('marks the current language as pressed', async () => {
    await setup('es');

    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('emits the selected language', async () => {
    const { fixture } = await setup('es');

    const emitted: string[] = [];
    fixture.componentInstance.langChange.subscribe((lang) => emitted.push(lang));

    screen.getByRole('button', { name: 'EN' }).click();

    expect(emitted).toEqual(['en']);
  });
});
