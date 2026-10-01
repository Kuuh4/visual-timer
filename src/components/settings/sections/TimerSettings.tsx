import CompactLayoutSelector from '../fields/CompactLayoutSelector';
import CompactTimeDisplaySelector from '../fields/CompactTimeDisplaySelector';
import DirectionSelector from '../fields/DirectionSelector';

const TimerSettings: React.FC = () => (
    <div className="space-y-8">
        <DirectionSelector />
        <CompactLayoutSelector />
        <CompactTimeDisplaySelector />
    </div>
);

export default TimerSettings;
