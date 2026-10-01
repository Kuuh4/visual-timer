import React from 'react';
import { IoRefresh, IoSettingsSharp } from 'react-icons/io5';
import { Theme } from '../../../../store/types/theme';
import Button from '../../../common/Button';

type SettingsOrResetButtonProps = {
    isInitialized: boolean;
    currentTheme: Theme;
    reset: () => void;
};

/** Opens settings while idle; once a countdown is under way it resets the timer instead. */
const SettingsOrResetButton: React.FC<SettingsOrResetButtonProps> = ({ isInitialized, currentTheme, reset }) => {
    if (isInitialized) {
        return (
            <Button onClick={() => (window.location.hash = 'settings')} aria-label="Settings" title="Settings">
                <IoSettingsSharp size={30} />
            </Button>
        );
    }

    return (
        <Button onClick={reset} aria-label="Reset Timer" currentTheme={currentTheme}>
            <IoRefresh size={28} className="-scale-x-100" />
        </Button>
    );
};

export default SettingsOrResetButton;
