// useMessageHandler.ts
import { useEffect, useState } from 'react';

import {    postMessage } from "./vscodeUtils";
 
export const useMessageHandler = ( ) => {
    const [treeData, setTreeData]: any = useState();
    const [settings, setSettings]: [{ [key: string]: boolean }, Function] = useState();
    const [rootFile, setRootFile]: [string | undefined, Function] = useState();
  
    useEffect(() => {
        const handleMessage = (event) => {
            const message = event.data;
            switch (message.type) {
                // Listener to receive the tree data, update navbar and tree view
                case 'parsed-data': {
                    console.log('useMessageHandler.ts-17: ',message.value);  
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

    return { treeData, settings, rootFile };
};
  