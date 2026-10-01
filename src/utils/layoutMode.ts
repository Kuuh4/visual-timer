export type LayoutMode = 'compact' | 'horizontal' | 'vertical';

/** Aspect ratios inside this range are square enough for the dial to own the whole viewport. */
export const SQUARE_ASPECT_RATIO = { min: 0.8, max: 1.25 };

/** A viewport whose shorter side is at or below this is treated as a small window. */
export const SMALL_VIEWPORT_MAX_SIDE = 480;

/**
 * Slightly above an eighth of a 1920px screen. A side this narrow cannot host the stacked or
 * side-by-side layouts at all, so the compact layout takes over whatever the proportion is. Width
 * and height are checked independently: either one being this short is enough.
 */
export const TINY_VIEWPORT_MAX_SIDE = 256;

/**
 * The single gap of the compact layout, in CSS pixels: dial to window, control to window, and dial
 * to control all keep this distance. `inset-2` in Tailwind is exactly this.
 */
export const COMPACT_GAP_PX = 8;

/**
 * Share of its box where the dial SVG actually paints its edge: `baseRadius` 45 plus the 1-unit
 * half-stroke, over a 50-unit half-viewBox. The box is scaled up by the inverse of this so that the
 * painted edge, not the empty SVG corner, is what the gap applies to.
 */
export const DIAL_EDGE_RATIO = 0.92;

/** Size of a round corner control, in CSS pixels: `Button` is `size-16`. */
export const CORNER_BUTTON_SIZE = 64;

type ViewportSize = {
    width: number;
    height: number;
};

export const isSquarishViewport = (aspectRatio: number) =>
    aspectRatio >= SQUARE_ASPECT_RATIO.min && aspectRatio <= SQUARE_ASPECT_RATIO.max;

export const isSmallViewport = (minSide: number) => minSide <= SMALL_VIEWPORT_MAX_SIDE;

export const isTinyViewport = ({ width, height }: ViewportSize) =>
    width <= TINY_VIEWPORT_MAX_SIDE || height <= TINY_VIEWPORT_MAX_SIDE;

type LayoutModeInput = ViewportSize & {
    /** When true, a square viewport only switches to the compact layout while it is also small. */
    compactOnlyOnSmallViewports: boolean;
};

/**
 * The compact layout maximizes the dial and moves every control to a corner, so it only makes
 * sense when the viewport is roughly square — or so cramped that nothing else fits. Width still
 * decides between the two other layouts.
 */
export const getLayoutMode = ({ width, height, compactOnlyOnSmallViewports }: LayoutModeInput): LayoutMode => {
    if (isTinyViewport({ width, height })) return 'compact';

    const aspectRatio = width / height;
    const isCompact =
        isSquarishViewport(aspectRatio) && (!compactOnlyOnSmallViewports || isSmallViewport(Math.min(width, height)));
    if (isCompact) return 'compact';

    return aspectRatio > 1 ? 'horizontal' : 'vertical';
};

/**
 * A round corner button reaches into the dial once its inner corner falls inside the dial's edge
 * plus the gap it should keep from it. From there the controls have to become corner wedges that
 * follow the dial's edge instead. The dial's painted edge is one gap from the window, so the
 * distance a control has to clear is simply half the shorter side.
 */
export const shouldUseWedgeCorners = ({ width, height }: ViewportSize) => {
    const inset = COMPACT_GAP_PX + CORNER_BUTTON_SIZE;
    const innerCornerDistance = Math.hypot(width / 2 - inset, height / 2 - inset);

    return innerCornerDistance < Math.min(width, height) / 2;
};
