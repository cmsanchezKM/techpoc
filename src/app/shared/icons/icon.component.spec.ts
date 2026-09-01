import { render } from '@testing-library/angular';
import { IconComponent, IconName } from './icon.component';

describe('IconComponent', () => {
  const iconNames: IconName[] = [
    'arrow-left',
    'arrow-right',
    'chevron-left',
    'chevron-right',
    'pencil',
    'trash',
    'user',
    'lock',
    'alert-circle',
    'x',
    'info',
    'log',
    'search',
    'hash',
  ];

  it.each(iconNames)('renders the svg path for icon "%s"', async (name) => {
    const { container } = await render(IconComponent, {
      componentInputs: { name },
    });

    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('applies the custom class, viewBox and aria-hidden inputs', async () => {
    const { container } = await render(IconComponent, {
      componentInputs: {
        name: 'user',
        class: 'h-6 w-6',
        viewBox: '0 0 10 10',
        ariaHidden: 'false',
      },
    });

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toBe('h-6 w-6');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 10 10');
    expect(svg?.getAttribute('aria-hidden')).toBe('false');
  });
});
