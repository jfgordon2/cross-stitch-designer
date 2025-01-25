import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Color } from '../types';
import { COLORS } from '../constants';

interface ColorSelectProps {
  selectedColor: Color;
  onColorChange: (color: Color) => void;
}

// Memoized color swatch component
const ColorSwatch = memo(({ 
  color, 
  isSelected, 
  onClick 
}: { 
  color: Color; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '32px',
      height: '32px',
      border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`,
      cursor: 'pointer',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  />
));

ColorSwatch.displayName = 'ColorSwatch';

// Memoized color slider component
const ColorSlider = memo(({ 
  color, 
  channel, 
  onChange 
}: { 
  color: Color; 
  channel: keyof Color; 
  onChange: (channel: keyof Color, value: number) => void;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <label style={{ width: '20px' }}>{channel.toUpperCase()}:</label>
    <input
      type="range"
      min="0"
      max="255"
      value={color[channel]}
      onChange={(e) => onChange(channel, parseInt(e.target.value, 10))}
      style={{ flex: 1 }}
    />
    <input
      type="number"
      min="0"
      max="255"
      value={color[channel]}
      onChange={(e) => {
        const value = Math.max(0, Math.min(255, parseInt(e.target.value || '0', 10)));
        onChange(channel, value);
      }}
      style={{ width: '50px', padding: '2px 4px' }}
    />
  </div>
));

ColorSlider.displayName = 'ColorSlider';

const ColorSelectComponent: React.FC<ColorSelectProps> = ({
  selectedColor,
  onColorChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customColor, setCustomColor] = useState<Color>(selectedColor);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomColorChange = useCallback((channel: keyof Color, value: number) => {
    setCustomColor(prev => {
      const newColor = { ...prev, [channel]: value };
      onColorChange(newColor);
      return newColor;
    });
  }, [onColorChange]);

  const isColorEqual = useCallback((a: Color, b: Color) =>
    a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a,
  []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '32px',
          height: '32px',
          padding: 0,
          backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a / 255})`,
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
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
            padding: '8px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: '200px'
          }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '4px',
            marginBottom: '8px'
          }}>
            {COLORS.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                isSelected={isColorEqual(color, selectedColor)}
                onClick={() => {
                  onColorChange(color);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            style={{
              width: '100%',
              padding: '4px',
              marginTop: '4px',
              backgroundColor: isCustomMode ? '#e0e0e0' : 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Custom Color
          </button>

          {isCustomMode && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ColorSlider color={customColor} channel="r" onChange={handleCustomColorChange} />
              <ColorSlider color={customColor} channel="g" onChange={handleCustomColorChange} />
              <ColorSlider color={customColor} channel="b" onChange={handleCustomColorChange} />
              <ColorSlider color={customColor} channel="a" onChange={handleCustomColorChange} />
              <button
                onClick={() => {
                  onColorChange(customColor);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  height: '32px',
                  marginTop: '4px',
                  backgroundColor: `rgba(${customColor.r}, ${customColor.g}, ${customColor.b}, ${customColor.a / 255})`,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ColorSelectComponent.displayName = 'ColorSelect';

// Memoize and export the component
export const ColorSelect = memo(ColorSelectComponent);