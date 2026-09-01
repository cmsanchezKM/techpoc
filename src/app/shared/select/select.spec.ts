import { render, screen } from '@testing-library/angular';
import { SelectComponent } from './select';

describe('SelectComponent', () => {
  it('renders the label as the placeholder option and the given options', async () => {
    await render(SelectComponent, {
      componentInputs: {
        label: 'Todos los autores',
        options: [
          { value: 'a', label: 'alice' },
          { value: 'b', label: 'bruno' },
        ],
      },
    });

    expect(screen.getByRole('combobox', { name: 'Todos los autores' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'alice' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'bruno' })).toBeInTheDocument();
  });

  it('emits the selected value on change', async () => {
    const { fixture } = await render(SelectComponent, {
      componentInputs: {
        label: 'Todos los autores',
        options: [{ value: 'a', label: 'alice' }],
      },
    });

    const emitted: (string | null)[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    select.value = 'a';
    select.dispatchEvent(new Event('change'));

    expect(emitted).toEqual(['a']);
  });

  it('emits null when the empty option is selected', async () => {
    const { fixture } = await render(SelectComponent, {
      componentInputs: {
        label: 'Todos los autores',
        options: [{ value: 'a', label: 'alice' }],
        selectedValue: 'a',
      },
    });

    const emitted: (string | null)[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    select.value = '';
    select.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([null]);
  });
});
