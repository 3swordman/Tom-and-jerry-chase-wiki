import { render, screen } from '@testing-library/react';

import QuizProgress from './QuizProgress';

describe('QuizProgress', () => {
  it('exposes the current question to assistive technology', () => {
    render(<QuizProgress current={2} total={10} />);

    expect(screen.getByRole('progressbar', { name: '答题进度' })).toHaveAttribute('value', '3');
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '10');
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('keeps an empty quiz at zero progress', () => {
    render(<QuizProgress current={0} total={0} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });
});
