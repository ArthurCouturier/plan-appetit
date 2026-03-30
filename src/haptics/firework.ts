import { Haptics, ImpactStyle } from "@capacitor/haptics";
import PlatformService from "../api/services/PlatformService";

export async function fireworkHaptic() {
  if (!PlatformService.isNative()) return;

  const styles = [ImpactStyle.Light, ImpactStyle.Medium, ImpactStyle.Heavy];
  for (let i = 0; i < 12; i++) {
    await Haptics.impact({ style: styles[Math.floor(Math.random() * 3)] });
    await new Promise(r => setTimeout(r, 40 + Math.random() * 120));
  }
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 6; i++) {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(r => setTimeout(r, 60 + Math.random() * 80));
  }
}
