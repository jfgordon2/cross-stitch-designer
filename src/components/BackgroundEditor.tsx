import React, { useCallback, useRef, useState } from 'react';
import { BackgroundImage, AppMode } from '../types';
import { BackgroundEditorModal } from './BackgroundEditorModal';
import './BackgroundEditor.css';
import imageIcon from '../assets/image.svg';
import imageEditIcon from '../assets/image-edit.svg';

interface BackgroundEditorProps {
  background?: BackgroundImage;
  canvasWidth: number;
  canvasHeight: number;
  onBackgroundChange: (background: BackgroundImage | undefined) => void;
  onModeChange: (mode: AppMode) => void;
}

export const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  background,
  canvasWidth,
  canvasHeight,
  onBackgroundChange,
  onModeChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Read the file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Calculate initial scale to fit within canvas while maintaining aspect ratio
          const scaleX = canvasWidth / img.width;
          const scaleY = canvasHeight / img.height;
          const scale = Math.min(scaleX, scaleY);

          // Center the image
          const x = (canvasWidth - (img.width * scale)) / 2;
          const y = (canvasHeight - (img.height * scale)) / 2;

          const newBackground: BackgroundImage = {
            dataUrl: reader.result as string,
            opacity: 0.5,
            position: { x, y },
            scale,
          };

          onBackgroundChange(newBackground);
          setIsEditing(true);
          onModeChange('background');
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('Failed to load image. Please try another file.');
    }
  }, [canvasWidth, canvasHeight, onBackgroundChange, onModeChange]);

  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!background) return;
    const opacity = parseFloat(e.target.value);
    onBackgroundChange({
      ...background,
      opacity,
    });
  }, [background, onBackgroundChange]);

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!background) return;
    const scale = parseFloat(e.target.value);
    onBackgroundChange({
      ...background,
      scale,
    });
  }, [background, onBackgroundChange]);

  const handlePositionChange = useCallback((dx: number, dy: number) => {
    if (!background) return;
    onBackgroundChange({
      ...background,
      position: {
        x: background.position.x + dx,
        y: background.position.y + dy,
      },
    });
  }, [background, onBackgroundChange]);

  const handleRemoveBackground = useCallback(() => {
    onBackgroundChange(undefined);
    onModeChange('edit');
    setIsEditing(false);
  }, [onBackgroundChange, onModeChange]);

  const handleDone = useCallback(() => {
    onModeChange('edit');
    setIsEditing(false);
  }, [onModeChange]);

  return (
    <div className="background-controls">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {!background ? (
        <button
          ref={buttonRef}
          onClick={() => fileInputRef.current?.click()}
          className="toolbar-button"
          title="Add background"
        >
          <img src={imageIcon} alt="Add background" />
        </button>
      ) : (
        <button
          ref={buttonRef}
          onClick={() => setIsEditing(true)}
          className="toolbar-button"
          title="Edit background"
        >
          <img src={imageEditIcon} alt="Edit background" />
        </button>
      )}

      {isEditing && background && (
        <BackgroundEditorModal
          background={background}
          onOpacityChange={handleOpacityChange}
          onScaleChange={handleScaleChange}
          onPositionChange={handlePositionChange}
          onDone={handleDone}
          onRemoveBackground={handleRemoveBackground}
        />
      )}
    </div>
  );
};