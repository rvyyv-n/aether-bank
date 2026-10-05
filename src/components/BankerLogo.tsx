import React from 'react';

interface BankerLogoProps {
  className?: string;
  size?: number;
}

/** Three stacked ledger bars; the top one is the accent. */
export const BankerLogo: React.FC<BankerLogoProps> = ({ className = '', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="4" rx="1.5" fill="var(--accent)" />
      <rect x="3" y="10" width="13" height="4" rx="1.5" fill="currentColor" />
      <rect x="3" y="16" width="8" height="4" rx="1.5" fill="currentColor" opacity="0.55" />
    </svg>
  );
};
