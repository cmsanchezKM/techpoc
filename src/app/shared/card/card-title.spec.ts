import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { CardTitleComponent } from './card-title';

describe('CardTitleComponent', () => {
  it('should render the title inside an h2 heading', async () => {
    const titleText = 'Unit Testing in Angular';

    await render(CardTitleComponent, {
      componentInputs: {
        title: titleText,
      },
    });

    const heading = screen.getByRole('heading', { level: 2, name: titleText });
    expect(heading).toBeTruthy();
  });
});
