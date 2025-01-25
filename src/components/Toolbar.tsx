import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Color, Project, StitchType, GridRef, AppMode, BackgroundImage } from '../types';
import { ORIENTATION_OPTIONS } from '../constants';
import { OrientationSelect } from './OrientationSelect';
import { ColorSelect } from './ColorSelect';
import { PrintButton } from './PrintButton';
import { BackgroundEditor } from './BackgroundEditor';
import downloadIcon from '../assets/file-download-outline.svg';
import uploadIcon from '../assets/file-upload-outline.svg';
import gridIcon from '../assets/view-grid-plus-outline.svg';
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
        <div className="toolbar-group mobile-row">
          <div className="input-group">
            <label className="input-label">STITCH</label>
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
        </div>

        <div className="toolbar-group has-separator mobile-row">
          <div className="input-group">
            <label className="input-label">ORIENT</label>
            <OrientationSelect
              selectedStitch={selectedStitch}
              selectedOrientation={selectedOrientation}
              onOrientationChange={onOrientationChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">COLOR</label>
            <ColorSelect
              selectedColor={selectedColor}
              customColors={customColors}
              onColorChange={onColorChange}
              onCustomColorAdd={onCustomColorAdd}
            />
          </div>
        </div>

        <div className="toolbar-group has-separator mobile-row size-controls">
          <div className="input-group">
            <label className="input-label">WIDTH</label>
            <input
              type="number"
              min="1"
              value={width}
              onChange={handleWidthChange}
              className="toolbar-input"
            />
          </div>
          <div className="input-group">
            <label className="input-label">HEIGHT</label>
            <input
              type="number"
              min="1"
              value={height}
              onChange={handleHeightChange}
              className="toolbar-input"
            />
          </div>
          <button
            onClick={onResize}
            className="toolbar-button"
            title="Resize Grid"
          >
            RESIZE
          </button>
        </div>

        <div className="toolbar-group toolbar-actions mobile-row">
          <BackgroundEditor
            background={project.background}
            canvasWidth={project.width * 30}
            canvasHeight={project.height * 30}
            onBackgroundChange={onBackgroundChange}
            onModeChange={onModeChange}
          />
          <button
            onClick={onSave}
            className="toolbar-button"
            title="Save Project to Local"
          >
            <img src={downloadIcon} alt="Save Project" />
          </button>
          <button
            onClick={onLoad}
            className="toolbar-button"
            title="Upload Project from Local"
          >
            <img src={uploadIcon} alt="Upload Project" />
          </button>
          <PrintButton project={project} gridRef={gridRef} />
        </div>
      </div>
    </>
  );
});

Toolbar.displayName = 'Toolbar';