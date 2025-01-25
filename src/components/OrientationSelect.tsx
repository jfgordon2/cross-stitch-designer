import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { StitchType, Orientation } from '../types';
import { ORIENTATION_OPTIONS } from '../constants';
import { StitchSVG } from './StitchSVG';

interface OrientationSelectProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  onOrientationChange: (orientation: string) => void;
}

const SelectButton = memo(({ 
  selectedStitch, 
  selectedOrientation, 
  onClick 
}: { 
  selectedStitch: StitchType; 
  selectedOrientation: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '32px',
      height: '32px',
      padding: 0,
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <StitchSVG
      type={selectedStitch}
      orientation={parseInt(selectedOrientation, 10) as Orientation}
      color={{ r: 0, g: 0, b: 0, a: 255 }}
      size={28}
    />
  </button>
));

SelectButton.displayName = 'SelectButton';

const OrientationSelectComponent: React.FC<OrientationSelectProps> = ({
  selectedStitch,
  selectedOrientation,
  onOrientationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = useCallback((orientation: string) => {
    onOrientationChange(orientation);
    setIsOpen(false);
  }, [onOrientationChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const orientations = ORIENTATION_OPTIONS[selectedStitch];

  // If there's only one orientation, just show it without dropdown functionality
  if (orientations.length === 1) {
    return (
      <SelectButton
        selectedStitch={selectedStitch}
        selectedOrientation={orientations[0]}
        onClick={() => {}}
      />
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <SelectButton
        selectedStitch={selectedStitch}
        selectedOrientation={selectedOrientation}
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {orientations.map((orientation) => (
            <button
              key={orientation}
              onClick={() => handleOptionClick(orientation)}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                border: orientation === selectedOrientation ? '2px solid #007bff' : '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StitchSVG
                type={selectedStitch}
                orientation={parseInt(orientation, 10) as Orientation}
                color={{ r: 0, g: 0, b: 0, a: 255 }}
                size={28}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

OrientationSelectComponent.displayName = 'OrientationSelect';

export const OrientationSelect = memo(OrientationSelectComponent);