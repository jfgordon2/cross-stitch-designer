import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Color, Project, StitchType, GridRef, AppMode, BackgroundImage } from '../types';
import { ORIENTATION_OPTIONS } from '../constants';
import { OrientationSelect } from './OrientationSelect';
import { ColorSelect } from './ColorSelect';
import { PrintButton } from './PrintButton';
import { BackgroundEditor } from './BackgroundEditor';
import './Toolbar.css';

interface ToolbarProps {
  selectedStitch: StitchType;
  selectedOrientation: string;
  selectedColor: Color;
  customColors?: Color[];
  width: string;
  height: string;
  project: Project;
  gridRef: GridRef;
  onStitchChange: (stitch: StitchType) => void;
  onOrientationChange: (orientation: string) => void;
  onColorChange: (color: Color) => void;
  onCustomColorAdd?: (color: Color) => void;
  onWidthChange: (width: string) => void;
  onHeightChange: (height: string) => void;
  onResize: () => void;
  onSave: () => void;
  onLoad: () => void;
  onBackgroundChange: (background: BackgroundImage | undefined) => void;
  onModeChange: (mode: AppMode) => void;
}

export const Toolbar = React.memo<ToolbarProps>(({
  selectedStitch,
  selectedOrientation,
  selectedColor,
  customColors,
  width,
  height,
  project,
  gridRef,
  onStitchChange,
  onOrientationChange,
  onColorChange,
  onCustomColorAdd,
  onWidthChange,
  onHeightChange,
  onResize,
  onSave,
  onLoad,
  onBackgroundChange,
  onModeChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Memoize stitch types to prevent recreation on each render
  const stitchTypes = useMemo(() => 
    Object.keys(ORIENTATION_OPTIONS) as StitchType[], 
    []
  );

  // Set toolbar height CSS variable for mobile padding
  useEffect(() => {
    const updateToolbarHeight = () => {
      if (toolbarRef.current && window.innerWidth <= 768) {
        const height = toolbarRef.current.offsetHeight;
        document.documentElement.style.setProperty('--toolbar-height', `${height}px`);
      } else {
        document.documentElement.style.setProperty('--toolbar-height', '0px');
      }
    };

    updateToolbarHeight();
    window.addEventListener('resize', updateToolbarHeight);
    return () => window.removeEventListener('resize', updateToolbarHeight);
  }, []);

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
    <>
      <button 
        className="toolbar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
      >
        {isCollapsed ? '↓' : '↑'}
      </button>

      <div ref={toolbarRef} className={`toolbar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="toolbar-group">
          <label>Stitch:</label>
          <select 
            value={selectedStitch}
            onChange={handleStitchChange}
            className="toolbar-select"
          >
            {stitchTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <label>Orientation:</label>
          <OrientationSelect
            selectedStitch={selectedStitch}
            selectedOrientation={selectedOrientation}
            onOrientationChange={onOrientationChange}
          />
        </div>

        <div className="toolbar-group">
          <label>Color:</label>
          <ColorSelect
            selectedColor={selectedColor}
            customColors={customColors}
            onColorChange={onColorChange}
            onCustomColorAdd={onCustomColorAdd}
          />
        </div>

        <div className="toolbar-group">
          <label>Width:</label>
          <input
            type="number"
            min="1"
            value={width}
            onChange={handleWidthChange}
            className="toolbar-input"
          />
          <label>Height:</label>
          <input
            type="number"
            min="1"
            value={height}
            onChange={handleHeightChange}
            className="toolbar-input"
          />
          <button 
            onClick={onResize}
            className="toolbar-button"
          >
            Resize Grid
          </button>
        </div>

        <div className="toolbar-group">
          <BackgroundEditor
            background={project.background}
            canvasWidth={project.width * 30}
            canvasHeight={project.height * 30}
            onBackgroundChange={onBackgroundChange}
            onModeChange={onModeChange}
          />
        </div>

        <div className="toolbar-group">
          <button 
            onClick={onSave}
            className="toolbar-button"
          >
            Save
          </button>
          <button 
            onClick={onLoad}
            className="toolbar-button"
          >
            Load
          </button>
          <PrintButton project={project} gridRef={gridRef} />
        </div>
      </div>
    </>
  );
});

Toolbar.displayName = 'Toolbar';