import { ORIENTATION_OPTIONS } from './constants';

export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

// Helper function to create a valid Color
export const createColor = (r: number, g: number, b: number, a: number): Color => {
    const isValid = (val: number) => val >= 0 && val <= 255 && Number.isInteger(val);
    if (![r, g, b, a].every(isValid)) {
        throw new Error('Color values must be integers between 0 and 255');
    }
    return { r, g, b, a };
};

// Stitch types as union type from orientation options
export type StitchType = keyof typeof ORIENTATION_OPTIONS;
export type Orientation = 0 | 1 | 2 | 3;  // Only valid orientations

export interface Stitch {
    color: Color;
    stitchType: StitchType;
    orientation: Orientation;
}

export interface Cell {
    stitches: Stitch[];
}

export interface Project {
    width: number;
    height: number;
    grid: Cell[][];
}

export interface UIState {
    selectedColor: Color;
    selectedStitch: StitchType;
    selectedOrientation: string;  // Kept as string for form handling
}

// Type guard for Color validation
export const isValidColor = (color: unknown): color is Color => {
    if (typeof color !== 'object' || color === null) return false;

    const c = color as Color;
    const isValidComponent = (val: number) =>
        Number.isInteger(val) && val >= 0 && val <= 255;

    return (
        typeof c.r === 'number' && isValidComponent(c.r) &&
        typeof c.g === 'number' && isValidComponent(c.g) &&
        typeof c.b === 'number' && isValidComponent(c.b) &&
        typeof c.a === 'number' && isValidComponent(c.a)
    );
};

// Type guard for Stitch validation
export const isValidStitch = (stitch: unknown): stitch is Stitch => {
    if (typeof stitch !== 'object' || stitch === null) return false;

    const s = stitch as Stitch;
    return (
        isValidColor(s.color) &&
        typeof s.stitchType === 'string' &&
        typeof s.orientation === 'number' &&
        s.orientation >= 0 &&
        s.orientation <= 3 &&
        Object.keys(ORIENTATION_OPTIONS).includes(s.stitchType)
    );
};

// Type guard for Cell validation
export const isValidCell = (cell: unknown): cell is Cell => {
    if (typeof cell !== 'object' || cell === null) return false;

    const c = cell as Cell;
    return Array.isArray(c.stitches) && c.stitches.every(isValidStitch);
};