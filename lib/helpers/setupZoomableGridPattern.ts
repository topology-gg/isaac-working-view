import { fabric } from "fabric";
import drawGridPattern, { GridOpt } from "./drawGridPattern";

interface ZoomStep {
    min?: number;
    max?: number;
    widthFactor: number;
    /** Adjust the size of the pattern, bigger means fewer lines */
    sizeFactor?: number;
    fractionsCount?: number;
}

interface ZoomableGridPatternOpt extends GridOpt {
    superSample: number;
    zoomSteps: ZoomStep[];
}

/**
 * Dynamic Grid that can be adjusted according to zoom
 */
export default function setupZoomableGridPattern(
    patternCanvasRef,
    {
        superSample,
        size,
        color,
        strokeWidth,
        fractionWidthFactor,
        zoomSteps,
    }: ZoomableGridPatternOpt
): { pattern; adjustToZoom: (zoom: number) => void } {
    // set up a separate pattern canvas
    patternCanvasRef.current = document.createElement("canvas");

    const gridPatternOptions: GridOpt = {
        size: size * superSample,
        color,
        strokeWidth: strokeWidth * superSample,
        fractionWidthFactor,
    };
    drawGridPattern(patternCanvasRef.current, gridPatternOptions);

    const fPattern = new fabric.Pattern({
        source: patternCanvasRef.current,
        repeat: "repeat",
        // [scaleX, skewY, skewX, scaleY, translateX, translateY]
        // (https://stackoverflow.com/a/71037757/322253)
        patternTransform: [1 / superSample, 0, 0, 1 / superSample, 0, 0],
    });

    const adjustToZoom = (zoom: number) => {
        let adjustedOptions = gridPatternOptions;
        zoomSteps.forEach((zoomStep) => {
            const min = zoomStep.min || 0;
            const max = zoomStep.max || Infinity;
            const widthFactor = zoomStep.widthFactor || 1;
            const sizeFactor = zoomStep.sizeFactor || 1;
            if (min < zoom && zoom < max) {
                adjustedOptions = {
                    ...gridPatternOptions,
                    strokeWidth: gridPatternOptions.strokeWidth * widthFactor,
                    size: gridPatternOptions.size * sizeFactor,
                    fractions: zoomStep.fractionsCount,
                };
            }
        });
        drawGridPattern(patternCanvasRef.current, adjustedOptions);
    };

    return { pattern: fPattern, adjustToZoom };
}
