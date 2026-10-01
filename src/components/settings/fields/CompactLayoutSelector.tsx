import { MdAspectRatio } from 'react-icons/md';
import { useSettingsStore } from '../../../store/settingsStore';
import { useThemeStore } from '../../../store/themeStore';
import Dropdown from '../../common/Dropdown';
import ListItem from '../../common/ListItem';

const CompactLayoutSelector: React.FC = () => {
    const { selectedTheme } = useThemeStore();
    const { compactOnlyOnSmallViewports, setCompactOnlyOnSmallViewports } = useSettingsStore();

    const compactLayoutSelector = (
        <div className="flex w-full flex-col gap-2">
            <div className="text-lg">Compact layout</div>
            <Dropdown
                options={[
                    { label: 'Every square window', value: false },
                    { label: 'Only small windows', value: true, subLabel: 'large squares keep the normal layout' },
                ]}
                selectedValue={compactOnlyOnSmallViewports}
                onChange={setCompactOnlyOnSmallViewports}
                currentTheme={selectedTheme}
                buttonBorderColor={selectedTheme.color.point}
            />
        </div>
    );

    return <ListItem icon={<MdAspectRatio size={24} className="size-full" />} content={compactLayoutSelector} />;
};

export default CompactLayoutSelector;
