import { render, screen } from '@testing-library/react';
import { FxPriceTag } from './FxPriceTag';

describe('FxPriceTag', () => {
  it('renders price formatted as "R$ XX,XX"', () => {
    render(<FxPriceTag price={25.9} />);
    expect(screen.getByText('R$ 25,90')).toBeInTheDocument();
  });

  it('renders originalPrice with line-through when higher than price', () => {
    render(<FxPriceTag price={25.9} originalPrice={35.9} />);
    const originalEl = screen.getByText('R$ 35,90');
    expect(originalEl).toBeInTheDocument();
    expect(originalEl).toHaveClass('line-through');
  });

  it('does not render originalPrice when equal to price', () => {
    render(<FxPriceTag price={25.9} originalPrice={25.9} />);
    const elements = screen.getAllByText('R$ 25,90');
    expect(elements).toHaveLength(1);
  });

  it('does not render originalPrice when undefined', () => {
    render(<FxPriceTag price={25.9} />);
    const elements = screen.getAllByText('R$ 25,90');
    expect(elements).toHaveLength(1);
  });

  it.each(['sm', 'md', 'lg'] as const)('applies correct size class for %s', (size) => {
    render(<FxPriceTag price={10} size={size} />);
    const expectedClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';
    expect(screen.getByText('R$ 10,00')).toHaveClass(expectedClass);
  });

  it('applies custom className when provided', () => {
    const { container } = render(<FxPriceTag price={10} className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
