import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { AuthorBadgeComponent, Author } from './author-badge';

describe('AuthorBadgeComponent', () => {
  const mockAuthor: Author = {
    name: 'John Doe',
    initials: 'JD',
  };

  it('should render author name and initials correctly', async () => {
    // 1. Render the component passing the required Signal Input
    await render(AuthorBadgeComponent, {
      componentInputs: {
        author: mockAuthor,
      },
    });

    // 2. Verify that initials are displayed
    const initialsElement = screen.getByText(mockAuthor.initials);
    expect(initialsElement).toBeTruthy();

    // 3. Verify that full name is displayed
    const nameElement = screen.getByText(mockAuthor.name);
    expect(nameElement).toBeTruthy();
  });

  it('should have correct accessibility attributes on the avatar', async () => {
    await render(AuthorBadgeComponent, {
      componentInputs: {
        author: mockAuthor,
      },
    });

    // 4. Find the element by its accessible 'img' role
    const avatarImg = screen.getByRole('img', {
      name: `Avatar de ${mockAuthor.name}`,
    });

    // 5. Validate that it exists
    expect(avatarImg).toBeTruthy();
  });
});
