import { ReactNode } from 'react';
import { useCornerSlot, wedgeContentStyle, wedgeStyle } from './cornerSlot';

type SwitchOption = {
    value: string;
    label: string | ReactNode;
};

type SwitchProps = {
    options: [SwitchOption, SwitchOption];
    value: string;
    onChange: (value: string) => void;
    backgroundColor: string;
    isVisible?: boolean;
};

const Switch: React.FC<SwitchProps> = ({ options, value, onChange, backgroundColor, isVisible = true }) => {
    const isFirstSelected = value === options[0].value;
    const cornerSlot = useCornerSlot();

    const toggle = () => onChange(isFirstSelected ? options[1].value : options[0].value);

    // There is no room for the sliding track in a corner wedge, so it collapses into the current
    // option alone — tapping it still toggles.
    if (cornerSlot?.isWedge) {
        return (
            <button
                onClick={toggle}
                className={`flex text-xl font-bold text-white transition-all active:brightness-90 ${
                    isVisible ? 'visible' : 'invisible'
                }`}
                style={{ ...wedgeStyle(cornerSlot.corner), backgroundColor }}
            >
                <span className="flex items-center justify-center" style={wedgeContentStyle(cornerSlot.corner)}>
                    {(isFirstSelected ? options[0] : options[1]).label}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            className={`relative flex h-10 w-24 items-center justify-center rounded-full p-1 text-white active:brightness-90 ${
                isVisible ? 'visible' : 'invisible'
            }`}
            style={{ backgroundColor }}
        >
            <div
                className={`absolute left-1 h-8 w-11 rounded-full bg-white/20 transition-transform duration-200 ${
                    !isFirstSelected ? 'translate-x-11' : 'translate-x-0'
                }`}
            />
            <span
                className={`z-10 flex w-1/2 items-center justify-center text-center text-xl transition-[font-weight] duration-200 ${
                    isFirstSelected ? 'font-bold' : 'font-normal'
                }`}
            >
                {options[0].label}
            </span>
            <span
                className={`z-10 flex w-1/2 items-center justify-center text-center text-xl transition-[font-weight] duration-200 ${
                    !isFirstSelected ? 'font-bold' : 'font-normal'
                }`}
            >
                {options[1].label}
            </span>
        </button>
    );
};

export default Switch;
