import React, { ReactNode } from 'react';

/**
 * Footer Component Props
 * @property {string} [leftText] - Left side text (default: "&gt; Core_System: Active")
 * @property {string} [centerText] - Center text (default: copyright notice)
 * @property {string} [rightText] - Right side text (default: "Latency: 12ms")
 * @property {ReactNode} [leftContent] - Custom left content
 * @property {ReactNode} [centerContent] - Custom center content
 * @property {ReactNode} [rightContent] - Custom right content
 * @property {string} [className] - Additional CSS classes
 * @property {number} [latency] - Display latency value (default: 12)
 */
interface FooterProps {
  leftText?: string;
  centerText?: string;
  rightText?: string;
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  latency?: number;
}

const Footer: React.FC<FooterProps> = ({
  leftText = "&gt; Core_System: Active",
  centerText = "&copy; 2026 Pothole_Guard_AI // Authorized_Personnel_Only",
  rightText,
  leftContent,
  centerContent,
  rightContent,
  className = "",
  latency = 12,
}) => {
  const displayRightText = rightText ?? `Latency: ${latency}ms`;

  return (
    <footer className={`h-8 bg-cyber-black border-t border-cyber-red/20 flex items-center px-6 font-mono text-[10px] uppercase tracking-widest text-gray-600 z-20 relative justify-between ${className}`}>
      {/* Left Section */}
      <span>
        {leftContent ?? leftText}
      </span>

      {/* Center Section */}
      <span>
        {centerContent ?? centerText}
      </span>

      {/* Right Section */}
      <span>
        {rightContent ?? displayRightText}
      </span>
    </footer>
  );
};

export default Footer;