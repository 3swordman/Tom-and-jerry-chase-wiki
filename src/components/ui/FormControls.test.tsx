import React from 'react';
import { render, screen } from '@testing-library/react';

import { FormInput, FormSelect, FormTextarea } from './FormControls';

describe('FormControls', () => {
  it('renders an input with shared form styling and ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(<FormInput ref={ref} aria-label='标题' className='md:px-4' />);

    const input = screen.getByRole('textbox', { name: '标题' });
    expect(input).toHaveClass(
      'w-full',
      'rounded-lg',
      'px-3',
      'py-3',
      'md:px-4',
      'bg-surface-sunken',
      'focus:ring-focus'
    );
    expect(ref.current).toBe(input);
  });

  it('retains the native presentation of specialized inputs', () => {
    render(<FormInput type='datetime-local' aria-label='时间' />);

    const input = screen.getByLabelText('时间');
    expect(input).toHaveAttribute('type', 'datetime-local');
    expect(input).not.toHaveClass('daisy-input');
    expect(input).toHaveClass('bg-surface-sunken', 'focus:ring-focus');
  });

  it('renders a select with compact shared styling and inline width support', () => {
    render(
      <FormSelect aria-label='分类' size='sm' defaultValue='guide' fullWidth={false}>
        <option value='guide'>攻略</option>
      </FormSelect>
    );

    const select = screen.getByRole('combobox', { name: '分类' });
    expect(select).toHaveClass('w-auto', 'rounded-lg', 'px-2', 'py-2', 'text-sm');
    expect(select).not.toHaveClass('w-full');
  });

  it('retains the native presentation of a multiple select', () => {
    render(
      <FormSelect multiple aria-label='分类'>
        <option value='guide'>攻略</option>
      </FormSelect>
    );

    const select = screen.getByRole('listbox', { name: '分类' });
    expect(select).toHaveAttribute('multiple');
    expect(select).not.toHaveClass('daisy-select');
  });

  it('renders a textarea with invalid state semantics and styling', () => {
    render(<FormTextarea aria-label='说明' invalid />);

    const textarea = screen.getByRole('textbox', { name: '说明' });
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveClass('border-validation-error', 'focus:ring-validation-error');
  });
});
