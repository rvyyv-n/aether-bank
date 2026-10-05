import React from 'react';

interface BankerLogoProps {
  className?: string;
  size?: number;
}

export const BankerLogo: React.FC<BankerLogoProps> = ({ className = 'h-5 w-5', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Vault Frame */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Internal Vault Mechanism / Monogram B Lines */}
      <path
        d="M8.5 7.5H13C14.3807 7.5 15.5 8.61929 15.5 10C15.5 11.3807 14.3807 12.5 13 12.5H8.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12.5H13.5C14.8807 12.5 16 13.6193 16 15C16 16.3807 14.8807 17.5 13.5 17.5H8.5V12.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Precision Vault Pivot Dot */}
      <circle cx="10.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
};
