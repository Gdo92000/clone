import { render, screen } from '@testing-library/react';
import { FxDeliveryBadge } from './FxDeliveryBadge';

vi.mock('../ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="icon">{name}</span>,
}));

describe('FxDeliveryBadge', () => {
  it('renders time when provided', () => {
    render(<FxDeliveryBadge time="30-40 min" />);
    expect(screen.getByText('30-40 min')).toBeInTheDocument();
  });

  it('does not render time when not provided', () => {
    render(<FxDeliveryBadge fee={5.9} />);
    expect(screen.queryByText('30-40 min')).not.toBeInTheDocument();
  });

  it('renders fee formatted as "R$ XX,XX"', () => {
    render(<FxDeliveryBadge fee={5.9} />);
    expect(screen.getByText('R$ 5,90')).toBeInTheDocument();
  });

  it('renders "Grátis" when fee is 0', () => {
    render(<FxDeliveryBadge fee={0} />);
    expect(screen.getByText('Grátis')).toBeInTheDocument();
  });

  it('does not render fee section when fee is undefined', () => {
    render(<FxDeliveryBadge time="30 min" />);
    expect(screen.queryByText('R$')).not.toBeInTheDocument();
    expect(screen.queryByText('Grátis')).not.toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<FxDeliveryBadge variant="success" />);
    expect(container.firstChild).toHaveClass('bg-feedback-success/10');
  });

  it('applies size classes correctly', () => {
    const { container } = render(<FxDeliveryBadge size="sm" />);
    expect(container.firstChild).toHaveClass('text-xs');
  });

  it('renders both time and fee when both provided', () => {
    render(<FxDeliveryBadge time="30-40 min" fee={4.9} />);
    expect(screen.getByText('30-40 min')).toBeInTheDocument();
    expect(screen.getByText('R$ 4,90')).toBeInTheDocument();
  });
});
