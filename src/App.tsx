import { useState, useCallback, useRef } from 'react';
import { Grid } from './components/Grid';
import { Toolbar } from './components/Toolbar';
import { Color, Project, Stitch, StitchType, AppMode, BackgroundImage } from './types';
import eraserIcon from './assets/eraser.svg';
import { COLORS, GRID_CONSTANTS } from './constants';
import {
  createNewProject,
  toggleStitchInCell,
  saveProjectToFile,
  loadProjectFromFile,
  resizeProject
} from './utils/projectUtils';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';
import './print.css';

const createInitialProject = (width: number, height: number) => 
  createNewProject(width, height);

const isColorEqual = (a: Color, b: Color) =>
  a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;

const isDefaultColor = (color: Color) =>
  COLORS.some(defaultColor => isColorEqual(defaultColor, color));

const extractCustomColors = (project: Project): Color[] => {
  const uniqueColors = new Set<string>();
  const customColors: Color[] = [];

  project.grid.forEach(row => {
    row.forEach(cell => {
      cell.stitches.forEach(stitch => {
        const colorKey = `${stitch.color.r},${stitch.color.g},${stitch.color.b},${stitch.color.a}`;
        if (!isDefaultColor(stitch.color) && !uniqueColors.has(colorKey)) {
          uniqueColors.add(colorKey);
          customColors.push(stitch.color);
        }
      });
    });
  });

  return customColors;
};

function App() {
  const [project, setProject] = useState<Project>(() => 
    createInitialProject(GRID_CONSTANTS.defaultGridSize, GRID_CONSTANTS.defaultGridSize)
  );
  
  const [selectedColor, setSelectedColor] = useState<Color>(COLORS[0]);
  const [customColors, setCustomColors] = useState<Color[]>([]);
  const [selectedStitch, setSelectedStitch] = useState<StitchType>("Full");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("0");
  const [width, setWidth] = useState(GRID_CONSTANTS.defaultGridSize.toString());
  const [height, setHeight] = useState(GRID_CONSTANTS.defaultGridSize.toString());
  const [mode, setMode] = useState<AppMode>('edit');
  const [isEraserMode, setIsEraserMode] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleCustomColorAdd = useCallback((color: Color) => {
    setCustomColors(prevColors => {
      // Don't add if it's a default color or already exists
      if (isDefaultColor(color) || prevColors.some(c => isColorEqual(c, color))) {
        return prevColors;
      }
      return [...prevColors, color];
    });
  }, []);

  const handleCellUpdate = useCallback((row: number, col: number, stitch: Stitch) => {
    setProject(currentProject => {
      const newProject = {
        ...currentProject,
        grid: [...currentProject.grid]
      };
      
      newProject.grid[row] = [...currentProject.grid[row]];
      
      if (isEraserMode) {
        newProject.grid[row][col] = { stitches: [] };
        return newProject;
      }
      
      newProject.grid[row][col] = {
        stitches: [...currentProject.grid[row][col].stitches]
      };
      
      try {
        toggleStitchInCell(newProject, row, col, stitch);
        return newProject;
      } catch (error) {
        console.error('Failed to update cell:', error);
        return currentProject;
      }
    });

    if (!isEraserMode) {
      // Add color to custom colors if it's not a default color
      handleCustomColorAdd(selectedColor);
    }
  }, [selectedColor, handleCustomColorAdd, isEraserMode]);

  const handleResize = useCallback(() => {
    const newWidth = parseInt(width, 10);
    const newHeight = parseInt(height, 10);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
      alert('Invalid dimensions: width and height must be positive numbers');
      return;
    }

    try {
      const newProject = resizeProject(project, newWidth, newHeight);
      setProject(newProject);
    } catch (error) {
      console.error('Failed to resize project:', error);
      alert(error instanceof Error ? error.message : 'Failed to resize project');
    }
  }, [width, height, project]);

  const handleSave = useCallback(async () => {
    try {
      await saveProjectToFile(project);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [project]);

  const handleLoad = useCallback(async () => {
    try {
      const loadedProject = await loadProjectFromFile();
      setProject(loadedProject);
      setWidth(loadedProject.width.toString());
      setHeight(loadedProject.height.toString());
      setCustomColors(extractCustomColors(loadedProject));
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, []);

  const handleBackgroundChange = useCallback((background: BackgroundImage | undefined) => {
    setProject(currentProject => ({
      ...currentProject,
      background
    }));
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <Toolbar
          selectedStitch={selectedStitch}
          selectedOrientation={selectedOrientation}
          selectedColor={selectedColor}
          customColors={customColors}
          width={width}
          height={height}
          project={project}
          gridRef={gridRef}
          onStitchChange={setSelectedStitch}
          onOrientationChange={setSelectedOrientation}
          onColorChange={setSelectedColor}
          onCustomColorAdd={handleCustomColorAdd}
          onWidthChange={setWidth}
          onHeightChange={setHeight}
          onResize={handleResize}
          onSave={handleSave}
          onLoad={handleLoad}
          onBackgroundChange={handleBackgroundChange}
          onModeChange={setMode}
          isEraserMode={isEraserMode}
          onEraserToggle={() => setIsEraserMode(!isEraserMode)}
        />
        <div className="grid-container">
          <Grid
            ref={gridRef}
            project={project}
            selectedColor={selectedColor}
            selectedStitch={selectedStitch}
            selectedOrientation={selectedOrientation}
            cellSize={GRID_CONSTANTS.defaultCellSize}
            mode={mode}
            isEraserMode={isEraserMode}
            onCellUpdate={handleCellUpdate}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
