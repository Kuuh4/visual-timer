import React from 'react';
import { Corner, CornerSlotProvider, DIAL_BOX_SIZE } from './cornerSlot';

const HorizontalLayout: React.FC<{
    className?: string;
    leftChildren: React.ReactNode;
    rightChildren: React.ReactNode;
}> = ({ leftChildren, rightChildren, className }) => {
    return (
        <div className={`flex h-full ${className || ''}`}>
            <div className="relative w-1/2">{leftChildren}</div>
            <div className="relative w-1/2">{rightChildren}</div>
        </div>
    );
};

const VerticalLayout: React.FC<{ className?: string; children: React.ReactNode }> = ({ children, className }) => {
    return <div className={`flex h-full flex-col ${className || ''}`}>{children}</div>;
};

/**
 * Square-viewport layout: the dial is centered and sized by the shorter side, which leaves the
 * four corners of the window free — a circle inscribed in a square never reaches them — so every
 * control sits in a corner instead of stealing height from the dial.
 *
 * In a window small enough for round buttons to reach into the dial, the slots go flush to the
 * corners and the controls take the wedge shape that follows the dial's edge (see `cornerSlot`).
 */
const CompactLayout: React.FC<{
    className?: string;
    isWedge: boolean;
    topLeft: React.ReactNode;
    topRight: React.ReactNode;
    bottomLeft: React.ReactNode;
    bottomRight: React.ReactNode;
    children: React.ReactNode;
}> = ({ isWedge, topLeft, topRight, bottomLeft, bottomRight, children, className }) => {
    // `inset-2` is the compact layout's gap (COMPACT_GAP_PX), the same one the dial keeps.
    const slots: { corner: Corner; position: string; children: React.ReactNode }[] = [
        { corner: 'top-left', position: 'left-2 top-2', children: topLeft },
        { corner: 'top-right', position: 'right-2 top-2', children: topRight },
        { corner: 'bottom-left', position: 'bottom-2 left-2', children: bottomLeft },
        { corner: 'bottom-right', position: 'bottom-2 right-2', children: bottomRight },
    ];

    return (
        <div className={`relative overflow-hidden ${className || ''}`}>
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Wider than the viewport on the short axis: only the SVG's empty corners spill out. */}
                <div className="relative shrink-0" style={{ width: DIAL_BOX_SIZE, height: DIAL_BOX_SIZE }}>
                    {children}
                </div>
            </div>
            {slots.map((slot) => (
                <div key={slot.corner} className={`absolute ${slot.position}`}>
                    <CornerSlotProvider value={{ corner: slot.corner, isWedge }}>{slot.children}</CornerSlotProvider>
                </div>
            ))}
        </div>
    );
};

const Layout = {
    Horizontal: HorizontalLayout,
    Vertical: VerticalLayout,
    Compact: CompactLayout,
};

export default Layout;
