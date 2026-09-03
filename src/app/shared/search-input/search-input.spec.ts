import { render, screen } from '@testing-library/angular';
import { SearchInputComponent } from './search-input';

describe('SearchInputComponent', () => {
  it('renders the given value, placeholder and aria-label', async () => {
    await render(SearchInputComponent, {
      componentInputs: { value: 'angular', placeholder: 'Buscar', ariaLabel: 'Buscar posts' },
    });

    const input = screen.getByRole('searchbox', { name: 'Buscar posts' }) as HTMLInputElement;
    expect(input.value).toBe('angular');
    expect(input.placeholder).toBe('Buscar');
  });

  it('emits the typed value', async () => {
    const { fixture } = await render(SearchInputComponent);

    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    input.value = 'angular';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual(['angular']);
  });
});
