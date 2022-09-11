export interface GridOpt {
    /** Size of the grid square */
    size?: number;
    /** Color of the grid lines */
    color?: string;
    /** Width of the line */
    strokeWidth?: number;
    /** How many extra divisions should the grid have? */
    fractions?: number;
    /** How should the stroke width change for the divisions */
    fractionWidthFactor?: number;
}

/** Draws a grid pattern */
export default function drawGridPattern(
    canvas,
    {
        size = 40,
        color = "rgb(150, 150, 150)",
        strokeWidth = 1,
        fractions = 0,
        fractionWidthFactor = 0.5,
    }: GridOpt
) {
    canvas.width = size;
    canvas.height = size;
    var pctx = canvas.getContext("2d");

    // Using half pixel values to create sharp edges
    // https://stackoverflow.com/a/7531540/322253

    const lineCenterOffset = strokeWidth / 2.0;

    // Top to bottom
    pctx.beginPath();
    pctx.moveTo(lineCenterOffset, -lineCenterOffset);
    pctx.lineTo(lineCenterOffset, size + lineCenterOffset);
    pctx.lineWidth = strokeWidth;
    pctx.strokeStyle = color;
    pctx.stroke();

    if (fractions) {
        Array(fractions)
            .fill(null)
            .forEach((_, i) => {
                const fractionSize = size / (fractions + 1);
                const x = fractionSize * (i + 1) + lineCenterOffset;
                pctx.beginPath();
                pctx.moveTo(x, -lineCenterOffset);
                pctx.lineTo(x, size + lineCenterOffset);
                pctx.lineWidth = strokeWidth * fractionWidthFactor;
                pctx.strokeStyle = color;
                pctx.stroke();
            });
    }

    // Left to right
    pctx.beginPath();
    pctx.moveTo(-lineCenterOffset, lineCenterOffset);
    pctx.lineTo(size + lineCenterOffset, lineCenterOffset);
    pctx.lineWidth = strokeWidth;
    pctx.strokeStyle = color;
    pctx.stroke();

    if (fractions) {
        Array(fractions)
            .fill(null)
            .forEach((_, i) => {
                const fractionSize = size / (fractions + 1);
                const y = fractionSize * (i + 1) + lineCenterOffset;
                pctx.beginPath();
                pctx.moveTo(-lineCenterOffset, y);
                pctx.lineTo(size + lineCenterOffset, y);
                pctx.lineWidth = strokeWidth * fractionWidthFactor;
                pctx.strokeStyle = color;
                pctx.stroke();
            });
    }
}
