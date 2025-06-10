declare module "color-thief-browser" {
  export default class ColorThief {
    /**
     * Get the dominant color from an image
     * @param img Image element or canvas
     * @return [r, g, b] array of the dominant color
     */
    getColor(
      img: HTMLImageElement | HTMLCanvasElement
    ): [number, number, number];

    /**
     * Get a palette of colors from an image
     * @param img Image element or canvas
     * @param colorCount Number of colors to retrieve (default: 10)
     * @param quality Color quality (default: 10)
     * @return Array of [r, g, b] color arrays
     */
    getPalette(
      img: HTMLImageElement | HTMLCanvasElement,
      colorCount?: number,
      quality?: number
    ): Array<[number, number, number]>;
  }
}
