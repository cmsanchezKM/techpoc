import { render, screen } from '@testing-library/angular';
import { AuthorBadgeComponent } from './author-badge';

describe('AuthorBadgeComponent', () => {
  it('renders the author name and initials', async () => {
    await render(AuthorBadgeComponent, {
      componentInputs: { author: { name: 'Alice Smith', initials: 'AS' } },
    });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar de Alice Smith' })).toBeInTheDocument();
  });
});
