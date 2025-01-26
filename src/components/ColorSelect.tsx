import React, { useState, useRef, useCallback, memo } from 'react';
import { Color } from '../types';
import { ColorSelectModal } from './ColorSelectModal';
import './ColorSelect.css';

interface ColorSelectProps {
  selectedColor: Color;
  customColors?: Color[];
  onColorChange: (color: Color) => void;
  onCustomColorAdd?: (color: Color) => void;
}

const ColorSelectComponent: React.FC<ColorSelectProps> = ({
  selectedColor,
  customColors = [],
  onColorChange,
  onCustomColorAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customColor, setCustomColor] = useState<Color>(selectedColor);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCustomColorChange = useCallback((channel: keyof Color, value: number) => {
    setCustomColor(prev => {
      const newColor = { ...prev, [channel]: value };
      onColorChange(newColor);
      return newColor;
    });
  }, [onColorChange]);

  const handleAddCustomColor = useCallback(() => {
    onColorChange(customColor);
    if (onCustomColorAdd) {
      onCustomColorAdd(customColor);
    }
    setIsOpen(false);
  }, [customColor, onColorChange, onCustomColorAdd]);

  return (
    <div className="color-select">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="color-select-button"
        style={{
          backgroundColor: `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a / 255})`
        }}
      />

      {isOpen && (
        <ColorSelectModal
          selectedColor={selectedColor}
          customColors={customColors}
          customColor={customColor}
          isCustomMode={isCustomMode}
          onColorChange={onColorChange}
          onCustomColorChange={handleCustomColorChange}
          onCustomModeToggle={() => setIsCustomMode(!isCustomMode)}
          onAddCustomColor={handleAddCustomColor}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

ColorSelectComponent.displayName = 'ColorSelect';

export const ColorSelect = memo(ColorSelectComponent);