import React from 'react';
import { Project } from '../types';

interface PrintButtonProps {
  project: Project;
  gridRef: React.RefObject<HTMLDivElement>;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ project, gridRef }) => {
  const handlePrint = () => {
    // Store current scroll position
    const scrollPos = {
      x: window.scrollX,
      y: window.scrollY
    };

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get necessary styles by filtering stylesheets
    const styleSheets = Array.from(document.styleSheets);
    const printStyles = styleSheets
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .filter(rule => {
              // Only include print media rules and essential styles
              return rule.cssText.includes('@media print') ||
                     rule.cssText.includes('.grid-') ||
                     rule.cssText.includes('svg');
            })
            .map(rule => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    // Get the grid content
    const gridContent = gridRef.current?.cloneNode(true) as HTMLElement;
    if (!gridContent) return;

    // Determine if we need to rotate (width > height)
    const needsRotation = project.width > project.height;
    
    // Calculate dimensions with cell size limit
    const MAX_CELL_SIZE_MM = 4; // approximately 15px
    const effectiveWidth = needsRotation ? project.height : project.width;
    const effectiveHeight = needsRotation ? project.width : project.height;
    
    // Calculate required width based on number of cells and max cell size
    const requiredWidth = effectiveWidth * MAX_CELL_SIZE_MM;
    
    // Use the smaller of available width or required width
    const maxWidth = Math.min(180, requiredWidth); // 180mm is A4 width minus margins
    
    const cellSizeInMm = maxWidth / effectiveWidth;
    const calculatedHeight = cellSizeInMm * effectiveHeight;
    const padding = 2; // 2mm padding

    // Create grid cells with borders
    const gridCells = [];
    const totalRows = needsRotation ? project.width : project.height;
    const totalCols = needsRotation ? project.height : project.width;

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        // Calculate position in millimeters
        const position = {
          top: row * cellSizeInMm,
          left: col * cellSizeInMm
        };

        // Determine borders based on position in grid
        const borders = {
          top: row === 0 ? '1px solid #e0e0e0' : 'none',
          right: col === totalCols - 1 ? '1px solid #e0e0e0' : 'none',
          bottom: row === totalRows - 1 ? '1px solid #e0e0e0' : 'none',
          left: col === 0 ? '1px solid #e0e0e0' : 'none',
          // Add internal grid lines
          afterTop: row !== 0 ? '1px solid #e0e0e0' : 'none',
          afterLeft: col !== 0 ? '1px solid #e0e0e0' : 'none'
        };

        gridCells.push(`
          <div style="
            position: absolute;
            top: ${position.top}mm;
            left: ${position.left}mm;
            width: ${cellSizeInMm}mm;
            height: ${cellSizeInMm}mm;
            border-top: ${borders.top};
            border-right: ${borders.right};
            border-bottom: ${borders.bottom};
            border-left: ${borders.left};
            box-sizing: border-box;
            ${borders.afterTop !== 'none' ? `border-top: ${borders.afterTop};` : ''}
            ${borders.afterLeft !== 'none' ? `border-left: ${borders.afterLeft};` : ''}
          "></div>
        `);
      }
    }

    // Update overlay positions based on cell size
    const overlayElements = gridContent.querySelectorAll('.grid-overlay > div') as NodeListOf<HTMLDivElement>;
    overlayElements.forEach(element => {
      const currentTop = parseInt(element.style.top);
      const currentLeft = parseInt(element.style.left);
      
      // Get grid position from current position
      const col = currentLeft / parseInt(element.style.width);
      const row = currentTop / parseInt(element.style.height);
      
      // Calculate rotated or normal position
      const position = needsRotation ? {
        top: `${col * cellSizeInMm}mm`,
        left: `${(project.height - row - 1) * cellSizeInMm}mm`,
      } : {
        top: `${row * cellSizeInMm}mm`,
        left: `${col * cellSizeInMm}mm`,
      };

      element.style.top = position.top;
      element.style.left = position.left;
      element.style.width = `${cellSizeInMm}mm`;
      element.style.height = `${cellSizeInMm}mm`;

      // If rotated, rotate each SVG 90 degrees
      if (needsRotation) {
        const svg = element.querySelector('svg');
        if (svg) {
          svg.style.transform = 'rotate(90deg)';
        }
      }
    });

    // Prepare print document content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cross Stitch Pattern</title>
          <style>
            ${printStyles}
            
            @page {
              size: ${needsRotation ? 'A4 landscape' : 'A4'};
              margin: 15mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .print-container {
              width: ${maxWidth + (padding * 2)}mm;
              margin: 0 auto;
              padding: ${padding}mm;
              box-sizing: content-box;
            }
            
            .grid-section {
              width: ${maxWidth}mm;
              height: ${calculatedHeight}mm;
              position: relative;
              page-break-inside: avoid;
              margin: 0 auto;
            }

            .grid-cells {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            
            .grid-overlay {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              z-index: 1;
            }

            .grid-overlay > div {
              position: absolute !important;
            }

            .grid-overlay svg {
              width: 100% !important;
              height: 100% !important;
              transform-origin: center !important;
              vector-effect: non-scaling-stroke !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="grid-section">
              <div class="grid-cells">
                ${gridCells.join('\n')}
              </div>
              ${gridContent.querySelector('.grid-overlay')?.outerHTML || ''}
            </div>
          </div>
        </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for resources to load before printing
    const waitForResources = () => {
      if (printWindow.document.readyState === 'complete') {
        // Give a small delay for final render
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            // Restore scroll position
            window.scrollTo(scrollPos.x, scrollPos.y);
          };
        }, 250);
      } else {
        setTimeout(waitForResources, 100);
      }
    };

    printWindow.onload = waitForResources;
  };

  return (
    <button
      onClick={handlePrint}
      style={{
        padding: '4px 12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: 'white',
        cursor: 'pointer'
      }}
    >
      Print
    </button>
  );
};