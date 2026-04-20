import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HeaderMobile from "./HeaderMobile";
import { Browser } from "@capacitor/browser";
import PlatformService from "../../api/services/PlatformService";
import AppVersionService, { VersionCheckResult } from "../../api/services/AppVersionService";
import { TrackingService } from "../../api/tracking/TrackingService";
import { SKAdNetworkService } from "../../api/tracking/skadnetwork/SKAdNetworkService";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import DailyRecipeModal from "../modals/DailyRecipeModal";
import UpdateAppModal from "../modals/UpdateAppModal";
import { useDailyRecipeContext } from "../../contexts/DailyRecipeContext";
import PersistentCollectionDetail from "../collections/PersistentCollectionDetail";

export default function Layout() {
  const theme = localStorage.getItem('theme') || 'theme1';
  const location = useLocation();
  const navigate = useNavigate();
  const { showDailyRecipeModal, setShowDailyRecipeModal } = useDailyRecipeContext();
  const [versionCheck, setVersionCheck] = useState<VersionCheckResult | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Initialise la plateforme, le StatusBar pour Android, le tracking et le deep linking
  useEffect(() => {
    PlatformService.setPlatformClass();
    PlatformService.initializeStatusBar();
    PlatformService.onDeepLink(navigate);
    TrackingService.initialize();
    SKAdNetworkService.syncFromBackend();

    if (!sessionStorage.getItem("version_check_done")) {
      AppVersionService.checkVersion().then((result) => {
        sessionStorage.setItem("version_check_done", "1");
        if (result && result.status !== "up_to_date") {
          setVersionCheck(result);
          setShowUpdateModal(true);
        }
      });
    }

    // Listener pour les taps sur notifications (native uniquement)
    if (Capacitor.isNativePlatform()) {
      FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
        const data = event.notification?.data as Record<string, string> | undefined;
        const type = data?.type;
        if (type === "daily_recipe") {
          setShowDailyRecipeModal(true);
        } else if (type === "broadcast") {
          const platform = Capacitor.getPlatform();
          const storeUrl = platform === "ios" ? data?.iosUrl : data?.androidUrl;
          if (storeUrl) {
            Browser.open({ url: storeUrl });
          } else if (data?.actionUrl) {
            navigate(data.actionUrl);
          }
        }
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        FirebaseMessaging.removeAllListeners();
      }
    };
  }, []);

  // Apply theme classes on mount
  useEffect(() => {
    document.documentElement.classList.remove('theme1', 'theme2');
    document.documentElement.classList.add(theme);
    document.body.classList.remove('theme1', 'theme2');
    document.body.classList.add(theme);
  }, [theme]);

  const isCollectionRoute = /^\/collections\/[a-f0-9-]+$/i.test(location.pathname);

  // Scroll to top + PageView tracking on route change (skip collection routes, handled by PersistentCollectionDetail)
  useEffect(() => {
    if (!isCollectionRoute) {
      window.scrollTo(0, 0);
    }
    TrackingService.trackPageView();
  }, [location.pathname, isCollectionRoute]);

  return (
    <div className={`w-full min-h-screen min-h-dvh bg-bg-color ${theme}`}>
      <HeaderMobile />
      <PersistentCollectionDetail />
      {!isCollectionRoute && <Outlet />}

      <DailyRecipeModal
        isOpen={showDailyRecipeModal}
        onClose={() => setShowDailyRecipeModal(false)}
      />

      {versionCheck && (
        <UpdateAppModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          status={versionCheck.status}
          latestVersion={versionCheck.latestVersion}
          storeUrl={versionCheck.storeUrl}
        />
      )}
    </div>
  );
}
