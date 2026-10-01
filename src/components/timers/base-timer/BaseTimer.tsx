import { useCallback, useEffect } from 'react';
import { useAudio } from '../../../hooks/useAudio';
import { useTheme } from '../../../hooks/useTheme';
import { useTimerBase } from '../../../hooks/useTimer';
import { useSelectedTimerStore } from '../../../store/selectedTimerStore';
import { BaseTimerData } from '../../../store/types/timer';
import { handleDragEvent, handleFinish } from '../../../utils/timerHandler';
import HomeButton from '../shared/controls/HomeButton';
import ListOrAddButton from '../shared/controls/ListOrAddButton';
import SettingsOrResetButton from '../shared/controls/SettingsOrResetButton';
import StartStopButton from '../shared/controls/StartStopButton';
import UnitSwitch from '../shared/controls/UnitSwitch';
import TimeDisplay from '../shared/displays/TimeDisplay';
import TimerDisplay from '../shared/displays/TimerDisplay';
import TimerContent, { TimerContentProps } from '../shared/TimerContent';

const BaseTimer: React.FC<{ timer: BaseTimerData }> = ({ timer }) => {
    const { defaultTimer, selectDefaultTimer, updateDefaultTimer } = useSelectedTimerStore();
    const audio = useAudio();

    const { time: storedTime, isMinutes: storedIsMinutes, pointColorIndex, title } = timer;

    const { selectedThemeCopy } = useTheme(pointColorIndex, title);

    const onFinish = useCallback(
        (reset: () => void) => {
            handleFinish(timer, audio, selectedThemeCopy.color.point, reset);
        },
        [timer, audio, selectedThemeCopy]
    );

    const {
        totalTime,
        progress,
        currentTime,
        isRunning,
        isMinutes,
        isInitialized,
        start,
        stop,
        reset,
        toggleUnit,
        setTime,
        add,
    } = useTimerBase({
        timer,
        initialTime: storedTime,
        isMinutes: storedIsMinutes,
        onFinish,
    });

    useEffect(() => {
        if (timer.id === defaultTimer.id) {
            updateDefaultTimer({ time: totalTime });
        }
    }, [totalTime, updateDefaultTimer]);

    useEffect(() => {
        if (timer.id === defaultTimer.id) {
            updateDefaultTimer({ isMinutes });
        }
    }, [isMinutes, updateDefaultTimer]);

    const handleDragOrClick = (e: React.MouseEvent | React.TouchEvent) => {
        if (timer.id === defaultTimer.id) {
            handleDragEvent(e, setTime);
        }
    };

    const content: TimerContentProps = {
        top: {
            leftChildren: <HomeButton isVisible={timer.id !== defaultTimer.id} onClick={selectDefaultTimer} />,
            rightChildren: (
                <UnitSwitch
                    onClick={toggleUnit}
                    isMinutes={isMinutes}
                    // Saved timers carry their own unit, so only the default timer may switch it —
                    // and only while idle: paused counts as started.
                    isVisible={timer.id === defaultTimer.id && isInitialized}
                    currentTheme={selectedThemeCopy}
                />
            ),
        },
        controls: {
            leftAction: (
                <ListOrAddButton
                    isMinutes={isMinutes}
                    isInitialized={isInitialized}
                    currentTheme={selectedThemeCopy}
                    add={add}
                />
            ),
            startStop: (
                <StartStopButton isRunning={isRunning} currentTheme={selectedThemeCopy} start={start} stop={stop} />
            ),
            rightAction: (
                <SettingsOrResetButton isInitialized={isInitialized} currentTheme={selectedThemeCopy} reset={reset} />
            ),
        },
        currentTime,
        timerInfo: <TimeDisplay currentTime={currentTime} className="my-3" />,
        timer: (
            <TimerDisplay
                progress={progress}
                currentTheme={selectedThemeCopy}
                handleDragEvent={handleDragOrClick}
                text={selectedThemeCopy.text}
            />
        ),
    };

    return <TimerContent {...content} />;
};

export default BaseTimer;
