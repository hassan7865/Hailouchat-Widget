import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = -tooltipRect.height - 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.height + 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = -tooltipRect.width - 8;
          break;
        case 'right':
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.width + 8;
          break;
      }

      // Adjust if tooltip goes off screen to the right
      const triggerLeft = triggerRect.left;
      if (triggerLeft + left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - triggerLeft - tooltipRect.width - 10;
      }
      
      // Adjust if tooltip goes off screen to the left
      if (triggerLeft + left < 0) {
        left = -triggerLeft + 10;
      }

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const childProps = children.props as any;
  
  const enhancedChildren = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      childProps.onMouseLeave?.(e);
    },
  } as any);

  return (
    <div
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {enhancedChildren}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            ...tooltipStyle,
            backgroundColor: '#17494d',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: 'max-content',
            maxWidth: '200px',
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: '0',
              height: '0',
              borderStyle: 'solid',
              ...(position === 'top' && {
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '4px 4px 0 4px',
                borderColor: '#17494d transparent transparent transparent',
              }),
              ...(position === 'bottom' && {
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 4px 4px 4px',
                borderColor: 'transparent transparent #17494d transparent',
              }),
              ...(position === 'left' && {
                right: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '4px 0 4px 4px',
                borderColor: 'transparent transparent transparent #17494d',
              }),
              ...(position === 'right' && {
                left: '-4px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '4px 4px 4px 0',
                borderColor: 'transparent #17494d transparent transparent',
              }),
            }}
          />
        </div>
      )}
    </div>
  );
};

