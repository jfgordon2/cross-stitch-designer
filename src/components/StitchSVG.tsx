import React from 'react';
import { Color, StitchType, Orientation } from '../types';

interface StitchSVGProps {
  type: StitchType;
  orientation: Orientation;
  color: Color;
  size: number;
}

const StitchSVGComponent: React.FC<StitchSVGProps> = ({ type, orientation, color, size }) => {
  const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
  const center = size / 2;
  const strokeWidth = size / 10;
  const edgeOffset = size * 0.15; // Edge offset for backstitch
  const solidPadding = size * 0.15; // 15% padding for solid stitch
  
  const getRotation = () => {
    return `rotate(${orientation * 90} ${center} ${center})`;
  };

  const renderStitch = () => {
    switch (type) {
      case 'Solid':
        return (
          <rect
            x={solidPadding}
            y={solidPadding}
            width={size - (solidPadding * 2)}
            height={size - (solidPadding * 2)}
            fill={colorString}
          />
        );

      case 'Full':
        return (
          <>
            <line 
              x1={size * 0.2} 
              y1={size * 0.2} 
              x2={size * 0.8} 
              y2={size * 0.8} 
              stroke={colorString} 
              strokeWidth={strokeWidth} 
            />
            <line 
              x1={size * 0.8} 
              y1={size * 0.2} 
              x2={size * 0.2} 
              y2={size * 0.8} 
              stroke={colorString} 
              strokeWidth={strokeWidth} 
            />
          </>
        );

      case 'Half-Full':
        return (
          <>
            <line 
              x1={size * 0.2} 
              y1={size * 0.2} 
              x2={center} 
              y2={size * 0.8} 
              stroke={colorString} 
              strokeWidth={strokeWidth} 
            />
            <line 
              x1={center} 
              y1={size * 0.2} 
              x2={size * 0.2} 
              y2={size * 0.8} 
              stroke={colorString} 
              strokeWidth={strokeWidth} 
            />
          </>
        );

      case '3/4':
        return (
          <>
            <line 
              x1={size * 0.2} 
              y1={size * 0.2} 
              x2={size * 0.8} 
              y2={size * 0.8} 
              stroke={colorString} 
              strokeWidth={strokeWidth} 
            />
            <line 
              x1={size * 0.8} 
              y1={size * 0.2} 
              x2={center} 
              y2={center} 
              stroke={colorString} 
              strokeWidth={strokeWidth} 
            />
          </>
        );

      case '1/2':
        return (
          <line 
            x1={size * 0.2} 
            y1={size * 0.2} 
            x2={size * 0.8} 
            y2={size * 0.8} 
            stroke={colorString} 
            strokeWidth={strokeWidth} 
          />
        );

      case '1/4':
        return (
          <line 
            x1={size * 0.2} 
            y1={size * 0.2} 
            x2={center} 
            y2={center} 
            stroke={colorString} 
            strokeWidth={strokeWidth} 
          />
        );

      case 'Back':
        return (
          <line 
            x1={size * 0.05} // Start almost at the edge
            y1={edgeOffset}
            x2={size * 0.95} // End almost at the edge
            y2={edgeOffset}
            stroke={colorString} 
            strokeWidth={strokeWidth} 
          />
        );
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <g transform={getRotation()}>
        {renderStitch()}
      </g>
    </svg>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const StitchSVG = React.memo(StitchSVGComponent, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.type === nextProps.type &&
    prevProps.orientation === nextProps.orientation &&
    prevProps.size === nextProps.size &&
    prevProps.color.r === nextProps.color.r &&
    prevProps.color.g === nextProps.color.g &&
    prevProps.color.b === nextProps.color.b &&
    prevProps.color.a === nextProps.color.a
  );
});

StitchSVG.displayName = 'StitchSVG';