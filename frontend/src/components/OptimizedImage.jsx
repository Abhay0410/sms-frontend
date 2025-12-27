// src/components/OptimizedImage.jsx
import { useState } from 'react';
import { getBaseURL } from '../services/api';

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallback = '/assets/default-avatar.png',
  width,
  height,
  ...props
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Handle relative paths
  const imageSrc = error 
    ? `${getBaseURL()}${fallback}` 
    : src?.startsWith('http') 
      ? src 
      : `${getBaseURL()}${src}`;

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
}
