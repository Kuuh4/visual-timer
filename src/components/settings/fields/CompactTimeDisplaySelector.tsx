import { IoMdTime } from 'react-icons/io';
import { CompactTimeDisplay, useSettingsStore } from '../../../store/settingsStore';
import { useThemeStore } from '../../../store/themeStore';
import Dropdown from '../../common/Dropdown';
import ListItem from '../../common/ListItem';

const CompactTimeDisplaySelector: React.FC = () => {
    const { selectedTheme } = useThemeStore();
    const { compactTimeDisplay, setCompactTimeDisplay } = useSettingsStore();

    const compactTimeDisplaySelector = (
        <div className="flex w-full flex-col gap-2">
            <div className="text-lg">Remaining time in compact layout</div>
            <Dropdown<CompactTimeDisplay>
                options={[
                    { label: 'Inside the dial', value: 'dial' },
                    { label: 'Top-right corner', value: 'corner', subLabel: 'the unit switch moves onto the dial' },
                    { label: 'Hide', value: 'hidden', subLabel: 'the dial alone shows progress' },
                ]}
                selectedValue={compactTimeDisplay}
                onChange={setCompactTimeDisplay}
                currentTheme={selectedTheme}
                buttonBorderColor={selectedTheme.color.point}
            />
        </div>
    );

    return <ListItem icon={<IoMdTime size={24} className="size-full" />} content={compactTimeDisplaySelector} />;
};

export default CompactTimeDisplaySelector;
