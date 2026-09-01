import { render, screen } from '@testing-library/angular';
import { CardHeaderComponent } from './card-header';

describe('CardHeaderComponent', () => {
  it('renders the title and formatted date when date is provided', async () => {
    await render(CardHeaderComponent, {
      componentInputs: { title: 'Mi post', date: '2026-03-15T00:00:00.000Z' },
    });

    expect(screen.getByRole('heading', { name: 'Mi post' })).toBeInTheDocument();
    expect(screen.getByText('Mar 2026')).toBeInTheDocument();
  });

  it('does not render the date element when no date is provided', async () => {
    const { container } = await render(CardHeaderComponent, {
      componentInputs: { title: 'Mi post' },
    });

    expect(container.querySelector('time')).toBeNull();
  });
});
