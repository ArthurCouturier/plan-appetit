import { registerPlugin } from '@capacitor/core';

export interface SKAdNetworkPluginInterface {
    updateConversionValue(options: { value: number }): Promise<{ value: number }>;
}

const SKAdNetworkNative = registerPlugin<SKAdNetworkPluginInterface>('SKAdNetwork');

export default SKAdNetworkNative;
