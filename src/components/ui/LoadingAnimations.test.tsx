import { render, screen } from '@testing-library/react';

import { ProgressBar } from './LoadingAnimations';

describe('LoadingAnimations', () => {
  it('renders the requested progress value and clamps out-of-range values', () => {
    const { rerender } = render(<ProgressBar progress={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50');
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '100');

    rerender(<ProgressBar progress={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');

    rerender(<ProgressBar progress={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100');
  });

  it('disables pulse animation on the progress indicator when animated is false', () => {
    render(<ProgressBar animated={false} />);

    expect(screen.getByRole('progressbar').className).not.toContain('animate-pulse');
  });
});
