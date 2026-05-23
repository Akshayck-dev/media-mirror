import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  isGoldTheme?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  isGoldTheme = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 p-6 shadow-card hover:shadow-premium ${
        isGoldTheme 
          ? 'border-studio-gold/30 bg-gradient-to-br from-amber-50/20 to-white' 
          : 'border-studio-border'
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-studio-border/60">
          <div>
            {title && (
              <h3 className="text-xl font-bold tracking-tight text-studio-text flex items-center gap-2">
                {title}
                {isGoldTheme && (
                  <span className="text-xs bg-studio-gold/15 text-studio-gold px-2 py-0.5 rounded border border-studio-gold/20 font-semibold uppercase tracking-wider">
                    Premium
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="text-[15px] text-studio-muted mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
