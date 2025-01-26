import React, { memo, useState, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Color } from '../types';
import { COLORS } from '../constants';
import { getModalStyle } from '../utils/modalUtils';
import './ColorSelect.css';

interface ColorSelectModalProps {
  selectedColor: Color;
  customColors: Color[];
  customColor: Color;
  isCustomMode: boolean;
  buttonRect: DOMRect | null;
  onColorChange: (color: Color) => void;
  onCustomColorChange: (channel: keyof Color, value: number) => void;
  onCustomModeToggle: () => void;
  onAddCustomColor: () => void;
  onClose: () => void;
}

// Re-use existing ColorSwatch component
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

// Re-use existing ColorSlider component
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

export const ColorSelectModal: React.FC<ColorSelectModalProps> = ({
  selectedColor,
  customColors,
  customColor,
  isCustomMode,
  buttonRect,
  onColorChange,
  onCustomColorChange,
  onCustomModeToggle,
  onAddCustomColor,
  onClose,
}) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  const isColorEqual = (a: Color, b: Color) =>
    a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;

  const baseStyle: CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const modal = (
    <div
      className="color-dropdown"
      style={getModalStyle(isMobile, buttonRect, baseStyle)}
    >
      <div className="color-grid">
        {[...COLORS, ...customColors].map((color, index) => (
          <ColorSwatch
            key={index}
            color={color}
            isSelected={isColorEqual(color, selectedColor)}
            onClick={() => {
              onColorChange(color);
              onClose();
            }}
          />
        ))}
      </div>

      <button
        onClick={onCustomModeToggle}
        className={`custom-color-button ${isCustomMode ? 'active' : ''}`}
      >
        Custom Color
      </button>

      {isCustomMode && (
        <div className="color-slider-container">
          <ColorSlider color={customColor} channel="r" onChange={onCustomColorChange} />
          <ColorSlider color={customColor} channel="g" onChange={onCustomColorChange} />
          <ColorSlider color={customColor} channel="b" onChange={onCustomColorChange} />
          <ColorSlider color={customColor} channel="a" onChange={onCustomColorChange} />
          <button
            onClick={onAddCustomColor}
            className="custom-color-preview"
            style={{
              backgroundColor: `rgba(${customColor.r}, ${customColor.g}, ${customColor.b}, ${customColor.a / 255})`
            }}
          />
        </div>
      )}
    </div>
  );

  return createPortal(modal, modalRoot);
};