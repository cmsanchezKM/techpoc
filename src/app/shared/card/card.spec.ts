import { render, screen } from '@testing-library/angular';
import { CardComponent } from './card';

describe('CardComponent', () => {
  it('renders title, description, date, author and tags together', async () => {
    await render(CardComponent, {
      componentInputs: {
        date: '2026-03-15T00:00:00.000Z',
        title: 'Mi post',
        description: 'Contenido del post',
        author: 'Alice Smith',
        tags: ['angular'],
      },
    });

    expect(screen.getByRole('heading', { name: 'Mi post' })).toBeInTheDocument();
    expect(screen.getByText('Contenido del post')).toBeInTheDocument();
    expect(screen.getByText('Mar 2026')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('angular')).toBeInTheDocument();
  });

  it('applies the custom styles input to the article class', async () => {
    const { container } = await render(CardComponent, {
      componentInputs: {
        styles: 'bg-brand-surface',
        date: '2026-03-15T00:00:00.000Z',
        title: 'Mi post',
        description: 'Contenido',
        author: 'Alice',
        tags: [],
      },
    });

    expect(container.querySelector('article')?.className).toContain('bg-brand-surface');
  });
});
