import React from 'react';
import { IoAdd, IoList } from 'react-icons/io5';
import { Theme } from '../../../../store/types/theme';
import Button from '../../../common/Button';

type ListOrAddButtonProps = {
    isMinutes: boolean;
    isInitialized: boolean;
    currentTheme: Theme;
    add: (time: number) => void;
};

/** Opens the timer list while idle; once a countdown is under way it adds time instead. */
const ListOrAddButton: React.FC<ListOrAddButtonProps> = ({ isMinutes, isInitialized, currentTheme, add }) => {
    if (isInitialized) {
        return (
            <Button
                onClick={() => (window.location.hash = 'timer-list')}
                aria-label="Timer List"
                title="Timer Presets & Routines"
            >
                <IoList size={30} />
            </Button>
        );
    }

    return (
        <Button onClick={() => add(isMinutes ? 1 : 10)} aria-label="Add time" currentTheme={currentTheme}>
            <div className="flex items-center justify-center font-bold">
                <IoAdd size={20} />
                <span className="text-lg">{isMinutes ? 1 : 10}</span>
            </div>
        </Button>
    );
};

export default ListOrAddButton;
