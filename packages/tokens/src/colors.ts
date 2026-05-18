export const colors = {
  brand: {
    primary: '#EA1D2C',
    primaryHover: '#C5161F',
    secondary: '#FF6900',
    accent: '#FFD600',
  },
  surface: {
    background: '#F7F7F7',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    inverse: '#3E3E3E',
  },
  text: {
    primary: '#3E3E3E',
    secondary: '#717171',
    tertiary: '#9E9E9E',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  feedback: {
    success: '#50A773',
    warning: '#F5A623',
    error: '#EA1D2C',
    info: '#0070CC',
  },
  border: {
    default: '#E0E0E0',
    focus: '#EA1D2C',
    error: '#EA1D2C',
    disabled: '#EEEEEE',
  },
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;
export type ColorShade<T extends ColorKey> = Colors[T];