import { createContext, CSSProperties, useContext } from 'react';
import { COMPACT_GAP_PX, DIAL_EDGE_RATIO } from '../../utils/layoutMode';

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type CornerSlot = {
    corner: Corner;
    /** True once the control has to hug the dial instead of sitting beside it as a round button. */
    isWedge: boolean;
};

const CornerSlotContext = createContext<CornerSlot | null>(null);

export const CornerSlotProvider = CornerSlotContext.Provider;

/** Non-null only for controls rendered in a corner of the compact layout. */
export const useCornerSlot = () => useContext(CornerSlotContext);

const GAP = `${COMPACT_GAP_PX}px`;

/**
 * Box of the dial, oversized by the inverse of `DIAL_EDGE_RATIO` so that the circle it paints —
 * rather than the empty corners of the SVG — ends one gap away from the window.
 */
export const DIAL_BOX_SIZE = `calc((100vmin - ${2 * COMPACT_GAP_PX}px) / ${DIAL_EDGE_RATIO})`;

/**
 * Side of the square each corner control is cut from. Bounded by the icon: it sits a third of this
 * in from both near edges, and has to stay clear of the cutout even in the smallest compact window.
 */
const WEDGE_SIZE = '27vmin';

/**
 * Radius of the circle subtracted from that square. The dial's painted edge is `50vmin - GAP` from
 * the viewport center and the control keeps one more gap from it, which cancels out to `50vmin`.
 */
const CUTOUT_RADIUS = '50vmin';

const isLeft = (corner: Corner) => corner === 'top-left' || corner === 'bottom-left';
const isTop = (corner: Corner) => corner === 'top-left' || corner === 'top-right';

/**
 * Rounded square anchored to a window corner with the dial subtracted from it, so its inner edge is
 * the dial's own arc. The cutout is positioned in viewport units because the compact dial is always
 * centered in the viewport — each corner can locate the circle without measuring anything.
 */
export const wedgeStyle = (corner: Corner): CSSProperties => {
    const centerX = isLeft(corner) ? `calc(50vw - ${GAP})` : `calc(100% - 50vw + ${GAP})`;
    const centerY = isTop(corner) ? `calc(50vh - ${GAP})` : `calc(100% - 50vh + ${GAP})`;
    const mask = `radial-gradient(circle ${CUTOUT_RADIUS} at ${centerX} ${centerY}, transparent calc(100% - 1px), #000 100%)`;

    return {
        position: 'relative',
        width: WEDGE_SIZE,
        height: WEDGE_SIZE,
        borderRadius: `calc(${WEDGE_SIZE} / 7)`,
        WebkitMaskImage: mask,
        maskImage: mask,
    };
};

/** Centers the control's content a third of the square in from each of its two nearest edges. */
export const wedgeContentStyle = (corner: Corner): CSSProperties => {
    const near = `calc(${WEDGE_SIZE} / 3)`;
    const far = `calc(${WEDGE_SIZE} * 2 / 3)`;

    return {
        position: 'absolute',
        left: isLeft(corner) ? near : far,
        top: isTop(corner) ? near : far,
        transform: 'translate(-50%, -50%)',
    };
};
