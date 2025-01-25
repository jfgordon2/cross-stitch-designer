import React, { useCallback, useMemo } from 'react';
import { Color, Project, StitchType } from '../types';
import { ORIENTATION_OPTIONS } from '../constants';
import { OrientationSelect } from './OrientationSelect';
import { ColorSelect } from './ColorSelect';
import { PrintButton } from './PrintButton';

interface ToolbarProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  selectedColor: Color;
  width: string;
  height: string;
  project: Project;
  gridRef: React.RefObject<HTMLDivElement>;
  onStitchChange: (stitch: StitchType) => void;
  onOrientationChange: (orientation: string) => void;
  onColorChange: (color: Color) => void;
  onWidthChange: (width: string) => void;
  onHeightChange: (height: string) => void;
  onResize: () => void;
  onSave: () => void;
  onLoad: () => void;
}

const buttonStyle = {
  padding: '4px 12px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  backgroundColor: 'white',
  cursor: 'pointer'
} as const;

const inputStyle = {
  width: '60px',
  padding: '4px',
  borderRadius: '4px',
  border: '1px solid #ccc'
} as const;

const selectStyle = {
  padding: '4px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  minWidth: '80px'
} as const;

export const Toolbar = React.memo<ToolbarProps>(({
  selectedStitch,
  selectedOrientation,
  selectedColor,
  width,
  height,
  project,
  gridRef,
  onStitchChange,
  onOrientationChange,
  onColorChange,
  onWidthChange,
  onHeightChange,
  onResize,
  onSave,
  onLoad,
}) => {
  // Memoize stitch types to prevent recreation on each render
  const stitchTypes = useMemo(() => 
    Object.keys(ORIENTATION_OPTIONS) as StitchType[], 
    []
  );

  // Memoize handlers
  const handleStitchChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStitch = e.target.value as StitchType;
    onStitchChange(newStitch);
    // Reset orientation when changing stitch type
    onOrientationChange(ORIENTATION_OPTIONS[newStitch][0]);
  }, [onStitchChange, onOrientationChange]);

  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onWidthChange(e.target.value);
  }, [onWidthChange]);

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onHeightChange(e.target.value);
  }, [onHeightChange]);

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      padding: '1rem', 
      backgroundColor: '#f5f5f5', 
      borderBottom: '1px solid #ccc',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label>Stitch:</label>
        <select 
          value={selectedStitch}
          onChange={handleStitchChange}
          style={selectStyle}
        >
          {stitchTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label>Orientation:</label>
        <OrientationSelect
          selectedStitch={selectedStitch}
          selectedOrientation={selectedOrientation}
          onOrientationChange={onOrientationChange}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label>Color:</label>
        <ColorSelect
          selectedColor={selectedColor}
          onColorChange={onColorChange}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label>Width:</label>
        <input
          type="number"
          min="1"
          value={width}
          onChange={handleWidthChange}
          style={inputStyle}
        />
        <label>Height:</label>
        <input
          type="number"
          min="1"
          value={height}
          onChange={handleHeightChange}
          style={inputStyle}
        />
        <button 
          onClick={onResize}
          style={buttonStyle}
        >
          Resize Grid
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          onClick={onSave}
          style={buttonStyle}
        >
          Save
        </button>
        <button 
          onClick={onLoad}
          style={buttonStyle}
        >
          Load
        </button>
        <PrintButton project={project} gridRef={gridRef} />
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';