import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { CardFooterComponent } from './card-footer';

describe('CardFooterComponent', () => {
  const mockAuthor = 'John Doe';
  const mockTags = ['Angular', 'Vitest', 'Tailwind'];

  it('should calculate author initials and render inner badges', async () => {
    await render(CardFooterComponent, {
      componentInputs: {
        author: mockAuthor,
        tags: mockTags,
      },
    });

    // Author name and computed initials 'JD'
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('JD')).toBeTruthy();

    // Tags list items
    mockTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeTruthy();
    });
  });

  it('should handle single-word author names gracefully when computing initials', async () => {
    await render(CardFooterComponent, {
      componentInputs: {
        author: 'SingleName',
        tags: [],
      },
    });

    expect(screen.getByText('SingleName')).toBeTruthy();
    expect(screen.getByText('S')).toBeTruthy();
  });
});
