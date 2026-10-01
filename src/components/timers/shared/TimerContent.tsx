import React from 'react';
import { useViewportMetrics } from '../../../hooks/useViewportMetrics';
import { useSettingsStore } from '../../../store/settingsStore';
import { getLayoutMode, shouldUseWedgeCorners } from '../../../utils/layoutMode';
import Layout from '../../common/Layout';
import ControlButtons, { TimerControlNodes } from './controls/ControlButtons';
import CornerTimeDisplay from './displays/CornerTimeDisplay';

export type TimerContentProps = {
    top: {
        leftChildren: React.ReactNode;
        rightChildren: React.ReactNode;
    };
    controls: TimerControlNodes;
    timerInfo: React.ReactNode;
    timer: React.ReactNode;
    /** mm:ss, overlaid inside the dial by the compact layout. */
    currentTime: string;
};

const TimerContent: React.FC<TimerContentProps> = ({ top, controls, timerInfo, timer, currentTime }) => {
    const { width, height } = useViewportMetrics();
    const { compactOnlyOnSmallViewports, compactTimeDisplay } = useSettingsStore();
    const layoutMode = getLayoutMode({ width, height, compactOnlyOnSmallViewports });

    const content = {
        top: (
            <div className="mt-[5%] flex items-center justify-between px-[5%]">
                {top.leftChildren}
                {top.rightChildren}
            </div>
        ),
        bottom: (
            <div className="mb-[5%] w-full self-center px-[5%]">
                <ControlButtons {...controls} />
            </div>
        ),
        timerInfo: <div className="mt-[5%] flex flex-col items-center justify-center">{timerInfo}</div>,
        timer,
    };

    if (layoutMode === 'compact') {
        return (
            <Layout.Compact
                className="h-screen w-screen"
                isWedge={shouldUseWedgeCorners({ width, height })}
                topLeft={controls.startStop}
                topRight={
                    compactTimeDisplay === 'corner' ? (
                        <CornerTimeDisplay currentTime={currentTime} />
                    ) : (
                        top.rightChildren
                    )
                }
                // Mirrored relative to the control row: reset on the left, add-time on the right.
                bottomLeft={controls.rightAction}
                bottomRight={controls.leftAction}
            >
                {content.timer}
                {compactTimeDisplay === 'dial' && (
                    <div className="pointer-events-none absolute inset-x-0 top-[22%] text-center text-[7vmin] font-bold text-black/60">
                        {currentTime}
                    </div>
                )}
                {/* With the countdown in the corner, the switch takes the spot it left on the dial —
                    it is only ever visible while the timer sits idle. */}
                {compactTimeDisplay === 'corner' && (
                    <div className="absolute inset-x-0 top-[22%] flex justify-center">{top.rightChildren}</div>
                )}
            </Layout.Compact>
        );
    }

    return layoutMode === 'horizontal' ? (
        <Layout.Horizontal
            className="h-screen w-screen"
            leftChildren={content.timer}
            rightChildren={
                <div className="flex size-full flex-col justify-between">
                    {content.top}
                    {content.timerInfo}
                    {content.bottom}
                </div>
            }
        />
    ) : (
        <Layout.Vertical className="h-screen w-screen">
            <div className="flex size-full flex-col justify-between">
                {content.top}
                {content.timerInfo}
                <div className="flex grow items-center justify-center">{content.timer}</div>
                {content.bottom}
            </div>
        </Layout.Vertical>
    );
};

export default TimerContent;
