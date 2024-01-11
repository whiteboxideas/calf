// ShowAllPropsButton.tsx
import * as  React from 'react';

import PIcon from '@mui/icons-material/LocalParking';
interface ShowAllPropsButtonProps {
    showAllProps: boolean;
    handleAllProps: (value: string) => void;
    setShowAllProps: (value: boolean) => void;
}

export const ShowAllPropsButton: React.FC<ShowAllPropsButtonProps> = ({ showAllProps, handleAllProps, setShowAllProps }) => {
    return (
        showAllProps ? 
            <button type='button' className='customToolbarButton2 customToolbarButton react-flow__controls-button react-flow__controls-interactive' onClick={() => {
                handleAllProps('none');
                setShowAllProps(!showAllProps);
            }}>
                <PIcon htmlColor='var(--vscode-settings-focusedRowBorder)' sx={{ fontSize: 25 }} />
            </button>
        :
        <button type='button' className='customToolbarButton2 customToolbarButton react-flow__controls-button react-flow__controls-interactive' onClick={() => {
            handleAllProps('block');
            setShowAllProps(!showAllProps);
        }}>
                <PIcon color='disabled' sx={{ fontSize: 25 }}  />
            </button>
    );
};
 