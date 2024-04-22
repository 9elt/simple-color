const R = 0;
const G = 1;
const B = 2;
const A = 3;

export class Color extends Uint8ClampedArray {
    constructor(r = 255, g = 255, b = 255, a = 255) {
        super(4);
        this[R] = r;
        this[G] = g;
        this[B] = b;
        this[A] = a;
    }
    toString(): string {
        return 'rgba('
            + this[R] + ','
            + this[G] + ','
            + this[B] + ','
            + (this[A] / 255).toFixed(2)
            + ')';
    }
}

/**
 * clone
 */

export function clone(color: Color): Color {
    return new Color(
        color[R],
        color[G],
        color[B],
        color[A]
    );
}

/**
 * get the color luminosity
 */

export function luma(color: Color): number {
    return 0.2126 * color[R] + 0.7152 * color[G] + 0.0722 * color[B];
}

/**
 * get the color contrast ratio (ranges from 1 to 21)
 */

export function contrast(a: Color, b: Color): number {
    const luma_a = luma(a) / 255;
    const luma_b = luma(b) / 255;

    return (Math.max(luma_a, luma_b) + 0.05) / (Math.min(luma_a, luma_b) + 0.05);
}

/**
 * get the color luminosity using the Y'UV model
 * Y′UV https://en.wikipedia.org/wiki/Y%E2%80%B2UV
 */

export function lumaYUV(color: Color): number {
    return 0.299 * color[R] + 0.587 * color[G] + 0.114 * color[B];
}

/**
 * checks if the color is dark (using Y'UV model)
 */

export function isDark(color: Color): boolean {
    return lumaYUV(color) < 128;
}

/**
 * checks if the color is light (using Y'UV model)
 */

export function isLight(color: Color): boolean {
    return lumaYUV(color) >= 128;
}

/**
 * convert the color to grayscale
 */

export function grayscale(color: Color): Color {
    const gray = lumaYUV(color);

    return new Color(
        gray,
        gray,
        gray,
        color[A]
    );
}

/**
 * mix two colors
 * @param rstren - 0 to 1
 */

export function mix(into: Color, from: Color, rstren = 0.5): Color {
    const lstren = 1 - rstren;

    return new Color(
        into[R] * lstren + from[R] * rstren,
        into[G] * lstren + from[G] * rstren,
        into[B] * lstren + from[B] * rstren,
        into[A] * lstren + from[A] * rstren,
    );
}

/**
 * fill the color transparency with a background color,
 * defaults to white
 */

export function fill(color: Color, background = new Color()): Color {
    if (color[A] === 255)
        return clone(color);

    const stren = 1 - color[A] / 255;

    color[A] = 255;

    return mix(color, background, stren);
}

/**
 * whiten the color
 * @param stren - 0 to 1
 */

export function whiten(color: Color, stren = 0.1): Color {
    return mix(color, new Color(), stren);
}

/**
 * blacken the color
 * @param stren - 0 to 1
 */

export function blacken(color: Color, stren = 0.1): Color {
    return mix(color, new Color(0, 0, 0), stren);
}

/**
 * set the color opacity
 * @param stren - 0 to 1
 */

export function opacity(color: Color, stren = 1): Color {
    return new Color(
        color[R],
        color[G],
        color[B],
        stren * 255
    );
}

/**
 * invert the color in RGB
 */

export function invert(color: Color): Color {
    return new Color(
        255 - color[R],
        255 - color[G],
        255 - color[B],
        color[A],
    );
}

/**
 * checks RGBA equality
 */

export function eq(a: Color, b: Color): boolean {
    return a[R] === b[R]
        && a[G] === b[G]
        && a[B] === b[B]
        && a[A] === b[A];
}

/**
 * parse a color string, only supports hex and rgba,
 * throws if invalid or unsupported
 */

export function fromString(color: string): Color {
    if (color.startsWith('#'))
        return fromHex(color);

    if (color.startsWith('rgb'))
        return fromRgb(color);

    throw new Error('Unsupported color string: ' + color);
}

/**
 * parse a hex color string,
 * throws if invalid
 */

export function fromHex(hex: string): Color {
    if (!/^#(([0-9a-f]{3,4})){1,2}$/i.test(hex))
        throw new Error('Invalid hex color: ' + hex);

    return hex.length < 6
        ? new Color(
            parseInt(hex[1] + hex[1], 16),
            parseInt(hex[2] + hex[2], 16),
            parseInt(hex[3] + hex[3], 16),
            hex.length === 5 ? parseInt(hex[4] + hex[4], 16) : 255
        )
        : new Color(
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16),
            hex.length === 9 ? parseInt(hex.slice(7, 9), 16) : 255
        );
}

/**
 * parse a rgba color string,
 * throws if invalid
 */

export function fromRgb(rgba: string): Color {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*(?:\.\d+)?)?\)/);

    if (!match)
        throw new Error('Invalid rgba color: ' + rgba);

    return new Color(
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        match[4] ? Math.round(parseFloat(match[4]) * 255) : 255
    );
}
