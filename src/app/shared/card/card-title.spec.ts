import { render, screen } from '@testing-library/angular';
import { CardTitleComponent } from './card-title';

describe('CardTitleComponent', () => {
  it('renders the title', async () => {
    await render(CardTitleComponent, { componentInputs: { title: 'Mi post' } });

    expect(screen.getByRole('heading', { name: 'Mi post' })).toBeInTheDocument();
  });
});
