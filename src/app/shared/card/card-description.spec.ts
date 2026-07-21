import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { CardDescriptionComponent } from './card-description';

describe('CardDescriptionComponent', () => {
  it('should render the description text correctly', async () => {
    const descriptionText = 'Learn how to write fast and reliable component tests.';

    await render(CardDescriptionComponent, {
      componentInputs: {
        description: descriptionText,
      },
    });

    const descriptionElement = screen.getByText(descriptionText);
    expect(descriptionElement).toBeTruthy();
    expect(descriptionElement.tagName).toBe('P');
  });
});
