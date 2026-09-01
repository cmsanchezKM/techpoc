import { render, screen } from '@testing-library/angular';
import { CardDescriptionComponent } from './card-description';

describe('CardDescriptionComponent', () => {
  it('renders the description text', async () => {
    await render(CardDescriptionComponent, {
      componentInputs: { description: 'Contenido del post' },
    });

    expect(screen.getByText('Contenido del post')).toBeInTheDocument();
  });
});
