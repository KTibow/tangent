// Adapted from workspace.js from GNOME, a GNU project, using Sonnet and 4.1

interface WindowInput {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  id: string;
}

interface LayoutArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowResult {
  x: number;
  y: number;
  scale: number;
}

interface LayoutOptions {
  monitorHeight?: number;
  rowSpacing?: number;
  columnSpacing?: number;
  maxScale?: number;
}

type Row = {
  x: number;
  y: number;
  width: number;
  height: number;
  fullWidth: number;
  fullHeight: number;
  windows: WindowInput[];
  additionalScale?: number;
};

export default function (
  windows: WindowInput[],
  area: LayoutArea,
  options: LayoutOptions = {},
): Record<string, WindowResult> {
  if (windows.length === 0) return {};

  const {
    monitorHeight = area.height,
    rowSpacing = 20,
    columnSpacing = 20,
    maxScale = 0.95,
  } = options;

  // Layout optimization weights
  const LAYOUT_SCALE_WEIGHT = 1;
  const LAYOUT_SPACE_WEIGHT = 0.1;

  // Utility functions
  const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

  const computeWindowScale = (window: WindowInput): number => {
    const ratio = window.height / monitorHeight;
    return lerp(1.5, 1, ratio); // Scale smaller windows up for visibility
  };

  const isBetterLayout = (
    oldScale: number,
    oldSpace: number,
    newScale: number,
    newSpace: number,
  ): boolean => {
    const spacePower = (newSpace - oldSpace) * LAYOUT_SPACE_WEIGHT;
    const scalePower = (newScale - oldScale) * LAYOUT_SCALE_WEIGHT;

    if (newScale > oldScale && newSpace > oldSpace) return true;
    if (newScale > oldScale && newSpace <= oldSpace) return scalePower > spacePower;
    if (newScale <= oldScale && newSpace > oldSpace) return spacePower > scalePower;
    return false;
  };

  // Core layout computation
  const computeLayout = (windowList: WindowInput[], numRows: number) => {
    const rows: Row[] = [];

    // Calculate ideal row width
    let totalWidth = 0;
    for (const window of windowList) {
      totalWidth += window.width * computeWindowScale(window);
    }
    const idealRowWidth = totalWidth / numRows;

    // Sort windows vertically to minimize travel distance
    const sortedWindows = [...windowList].sort((a, b) => a.centerY - b.centerY);

    let windowIndex = 0;
    for (let i = 0; i < numRows; i++) {
      const row: Row = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fullWidth: 0,
        fullHeight: 0,
        windows: [],
      };
      rows.push(row);

      // Add windows to this row
      while (windowIndex < sortedWindows.length) {
        const window = sortedWindows[windowIndex];
        const scale = computeWindowScale(window);
        const scaledWidth = window.width * scale;
        const scaledHeight = window.height * scale;

        row.fullHeight = Math.max(row.fullHeight, scaledHeight);

        // Decide if window should stay in this row
        const wouldExceed = row.fullWidth + scaledWidth > idealRowWidth;
        const oldRatio = row.fullWidth / idealRowWidth;
        const newRatio = (row.fullWidth + scaledWidth) / idealRowWidth;
        const betterFit = Math.abs(1 - newRatio) < Math.abs(1 - oldRatio);
        const isLastRow = i === numRows - 1;

        if (!wouldExceed || betterFit || isLastRow) {
          row.windows.push(window);
          row.fullWidth += scaledWidth;
          windowIndex++;
        } else {
          break;
        }
      }

      // Sort row by horizontal position
      row.windows.sort((a, b) => a.centerX - b.centerX);
    }

    // Find grid dimensions
    let gridHeight = 0;
    let maxRowWidth = 0;
    let maxColumns = 0;

    for (const row of rows) {
      maxRowWidth = Math.max(maxRowWidth, row.fullWidth);
      maxColumns = Math.max(maxColumns, row.windows.length);
      gridHeight += row.fullHeight;
    }

    return { numRows, rows, maxColumns, gridWidth: maxRowWidth, gridHeight };
  };

  const computeScaleAndSpace = (
    layout: ReturnType<typeof computeLayout>,
    targetArea: LayoutArea,
  ) => {
    const hSpacing = (layout.maxColumns - 1) * columnSpacing;
    const vSpacing = (layout.numRows - 1) * rowSpacing;

    const spacedWidth = targetArea.width - hSpacing;
    const spacedHeight = targetArea.height - vSpacing;

    const horizontalScale = spacedWidth / layout.gridWidth;
    const verticalScale = spacedHeight / layout.gridHeight;
    const scale = Math.min(horizontalScale, verticalScale, maxScale);

    const scaledLayoutWidth = layout.gridWidth * scale + hSpacing;
    const scaledLayoutHeight = layout.gridHeight * scale + vSpacing;
    const space = (scaledLayoutWidth * scaledLayoutHeight) / (targetArea.width * targetArea.height);

    return { scale, space, layout: { ...layout, scale } };
  };

  // Find best layout by trying different row counts
  let bestResult: ReturnType<typeof computeScaleAndSpace> | null = null;
  let lastNumColumns = -1;

  for (let numRows = 1; numRows <= windows.length; numRows++) {
    const numColumns = Math.ceil(windows.length / numRows);
    if (numColumns === lastNumColumns) break;

    const layout = computeLayout(windows, numRows);
    const result = computeScaleAndSpace(layout, area);

    if (
      !bestResult ||
      isBetterLayout(bestResult.scale, bestResult.space, result.scale, result.space)
    ) {
      bestResult = result;
    } else {
      break; // Layout got worse, use previous
    }

    lastNumColumns = numColumns;
  }

  if (!bestResult) return {};

  // Compute final positions
  const { layout, scale } = bestResult;
  const { rows } = layout;

  // Calculate row sizes
  for (const row of rows) {
    row.width = row.fullWidth * scale + (row.windows.length - 1) * columnSpacing;
    row.height = row.fullHeight * scale;
  }

  // Calculate additional scaling if needed
  let heightWithoutSpacing = 0;
  for (const row of rows) {
    heightWithoutSpacing += row.height;
  }

  const verticalSpacing = (rows.length - 1) * rowSpacing;
  const additionalVerticalScale = Math.min(
    1,
    (area.height - verticalSpacing) / heightWithoutSpacing,
  );

  let compensation = 0;
  let y = 0;

  // Position rows
  for (const row of rows) {
    const horizontalSpacing = (row.windows.length - 1) * columnSpacing;
    const widthWithoutSpacing = row.width - horizontalSpacing;
    const additionalHorizontalScale = Math.min(
      1,
      (area.width - horizontalSpacing) / widthWithoutSpacing,
    );

    if (additionalHorizontalScale < additionalVerticalScale) {
      row.additionalScale = additionalHorizontalScale;
      compensation += (additionalVerticalScale - additionalHorizontalScale) * row.height;
    } else {
      row.additionalScale = additionalVerticalScale;
    }

    row.x =
      area.x +
      Math.max(area.width - (widthWithoutSpacing * row.additionalScale + horizontalSpacing), 0) / 2;
    row.y = area.y + Math.max(area.height - (heightWithoutSpacing + verticalSpacing), 0) / 2 + y;
    y += row.height * row.additionalScale! + rowSpacing;
  }

  compensation /= 2;

  // Calculate final window positions and scales
  const results: Record<string, WindowResult> = {};

  for (const row of rows) {
    const rowY = row.y + compensation;
    const rowHeight = row.height * (row.additionalScale as number);

    let x = row.x;
    for (const window of row.windows) {
      const windowScale = scale * computeWindowScale(window) * (row.additionalScale as number);
      const cellWidth = window.width * windowScale;
      const cellHeight = window.height * windowScale;

      // Respect maximum scale constraint
      const finalScale = Math.min(windowScale, maxScale);
      const finalWidth = window.width * finalScale;
      const finalHeight = window.height * finalScale;

      const finalX = x + (cellWidth - finalWidth) / 2;
      let finalY: number;

      // Vertical alignment
      if (rows.length === 1) {
        finalY = rowY + (rowHeight - finalHeight) / 2; // Center if single row
      } else {
        finalY = rowY + rowHeight - cellHeight; // Bottom align if multiple rows
      }

      // Adjust position for center scaling
      // When scaling from center, top-left corner moves towards center by:
      const topLeftMovementX = (window.width * (1 - finalScale)) / 2;
      const topLeftMovementY = (window.height * (1 - finalScale)) / 2;

      // To compensate, position element further away from center by same amount
      const adjustedX = finalX - topLeftMovementX;
      const adjustedY = finalY - topLeftMovementY;

      results[window.id] = {
        x: Math.floor(adjustedX),
        y: Math.floor(adjustedY),
        scale: finalScale, // Normalize scale
      };

      x += cellWidth + columnSpacing;
    }
  }

  return results;
}
