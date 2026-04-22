import { registerPlugin } from '@capacitor/core';

export interface WatchBridgePlugin {
    setCurrentRecipe(options: { name: string; imageBase64: string }): Promise<void>;
    clearCurrentRecipe(): Promise<void>;
    ping(): Promise<{ ok: boolean }>;
}

export const WatchBridge = registerPlugin<WatchBridgePlugin>('WatchBridge');
