'use client';

import { useEffect, useState } from 'react';

type BrandLogoProps = {
  src: string;
  alt: string;
  fallbackText: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

/**
 * Logos from CDN / SVG must not go through next/image optimizer
 * (Amplify returns 400 "SVG files are not allowed" → flash then blank).
 * Always use plain <img>; onError falls back to tenant name text.
 */
export default function BrandLogo({
  src,
  alt,
  fallbackText,
  width = 188,
  height = 56,
  className,
  priority = false,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: height,
          color: 'inherit',
          fontWeight: 700,
          fontSize: 18,
        }}
        role="img"
        aria-label={alt || fallbackText}
      >
        {fallbackText}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      onError={() => setFailed(true)}
      style={{ objectFit: 'contain', maxHeight: height }}
    />
  );
}
