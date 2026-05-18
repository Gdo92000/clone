import { useState, useMemo, type ImgHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Icon } from './Icon';

export function FxImage({ className, alt, width, height, style, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = useState(false);

  const aspectRatioStyle = useMemo(() => {
    if (width && height && typeof width === 'number' && typeof height === 'number') {
      return { aspectRatio: `${width} / ${height}`, ...style };
    }
    return style;
  }, [width, height, style]);

  if (error) {
    return (
      <div className={clsx('flex items-center justify-center bg-surface-background', className)} style={aspectRatioStyle}>
        <Icon name="ImageOff" className="text-text-tertiary" size={24} />
      </div>
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={() => { setError(true); }}
      className={clsx(className)}
      style={aspectRatioStyle}
    />
  );
}
