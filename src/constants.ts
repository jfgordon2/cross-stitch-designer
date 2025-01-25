import { Color } from './types';

// Grid Constants
export const GRID_CONSTANTS = {
    defaultGridSize: 20,
    defaultCellSize: 30,
    defaultWindowWidth: 1024,
    defaultWindowHeight: 768,
    toolbarHeight: 100,
    windowMargin: 20,
} as const;

// Stitch Types and Orientations
export const ORIENTATION_OPTIONS = {
    "Full": ["0"],
    "3/4": ["0", "1", "2", "3"],
    "1/2": ["0", "1"],
    "1/4": ["0", "1", "2", "3"],
    "Back": ["0", "1", "2", "3"],
} as const;

// Default Colors
export const COLORS: Color[] = [
    { r: 0x00, g: 0x00, b: 0x00, a: 0xFF }, // Black
    { r: 0xFF, g: 0x00, b: 0x00, a: 0xFF }, // Red
    { r: 0x00, g: 0xFF, b: 0x00, a: 0xFF }, // Green
    { r: 0x00, g: 0x00, b: 0xFF, a: 0xFF }, // Blue
    { r: 0xFF, g: 0xFF, b: 0x00, a: 0xFF }, // Yellow
];

// Error Messages
export const ERROR_MESSAGES = {
    INVALID_DIMENSIONS: 'Invalid dimensions: width and height must be positive numbers',
    INVALID_PROJECT: 'Invalid project: nil project or grid',
    INVALID_FILE_FORMAT: 'Invalid project file format',
    NO_FILE_SELECTED: 'No file selected',
    COORDINATES_OUT_OF_BOUNDS: (row: number, col: number, width: number, height: number) =>
        `Coordinates out of bounds: [${row},${col}] (grid size: ${width}x${height})`,
    INVALID_ORIENTATION: (orientation: number, stitchType: string, maxOrientation: number) =>
        `Invalid orientation ${orientation} for stitch type ${stitchType}: must be between 0 and ${maxOrientation}`,
} as const;