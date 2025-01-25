import { Project, Cell, Stitch } from '../types';

export const createNewProject = (width: number, height: number): Project => {
    const grid: Cell[][] = Array(height)
        .fill(null)
        .map(() =>
            Array(width)
                .fill(null)
                .map(() => ({ stitches: [] }))
        );

    return {
        width,
        height,
        grid
    };
};

export const validateOrientation = (orientation: string, stitchType: string, orientationOptions: Record<string, string[]>): number => {
    const oriVal = parseInt(orientation, 10);
    const maxOrientation = orientationOptions[stitchType].length - 1;

    if (isNaN(oriVal) || oriVal < 0 || oriVal > maxOrientation) {
        throw new Error(`Invalid orientation ${oriVal} for stitch type ${stitchType}: must be between 0 and ${maxOrientation}`);
    }

    return oriVal;
};

export const toggleStitchInCell = (project: Project, row: number, col: number, stitch: Stitch): void => {
    if (!project || !project.grid) {
        throw new Error('Invalid project: nil project or grid');
    }

    if (row < 0 || row >= project.height || col < 0 || col >= project.width) {
        throw new Error(`Coordinates out of bounds: [${row},${col}] (grid size: ${project.width}x${project.height})`);
    }

    const cell = project.grid[row][col];
    const existingStitchIndex = cell.stitches.findIndex(s =>
        s.stitchType === stitch.stitchType &&
        s.orientation === stitch.orientation
    );

    if (existingStitchIndex !== -1) {
        // Remove the stitch if it already exists
        cell.stitches.splice(existingStitchIndex, 1);
    } else {
        // Add the new stitch if it doesn't exist
        cell.stitches.push(stitch);
    }
};

export const saveProjectToFile = async (project: Project): Promise<void> => {
    const jsonString = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'project.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const validateStitch = (stitch: unknown): stitch is Stitch => {
    return (
        typeof stitch === 'object' &&
        stitch !== null &&
        typeof (stitch as Stitch).stitchType === 'string' &&
        typeof (stitch as Stitch).orientation === 'number' &&
        typeof (stitch as Stitch).color === 'object' &&
        (stitch as Stitch).color !== null &&
        typeof (stitch as Stitch).color.r === 'number' &&
        typeof (stitch as Stitch).color.g === 'number' &&
        typeof (stitch as Stitch).color.b === 'number' &&
        typeof (stitch as Stitch).color.a === 'number'
    );
};

const validateCell = (cell: unknown): cell is Cell => {
    return (
        typeof cell === 'object' &&
        cell !== null &&
        Array.isArray((cell as Cell).stitches) &&
        (cell as Cell).stitches.every((stitch: unknown) => validateStitch(stitch))
    );
};

export const loadProjectFromFile = async (): Promise<Project> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate the project structure
                if (
                    typeof data !== 'object' ||
                    data === null ||
                    typeof data.width !== 'number' ||
                    typeof data.height !== 'number' ||
                    !Array.isArray(data.grid) ||
                    data.grid.length !== data.height ||
                    !data.grid.every((row: unknown[]) =>
                        Array.isArray(row) &&
                        row.length === data.width &&
                        row.every((cell: unknown) => validateCell(cell))
                    )
                ) {
                    throw new Error('Invalid project file format');
                }

                const project = data as Project;
                resolve(project);
            } catch (error) {
                reject(error);
            }
        };

        input.click();
    });
};

export const resizeProject = (
    project: Project,
    newWidth: number,
    newHeight: number
): Project => {
    if (newWidth <= 0 || newHeight <= 0) {
        throw new Error(`Invalid dimensions: width and height must be positive (got ${newWidth}x${newHeight})`);
    }

    const newGrid: Cell[][] = Array(newHeight)
        .fill(null)
        .map((_, y) =>
            Array(newWidth)
                .fill(null)
                .map((_, x) => {
                    if (y < project.height && x < project.width) {
                        return { ...project.grid[y][x] };
                    }
                    return { stitches: [] };
                })
        );

    return {
        width: newWidth,
        height: newHeight,
        grid: newGrid
    };
};