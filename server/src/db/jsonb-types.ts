export interface CouponRules {
  first_order_only?: boolean;
  min_items?: number;
  max_items?: number;
  specific_categories?: string[];
  specific_items?: string[];
  day_of_week?: number[];
  time_range?: { start: string; end: string };
}

export interface AdditionalFee {
  label: string;
  percentage: number;
}

export interface ThemeConfig {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  banner_url?: string;
  font_family?: string;
}

export interface OrderAdditive {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
