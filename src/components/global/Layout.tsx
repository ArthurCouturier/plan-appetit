import { Outlet, useLocation } from "react-router-dom";
import FooterMobile from "./FooterMobile";
import DarkModeButton from "../buttons/DarkModeButton";
import { useEffect, useState } from "react";
import HeaderMobile from "./HeaderMobile";

export default function Layout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'theme1');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme1', 'theme2');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const changeTheme = () => {
    setTheme(prev => (prev === 'theme1' ? 'theme2' : 'theme1'));
  };

  const hideFooterRoutes: string[] = [];
  const shouldShowFooter = isMobile && !hideFooterRoutes.includes(location.pathname);

  return (
    <div className={`w-full h-full ${theme}`}>
      {!isMobile && <DarkModeButton mode={theme} changeMode={changeTheme} />}
      {shouldShowFooter && <HeaderMobile />}
      <Outlet />
      {shouldShowFooter && <FooterMobile />}
    </div>
  );
}
