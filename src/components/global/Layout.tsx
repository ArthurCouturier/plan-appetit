import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DarkModeButton from "../buttons/DarkModeButton";
import { useEffect, useState } from "react";
import HeaderMobile from "./HeaderMobile";
import PlatformService from "../../api/services/PlatformService";
import { TrackingService } from "../../api/tracking/TrackingService";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import DailyRecipeModal from "../popups/DailyRecipeModal";
import { useDailyRecipeContext } from "../../contexts/DailyRecipeContext";

export default function Layout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'theme1');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { showDailyRecipeModal, setShowDailyRecipeModal } = useDailyRecipeContext();

  // Initialise la plateforme, le StatusBar pour Android, le tracking et le deep linking
  useEffect(() => {
    PlatformService.setPlatformClass();
    PlatformService.initializeStatusBar();
    PlatformService.onDeepLink(navigate);
    TrackingService.initialize();

    // Listener pour les taps sur notifications (native uniquement)
    if (Capacitor.isNativePlatform()) {
      FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
        const data = event.notification?.data as Record<string, string> | undefined;
        const type = data?.type;
        if (type === "daily_recipe") {
          setShowDailyRecipeModal(true);
        }
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        FirebaseMessaging.removeAllListeners();
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme1', 'theme2');
    document.documentElement.classList.add(theme);
    document.body.classList.remove('theme1', 'theme2');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top + PageView tracking on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    TrackingService.trackPageView();
  }, [location.pathname]);

  const changeTheme = () => {
    setTheme(prev => (prev === 'theme1' ? 'theme2' : 'theme1'));
  };

  return (
    <div className={`w-full min-h-screen min-h-dvh bg-bg-color ${theme}`}>
      {!isMobile && <DarkModeButton mode={theme} changeMode={changeTheme} />}
      {isMobile && <HeaderMobile />}
      <Outlet />

      <DailyRecipeModal
        isOpen={showDailyRecipeModal}
        onClose={() => setShowDailyRecipeModal(false)}
      />
    </div>
  );
}
