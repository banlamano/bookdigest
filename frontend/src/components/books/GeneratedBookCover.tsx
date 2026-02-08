'use client';

interface GeneratedBookCoverProps {
  title: string;
  author: string;
  category?: string;
  width?: number;
  height?: number;
  className?: string;
}

// Category-based color schemes
const categoryColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  fiction: { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#93c5fd' },
  'science-fiction': { primary: '#4c1d95', secondary: '#8b5cf6', accent: '#c4b5fd' },
  fantasy: { primary: '#581c87', secondary: '#a855f7', accent: '#d8b4fe' },
  mystery: { primary: '#7c2d12', secondary: '#ea580c', accent: '#fdba74' },
  thriller: { primary: '#7f1d1d', secondary: '#dc2626', accent: '#fca5a5' },
  romance: { primary: '#831843', secondary: '#db2777', accent: '#fbcfe8' },
  'historical-fiction': { primary: '#713f12', secondary: '#d97706', accent: '#fcd34d' },
  biography: { primary: '#365314', secondary: '#65a30d', accent: '#bef264' },
  'self-help': { primary: '#14532d', secondary: '#16a34a', accent: '#86efac' },
  business: { primary: '#0c4a6e', secondary: '#0284c7', accent: '#7dd3fc' },
  philosophy: { primary: '#44403c', secondary: '#78716c', accent: '#d6d3d1' },
  default: { primary: '#1f2937', secondary: '#4b5563', accent: '#9ca3af' },
};

export default function GeneratedBookCover({
  title,
  author,
  category = 'default',
  width = 300,
  height = 450,
  className = '',
}: GeneratedBookCoverProps) {
  // Get color scheme based on category
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
  const colors = categoryColors[categoryKey] || categoryColors.default;

  // Truncate long titles
  const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
  const displayAuthor = author.length > 30 ? author.substring(0, 27) + '...' : author;

  // Create unique gradient ID for this cover
  const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase().substring(0, 20)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 450"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 0.9 }} />
        </linearGradient>
        
        {/* Pattern for texture */}
        <pattern id={`pattern-${gradientId}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="transparent" />
          <circle cx="10" cy="10" r="1" fill="white" opacity="0.05" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="300" height="450" fill={`url(#${gradientId})`} />
      <rect width="300" height="450" fill={`url(#pattern-${gradientId})`} />

      {/* Decorative Elements */}
      <rect x="20" y="20" width="260" height="410" fill="none" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
      <rect x="25" y="25" width="250" height="400" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.2" />

      {/* Title */}
      <foreignObject x="30" y="120" width="240" height="150">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            fontSize: displayTitle.length > 30 ? '20px' : '24px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1.3',
            padding: '10px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {displayTitle}
        </div>
      </foreignObject>

      {/* Divider */}
      <line x1="60" y1="280" x2="240" y2="280" stroke={colors.accent} strokeWidth="2" opacity="0.5" />
      <line x1="80" y1="285" x2="220" y2="285" stroke={colors.accent} strokeWidth="1" opacity="0.3" />

      {/* Author */}
      <foreignObject x="30" y="300" width="240" height="60">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            fontStyle: 'italic',
            color: colors.accent,
            lineHeight: '1.4',
            padding: '0 20px',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {displayAuthor}
        </div>
      </foreignObject>

      {/* Decorative Bottom */}
      <rect x="120" y="380" width="60" height="3" fill={colors.accent} opacity="0.6" />
      <text
        x="150"
        y="410"
        textAnchor="middle"
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '10px',
          fill: colors.accent,
          opacity: 0.4,
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        {category !== 'default' ? category : 'Book'}
      </text>

      {/* Subtle corner decoration */}
      <path d="M 20 20 L 40 20 L 20 40 Z" fill={colors.accent} opacity="0.15" />
      <path d="M 280 20 L 260 20 L 280 40 Z" fill={colors.accent} opacity="0.15" />
      <path d="M 20 430 L 40 430 L 20 410 Z" fill={colors.accent} opacity="0.15" />
      <path d="M 280 430 L 260 430 L 280 410 Z" fill={colors.accent} opacity="0.15" />
    </svg>
  );
}
