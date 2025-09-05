import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const useIsMobile = () => {
  return Capacitor.isNativePlatform();
};

export const usePlatformInfo = () => {
  const [platformInfo, setPlatformInfo] = useState({
    platform: 'web',
    isNative: false,
    isIOS: false,
    isAndroid: false
  });

  useEffect(() => {
    const getPlatformInfo = async () => {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        setPlatformInfo({
          platform: info.platform,
          isNative: true,
          isIOS: info.platform === 'ios',
          isAndroid: info.platform === 'android'
        });
      } else {
        setPlatformInfo({
          platform: 'web',
          isNative: false,
          isIOS: false,
          isAndroid: false
        });
      }
    };

    getPlatformInfo();
  }, []);

  return platformInfo;
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Network plugin for native platforms
      import('@capacitor/network').then(({ Network }) => {
        Network.addListener('networkStatusChange', status => {
          setIsOnline(status.connected);
        });

        Network.getStatus().then(status => {
          setIsOnline(status.connected);
        });
      });
    } else {
      // Use standard web APIs
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return isOnline;
};
