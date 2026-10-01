import React from 'react';
import { Theme } from '../../store/types/theme';
import { useCornerSlot, wedgeContentStyle, wedgeStyle } from './cornerSlot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    currentTheme?: Theme;
    visible?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    currentTheme,
    visible = true,
    children,
    onClick,
    className = '',
    type = 'button',
    style,
    disabled,
    ...props
}) => {
    const cornerSlot = useCornerSlot();
    const wedgeCorner = cornerSlot?.isWedge ? cornerSlot.corner : null;

    // A wedge is anchored to its corner, so the press-scale feedback of `btn-tactile` would pull it
    // away from the edge; it dims instead.
    const shapeClassName = wedgeCorner
        ? `${disabled ? '' : 'active:brightness-90'}`
        : `btn-tactile size-16 items-center justify-center rounded-full ${disabled ? '' : 'active:scale-95'}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`flex shrink-0 font-medium transition-all ${shapeClassName} ${
                visible ? 'visible' : 'invisible'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                currentTheme ? 'text-white shadow-soft' : ''
            } ${className}`}
            style={{
                ...(wedgeCorner ? wedgeStyle(wedgeCorner) : {}),
                ...(currentTheme ? { backgroundColor: currentTheme.color.point } : {}),
                ...style,
            }}
            {...props}
        >
            {wedgeCorner ? (
                <span className="flex items-center justify-center" style={wedgeContentStyle(wedgeCorner)}>
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
