import WebApp from '@twa-dev/sdk';

export const initTelegramWebApp = () => {
  WebApp.ready();
  WebApp.expand();
  return WebApp;
};

export const getTelegramUser = () => {
  return WebApp.initDataUnsafe.user;
};

export const getTelegramInitData = () => {
  return WebApp.initData;
};

export const showMainButton = (text: string, onClick: () => void) => {
  WebApp.MainButton.setText(text);
  WebApp.MainButton.show();
  WebApp.MainButton.onClick(onClick);
};

export const hideMainButton = () => {
  WebApp.MainButton.hide();
};

export const showPopup = (message: string, callback?: () => void) => {
  WebApp.showPopup({ message }, callback);
};

export const closeMiniApp = () => {
  WebApp.close();
};