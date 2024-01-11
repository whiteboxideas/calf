// LayoutSwitchButton.tsx
import * as React from 'react';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
 
interface LayoutSwitchButtonProps {
    vertical: boolean;
    onLayout: () => void;
    setVertical: (value: boolean) => void;
}

export const LayoutSwitchButton: React.FC<LayoutSwitchButtonProps> = ({ vertical, onLayout, setVertical }) => {
    return (
        vertical ?   
            <button type='button' className='customToolbarButton react-flow__controls-button react-flow__controls-interactive' onClick={() => {
                setVertical(!vertical)
                onLayout()
            }}>
                <SwapHorizRoundedIcon htmlColor='var(--vscode-foreground)' sx={{ fontSize: 35 }}  />
            </button>
            :
            <button type='button' className='customToolbarButton react-flow__controls-button react-flow__controls-interactive' onClick={() => {
                onLayout()
                setVertical(!vertical)
            }}>
                <SwapVertRoundedIcon htmlColor='var(--vscode-foreground)' sx={{ fontSize: 35 }}  />
            </button>
    );
};
 