import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavLink } from './NavLink';

describe('NavLink', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <NavLink to="/test">Test Link</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('renders with className', () => {
    render(
      <MemoryRouter>
        <NavLink to="/test" className="custom-class">Link</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByText('Link')).toHaveClass('custom-class');
  });
});
