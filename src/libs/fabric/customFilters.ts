// src/libs/fabric/customFilters.ts
"use client";

// This defines a custom Hexagonal Pixelate filter for Fabric.js
if (
  typeof window !== "undefined" &&
  window.fabric &&
  window.fabric.Image &&
  window.fabric.Image.filters
) {
  /**
   * HexagonalPixelate filter class
   * A correct 2-pass implementation
   */
  window.fabric.Image.filters.HexagonalPixelate =
    window.fabric.util.createClass(
      window.fabric.Image.filters.BaseFilter,
      {
        type: "HexagonalPixelate",
        mainParameter: "blocksize",
        blocksize: 8, // Default side length of the hexagon

        /**
         * Applies the filter to the 2D canvas
         */
        applyTo2d: function (options: any) {
          const imageData = options.imageData;
          const data = imageData.data;
          const width = imageData.width;
          const height = imageData.height;

          // Hexagon geometry
          const s = Math.max(1, this.blocksize); // side length
          // These are the constants for "pointy top" hexagons
          const hex_w = s * Math.sqrt(3);
          const hex_h = s * 2;
          const r = hex_h / 2;
          const t_a = (hex_w / 2);
          const t_b = (hex_h / 4);

          // Store average colors
          const avgColors: { [key: string]: { r: number; g: number; b: number; a: number; count: number } } = {};
          let i, x, y, row, col, key;

          // 1. Pass: Calculate average color for each hex
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              
              // Find which hex this pixel belongs to
              // Find the row and column of the "parallelogram" grid
              let py = y / (r + t_b);
              let px = x / hex_w;

              // Correct for the "pointy" part of the hex
              let p_x = px - Math.floor(px);
              let p_y = py - Math.floor(py);
              if ( (Math.floor(py) + Math.floor(px)) % 2 == 0) {
                  if (p_y > (1 - p_x * (t_b / t_a))) {
                      py = py + 1;
                  }
              } else {
                  if (p_y > (p_x * (t_b / t_a))) {
                      py = py + 1;
                  }
              }
              
              row = Math.floor(py);
              col = Math.floor(px);
              
              key = `${row},${col}`;
              i = (y * width + x) * 4;
              
              if (!avgColors[key]) {
                avgColors[key] = { r: 0, g: 0, b: 0, a: 0, count: 0 };
              }

              avgColors[key].r += data[i];
              avgColors[key].g += data[i + 1];
              avgColors[key].b += data[i + 2];
              avgColors[key].a += data[i + 3];
              avgColors[key].count++;
            }
          }

          // Calculate final averages
          for (key in avgColors) {
            const avg = avgColors[key];
            avg.r /= avg.count;
            avg.g /= avg.count;
            avg.b /= avg.count;
            avg.a /= avg.count;
          }
          
          // 2. Pass: Apply average color
           for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              
              let py = y / (r + t_b);
              let px = x / hex_w;

              let p_x = px - Math.floor(px);
              let p_y = py - Math.floor(py);
              if ( (Math.floor(py) + Math.floor(px)) % 2 == 0) {
                  if (p_y > (1 - p_x * (t_b / t_a))) {
                      py = py + 1;
                  }
              } else {
                  if (p_y > (p_x * (t_b / t_a))) {
                      py = py + 1;
                  }
              }
              
              row = Math.floor(py);
              col = Math.floor(px);

              key = `${row},${col}`;
              i = (y * width + x) * 4;

              if (avgColors[key]) {
                  data[i] = avgColors[key].r;
                  data[i + 1] = avgColors[key].g;
                  data[i + 2] = avgColors[key].b;
                  data[i + 3] = avgColors[key].a;
              }
            }
          }
        },

        toObject: function () {
          return window.fabric.util.object.extend(this.callSuper("toObject"), {
            blocksize: this.blocksize,
          });
        },
      }
    );

  // Helper function for class creation
  if (
    typeof window.fabric.Image.filters.HexagonalPixelate.fromObject ===
    "undefined"
  ) {
    window.fabric.Image.filters.HexagonalPixelate.fromObject =
      window.fabric.Image.filters.BaseFilter.fromObject;
  }
}