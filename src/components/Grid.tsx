import React, { useRef, useState, useEffect, forwardRef, useCallback, useMemo } from 'react';
import { Color, Project, Stitch, StitchType, Orientation, AppMode } from '../types';
import { StitchSVG } from './StitchSVG';

interface GridProps {
  project: Project;
  selectedColor: Color;
  selectedStitch: StitchType;
  selectedOrientation: string;
  cellSize: number;
  mode: AppMode;
  onCellUpdate: (row: number, col: number, stitch: Stitch) => void;
}

// Helper function to create a stitch with type validation
const createStitch = (
  color: Color,
  stitchType: StitchType,
  orientationStr: string
): Stitch => {
  const orientation = parseInt(orientationStr, 10) as Orientation;
  if (orientation < 0 || orientation > 3) {
    throw new Error(`Invalid orientation: ${orientation}`);
  }
  return {
    color,
    stitchType,
    orientation,
  };
};

export const Grid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const {
    project,
    selectedColor,
    selectedStitch,
    selectedOrientation,
    cellSize,
    mode,
    onCellUpdate,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastCell, setLastCell] = useState<{ row: number; col: number } | null>(null);

  // Draw background image
  const drawBackground = useCallback(() => {
    const canvas = backgroundRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Always clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only draw if there's a background image
    if (project.background) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = project.background!.opacity;
        const { x, y } = project.background!.position;
        const scale = project.background!.scale;
        
        ctx.drawImage(
          img,
          x,
          y,
          img.width * scale,
          img.height * scale
        );
      };
      img.src = project.background.dataUrl;
    }
  }, [project.background]);

  // Draw grid lines
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw grid lines, no background fill
    for (let row = 0; row < project.height; row++) {
      for (let col = 0; col < project.width; col++) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }, [project.height, project.width, cellSize]);

  useEffect(() => {
    drawGrid();
    drawBackground();
  }, [drawGrid, drawBackground]);

  const getCellFromPosition = useCallback((x: number, y: number): { row: number; col: number } | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    const row = Math.floor(canvasY / cellSize);
    const col = Math.floor(canvasX / cellSize);

    if (row < 0 || row >= project.height || col < 0 || col >= project.width) {
      return null;
    }

    return { row, col };
  }, [project.height, project.width, cellSize]);

  const updateCell = useCallback((row: number, col: number) => {
    if (mode !== 'edit') return; // Only allow editing in edit mode
    
    try {
      // Create new stitch with current properties
      const newStitch = createStitch(selectedColor, selectedStitch, selectedOrientation);
      
      // Pass to onCellUpdate which will handle the array management via toggleStitchInCell
      onCellUpdate(row, col, newStitch);
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
  }, [mode, project.grid, selectedColor, selectedStitch, selectedOrientation, onCellUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'edit') return; // Only allow editing in edit mode

    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell) {
      setIsDragging(true);
      setLastCell(cell);
      updateCell(cell.row, cell.col);
    }
  }, [mode, getCellFromPosition, updateCell]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || mode !== 'edit') return;

    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell && (cell.row !== lastCell?.row || cell.col !== lastCell?.col)) {
      setLastCell(cell);
      updateCell(cell.row, cell.col);
    }
  }, [mode, isDragging, lastCell, getCellFromPosition, updateCell]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastCell(null);
  }, []);

  // Memoize the grid overlay cells
  const gridOverlay = useMemo(() => (
    project.grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          style={{
            position: 'absolute',
            top: rowIndex * cellSize,
            left: colIndex * cellSize,
            width: cellSize,
            height: cellSize,
          }}
        >
          {cell.stitches.map((stitch, stitchIndex) => (
            <StitchSVG
              key={`${rowIndex}-${colIndex}-${stitchIndex}`}
              type={stitch.stitchType}
              orientation={stitch.orientation}
              color={stitch.color}
              size={cellSize}
            />
          ))}
        </div>
      ))
    )
  ), [project.grid, cellSize]);

  const width = project.width * cellSize;
  const height = project.height * cellSize;

  return (
    <div ref={ref} className="grid-wrapper">
      <div
        className="grid-section"
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        {/* Background layer */}
        <canvas
          ref={backgroundRef}
          width={project.width * cellSize}
          height={project.height * cellSize}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        
        {/* Grid layer */}
        <canvas
          ref={canvasRef}
          data-grid="true"
          width={project.width * cellSize}
          height={project.height * cellSize}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            border: '1px solid #ccc',
            cursor: mode === 'edit' ? 'crosshair' : 'default',
          }}
        />

        {/* Stitches overlay layer */}
        <div
          className="grid-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${height}px`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {gridOverlay}
        </div>
      </div>
    </div>
  );
});

Grid.displayName = 'Grid';