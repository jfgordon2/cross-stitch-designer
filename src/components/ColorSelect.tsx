import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Color } from '../types';
import { COLORS } from '../constants';
import './ColorSelect.css';

interface ColorSelectProps {
  selectedColor: Color;
  customColors?: Color[];
  onColorChange: (color: Color) => void;
  onCustomColorAdd?: (color: Color) => void;
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
    className={`color-swatch ${isSelected ? 'selected' : ''}`}
    style={{
      backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`
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
  <div className="color-slider">
    <label>{channel.toUpperCase()}:</label>
    <input
      type="range"
      min="0"
      max="255"
      value={color[channel]}
      onChange={(e) => onChange(channel, parseInt(e.target.value, 10))}
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
    />
  </div>
));

ColorSlider.displayName = 'ColorSlider';

const ColorSelectComponent: React.FC<ColorSelectProps> = ({
  selectedColor,
  customColors = [],
  onColorChange,
  onCustomColorAdd,
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

  const handleAddCustomColor = useCallback(() => {
    onColorChange(customColor);
    if (onCustomColorAdd) {
      onCustomColorAdd(customColor);
    }
    setIsOpen(false);
  }, [customColor, onColorChange, onCustomColorAdd]);

  return (
    <div ref={containerRef} className="color-select">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="color-select-button"
        style={{
          backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a / 255})`
        }}
      />

      {isOpen && (
        <div className="color-dropdown">
          <div className="color-grid">
            {[...COLORS, ...customColors].map((color, index) => (
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
            className={`custom-color-button ${isCustomMode ? 'active' : ''}`}
          >
            Custom Color
          </button>

          {isCustomMode && (
            <div className="color-slider-container">
              <ColorSlider color={customColor} channel="r" onChange={handleCustomColorChange} />
              <ColorSlider color={customColor} channel="g" onChange={handleCustomColorChange} />
              <ColorSlider color={customColor} channel="b" onChange={handleCustomColorChange} />
              <ColorSlider color={customColor} channel="a" onChange={handleCustomColorChange} />
              <button
                onClick={handleAddCustomColor}
                className="custom-color-preview"
                style={{
                  backgroundColor: `rgba(${customColor.r}, ${customColor.g}, ${customColor.b}, ${customColor.a / 255})`
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

export const ColorSelect = memo(ColorSelectComponent);