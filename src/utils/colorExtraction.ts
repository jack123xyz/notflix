export function extractDominantColors(data: Uint8ClampedArray): number[][] {
  // Create buckets for similar colors
  const colorBuckets: Record<string, { count: number; color: number[] }> = {};

  // Sample pixels at intervals (for performance)
  const samplingInterval = 5;

  for (let i = 0; i < data.length; i += 4 * samplingInterval) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 200) continue;

    // Skip very dark colors (near black)
    if (r + g + b < 60) continue;

    // Skip very light colors (near white)
    if (r + g + b > 700) continue;

    // Skip very desaturated colors (grayish)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Skip low saturation colors (grayish)
    if (saturation < 0.15) continue;

    // Group similar colors together (reduce precision)
    const key = `${Math.floor(r / 10)},${Math.floor(g / 10)},${Math.floor(
      b / 10
    )}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = {
        count: 0,
        color: [r, g, b],
      };
    }

    colorBuckets[key].count++;
  }

  // Sort by frequency and saturation
  const sortedColors = Object.values(colorBuckets)
    .sort((a, b) => {
      // Prioritize most frequent colors
      return b.count - a.count;
    })
    .map((bucket) => bucket.color);

  // Return top colors, or fallbacks if not enough found
  return [
    sortedColors[0] || [229, 9, 20], // Netflix red
    sortedColors[1] || [40, 40, 40], // Dark gray
    sortedColors[2] || [20, 20, 20], // Darker gray
  ];
}

export function extractColorsFromImage(imageElement: HTMLImageElement): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas to sample the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Set canvas size
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;

      // Draw the image to canvas
      ctx.drawImage(imageElement, 0, 0);

      // Get image data - focus on the upper portion where key colors are usually found
      const upperHeight = Math.floor(canvas.height / 3);
      const imageData = ctx.getImageData(0, 0, canvas.width, upperHeight);

      // Extract dominant colors
      const colors = extractDominantColors(imageData.data);
      resolve(colors);
    } catch (err) {
      reject(err);
    }
  });
}

export function getFallbackColors(): number[][] {
  return [
    [229, 9, 20],   // Netflix red
    [20, 20, 20],   // Dark gray
    [50, 50, 50],   // Light gray
  ];
}