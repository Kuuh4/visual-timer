import { Theme } from '../../../../store/types/theme';
import Switch from '../../../common/Switch';

type UnitSwitchProps = {
    onClick: () => void;
    isMinutes: boolean;
    /** Only while the timer sits untouched: changing the unit mid-countdown would reset it. */
    isVisible: boolean;
    currentTheme: Theme;
};

const UnitSwitch: React.FC<UnitSwitchProps> = ({ onClick, isMinutes, isVisible, currentTheme }) => {
    return (
        <Switch
            options={[
                { value: 'seconds', label: 'sec' },
                { value: 'minutes', label: 'min' },
            ]}
            value={isMinutes ? 'minutes' : 'seconds'}
            onChange={() => onClick()}
            backgroundColor={currentTheme.color.point}
            isVisible={isVisible}
        />
    );
};

export default UnitSwitch;
