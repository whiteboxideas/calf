// useMessageHandler.ts
import { useEffect } from 'react';

import {    postMessage } from "./vscodeUtils";
 
export const useMessageHandler = (setRootFile: Function, setSettings: Function, setTreeData: any) => {
    useEffect(() => {
        const handleMessage = (event) => {
            const message = event.data;
            switch (message.type) {
                // Listener to receive the tree data, update navbar and tree view
                case 'parsed-data': {
                    let data = [];
                    data.push(message.value);
                    setRootFile(message.value.fileName);
                    setSettings(message.settings);
                    setTreeData(data);
                    break;
                }
                // Listener to receive the user's settings
                case 'settings-data': {
                    setSettings(message.value);
                    break;
                }
            }
        };

        // Add event listener
        window.addEventListener('message', handleMessage);

        // Post message to the extension whenever sapling is opened
        postMessage({
            type: 'onCalfVisible',
            value: null,
        });

        // Post message to the extension for the user's settings whenever sapling is opened
        postMessage({
            type: 'onSettingsAcquire',
            value: null,
        });

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);
};
  