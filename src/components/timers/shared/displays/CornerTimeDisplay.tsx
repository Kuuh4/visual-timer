import React from 'react';
import { useCornerSlot, wedgeContentStyle, wedgeStyle } from '../../../common/cornerSlot';

type CornerTimeDisplayProps = {
    currentTime: string;
};

/**
 * The countdown as a corner control of the compact layout. It carries no background, so it only
 * borrows the wedge's geometry: the same cutout and the same content offset as the buttons, which
 * keeps it aligned with them and clear of the dial.
 */
const CornerTimeDisplay: React.FC<CornerTimeDisplayProps> = ({ currentTime }) => {
    const cornerSlot = useCornerSlot();

    if (cornerSlot?.isWedge) {
        return (
            <div style={wedgeStyle(cornerSlot.corner)}>
                <span className="whitespace-nowrap text-[5vmin] font-bold" style={wedgeContentStyle(cornerSlot.corner)}>
                    {currentTime}
                </span>
            </div>
        );
    }

    return <div className="whitespace-nowrap text-2xl font-bold">{currentTime}</div>;
};

export default CornerTimeDisplay;
