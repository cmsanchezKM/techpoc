import { render, screen } from '@testing-library/angular';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { AuthButtonComponent } from './auth-button';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({ header: { logout: 'Salir', login: 'Entrar' } });
  }
}

async function setup(isAuthenticated = false) {
  return render(AuthButtonComponent, {
    componentInputs: { isAuthenticated },
    providers: [
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
    ],
  });
}

describe('AuthButtonComponent', () => {
  it('shows the logout button and emits logout when authenticated', async () => {
    const { fixture } = await setup(true);

    const emitted: void[] = [];
    fixture.componentInstance.logout.subscribe(() => emitted.push(undefined));

    screen.getByRole('button', { name: 'Salir' }).click();

    expect(emitted.length).toBe(1);
  });

  it('shows the login button and emits login when not authenticated', async () => {
    const { fixture } = await setup(false);

    const emitted: void[] = [];
    fixture.componentInstance.login.subscribe(() => emitted.push(undefined));

    screen.getByRole('button', { name: 'Entrar' }).click();

    expect(emitted.length).toBe(1);
  });
});
