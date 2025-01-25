import React, { useRef, useState, useEffect, forwardRef, useCallback, useMemo } from 'react';
import { Color, Project, Stitch, StitchType, Orientation } from '../types';
import { StitchSVG } from './StitchSVG';

interface GridProps {
  project: Project;
  selectedColor: Color;
  selectedStitch: StitchType;
  selectedOrientation: string;
  cellSize: number;
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

export const Grid = forwardRef<HTMLDivElement, GridProps>(({
  project,
  selectedColor,
  selectedStitch,
  selectedOrientation,
  cellSize,
  onCellUpdate,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastCell, setLastCell] = useState<{ row: number; col: number } | null>(null);

  // Memoize grid drawing function
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells background and borders
    for (let row = 0; row < project.height; row++) {
      for (let col = 0; col < project.width; col++) {
        // Draw cell background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        
        // Draw cell border with lighter color
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }, [project.height, project.width, cellSize]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

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
    try {
      const newStitch = createStitch(selectedColor, selectedStitch, selectedOrientation);
      onCellUpdate(row, col, newStitch);
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
  }, [selectedColor, selectedStitch, selectedOrientation, onCellUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell) {
      setIsDragging(true);
      setLastCell(cell);
      updateCell(cell.row, cell.col);
    }
  }, [getCellFromPosition, updateCell]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell && (cell.row !== lastCell?.row || cell.col !== lastCell?.col)) {
      setLastCell(cell);
      updateCell(cell.row, cell.col);
    }
  }, [isDragging, lastCell, getCellFromPosition, updateCell]);

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

  return (
    <div 
      ref={ref} 
      style={{ position: 'relative' }}
      className="grid-section"
    >
      <canvas
        ref={canvasRef}
        width={project.width * cellSize}
        height={project.height * cellSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair',
        }}
      />
      <div
        className="grid-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        {gridOverlay}
      </div>
    </div>
  );
});

Grid.displayName = 'Grid';