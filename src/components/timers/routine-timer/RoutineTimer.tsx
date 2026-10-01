import { useCallback, useEffect, useState } from 'react';
import { useBoolean } from 'usehooks-ts';
import { useAudio } from '../../../hooks/useAudio';
import { useTheme } from '../../../hooks/useTheme';
import { useTimerBase } from '../../../hooks/useTimer';
import { useSelectedTimerStore } from '../../../store/selectedTimerStore';
import { RoutineTimerData } from '../../../store/types/timer';
import { handleFinish } from '../../../utils/timerHandler';
import HomeButton from '../shared/controls/HomeButton';
import ListOrAddButton from '../shared/controls/ListOrAddButton';
import RepeatSwitch from '../shared/controls/RepeatSwitch';
import SettingsOrResetButton from '../shared/controls/SettingsOrResetButton';
import StartStopButton from '../shared/controls/StartStopButton';
import TimerDisplay from '../shared/displays/TimerDisplay';
import TimerContent, { TimerContentProps } from '../shared/TimerContent';
import TimerList from './TimerList';

const RoutineTimer: React.FC<{ timer: RoutineTimerData }> = ({ timer }) => {
    const { defaultTimer, selectDefaultTimer } = useSelectedTimerStore();
    const audio = useAudio();

    const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
    const { value: repeat, toggle: toggleRepeat } = useBoolean(false);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(() => {
        setCurrentItemIndex(0);
    }, [timer.id]);

    const { title, items } = timer;
    const currentItem = items[currentItemIndex];

    const { selectedThemeCopy } = useTheme(currentItem.pointColorIndex, currentItem.title);

    const moveToNextItem = useCallback(() => {
        const nextIndex = (currentItemIndex + 1) % items.length;
        const isFirstItemAfterComplete = nextIndex === 0;
        const shouldAutoStart = isFirstItemAfterComplete ? repeat : true;

        setCurrentItemIndex(nextIndex);
        setIsRunning(shouldAutoStart);
    }, [currentItemIndex, items.length, repeat, timer.id]);

    const onFinish = useCallback(
        (reset: () => void) => {
            handleFinish(currentItem, audio, selectedThemeCopy.color.point, () => {
                reset();
                moveToNextItem();
            });
        },
        [currentItem, audio, selectedThemeCopy, moveToNextItem]
    );

    const {
        progress,
        currentTime,
        isRunning: isItemRunning,
        isMinutes,
        isInitialized,
        start,
        stop,
        reset,
        add,
    } = useTimerBase({
        timer: currentItem,
        initialTime: currentItem.time,
        isMinutes: currentItem.isMinutes,
        onFinish,
        autoStart: isRunning,
    });

    const resetRoutine = () => {
        reset();
        setCurrentItemIndex(0);
        setIsRunning(false);
    };

    const handleItemChange = (index: number) => {
        reset();
        setCurrentItemIndex(index);
    };

    const content: TimerContentProps = {
        top: {
            leftChildren: <HomeButton isVisible={timer.id !== defaultTimer.id} onClick={selectDefaultTimer} />,
            rightChildren: <RepeatSwitch onClick={toggleRepeat} repeat={repeat} currentTheme={selectedThemeCopy} />,
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
                <StartStopButton isRunning={isItemRunning} currentTheme={selectedThemeCopy} start={start} stop={stop} />
            ),
            rightAction: (
                <SettingsOrResetButton
                    isInitialized={isInitialized}
                    currentTheme={selectedThemeCopy}
                    reset={resetRoutine}
                />
            ),
        },
        currentTime,
        timerInfo: (
            <>
                <div className="my-3 text-balance px-[5%] text-center text-2xl">{title}</div>
                <div className="w-full px-[5%]">
                    <TimerList
                        items={items}
                        currentItemIndex={currentItemIndex}
                        onChange={handleItemChange}
                        currentTime={currentTime}
                        currentTheme={selectedThemeCopy}
                    />
                </div>
            </>
        ),
        timer: <TimerDisplay progress={progress} currentTheme={selectedThemeCopy} text={selectedThemeCopy.text} />,
    };

    return <TimerContent {...content} />;
};

export default RoutineTimer;
