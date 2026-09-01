import { render, screen } from '@testing-library/angular';
import { CardFooterComponent } from './card-footer';

describe('CardFooterComponent', () => {
  it('computes initials from a two-word author name', async () => {
    await render(CardFooterComponent, {
      componentInputs: { author: 'Alice Smith', tags: [] },
    });

    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('computes a single initial from a one-word author name', async () => {
    await render(CardFooterComponent, {
      componentInputs: { author: 'Alice', tags: [] },
    });

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders no initials when the author is an empty string', async () => {
    const { container } = await render(CardFooterComponent, {
      componentInputs: { author: '', tags: [] },
    });

    expect(container.querySelector('[role="img"]')).toHaveTextContent('');
  });

  it('renders one tag badge per tag', async () => {
    await render(CardFooterComponent, {
      componentInputs: { author: 'Alice', tags: ['angular', 'signals'] },
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('angular')).toBeInTheDocument();
    expect(screen.getByText('signals')).toBeInTheDocument();
  });
});
