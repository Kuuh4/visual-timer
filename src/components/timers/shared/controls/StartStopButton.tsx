import React from 'react';
import { IoPause, IoPlay } from 'react-icons/io5';
import { Theme } from '../../../../store/types/theme';
import Button from '../../../common/Button';

type StartStopButtonProps = {
    isRunning: boolean;
    currentTheme: Theme;
    start: () => void;
    stop: () => void;
};

const StartStopButton: React.FC<StartStopButtonProps> = ({ isRunning, currentTheme, start, stop }) => {
    const handleStart = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (err) {
                console.debug('Notification permission request skipped:', err);
            }
        }
        start();
    };

    return (
        <Button
            onClick={isRunning ? stop : handleStart}
            aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
            currentTheme={currentTheme}
        >
            {isRunning ? <IoPause size={28} /> : <IoPlay size={28} className="ml-0.5" />}
        </Button>
    );
};

export default StartStopButton;
