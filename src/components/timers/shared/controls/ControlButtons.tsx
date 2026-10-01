import React from 'react';

export type TimerControlNodes = {
    /** Timer list while idle, add-time while running. */
    leftAction: React.ReactNode;
    startStop: React.ReactNode;
    /** Settings while idle, reset while running. */
    rightAction: React.ReactNode;
};

/**
 * Single row used by the vertical and horizontal layouts. The compact layout spreads the very same
 * nodes across the window corners instead, so the buttons themselves live in their own components.
 */
const ControlButtons: React.FC<TimerControlNodes> = ({ leftAction, startStop, rightAction }) => {
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex min-w-[50px] items-center justify-start">{leftAction}</div>
            <div className="flex items-center justify-center">{startStop}</div>
            <div className="flex min-w-[50px] items-center justify-end">{rightAction}</div>
        </div>
    );
};

export default ControlButtons;
