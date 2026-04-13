import { ipcRenderer, contextBridge } from 'electron';

type IpcRendererListener = Parameters<typeof ipcRenderer.on>[1];

const ipcListenerMap = new Map<string, Map<IpcRendererListener, IpcRendererListener>>();

const getWrappedListener = (channel: string, listener: IpcRendererListener) => {
  const channelListeners = ipcListenerMap.get(channel);
  const wrappedListener = channelListeners?.get(listener);

  if (wrappedListener) {
    return wrappedListener;
  }

  const nextWrappedListener: IpcRendererListener = (event, ...args) => listener(event, ...args);
  const nextChannelListeners = channelListeners ?? new Map<IpcRendererListener, IpcRendererListener>();

  nextChannelListeners.set(listener, nextWrappedListener);

  if (!channelListeners) {
    ipcListenerMap.set(channel, nextChannelListeners);
  }

  return nextWrappedListener;
};

const removeWrappedListener = (channel: string, listener: IpcRendererListener) => {
  const channelListeners = ipcListenerMap.get(channel);

  if (!channelListeners) {
    return listener;
  }

  const wrappedListener = channelListeners.get(listener) ?? listener;

  channelListeners.delete(listener);

  if (channelListeners.size === 0) {
    ipcListenerMap.delete(channel);
  }

  return wrappedListener;
};

contextBridge.exposeInMainWorld('ipcRenderer', {
  // 메인 프로세스(Electron)에서 보낸 이벤트를 수신
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, getWrappedListener(channel, listener));
  },
  // 등록된 특정 이벤트 리스너를 해제
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, listener] = args;
    return ipcRenderer.off(channel, removeWrappedListener(channel, listener));
  },
  // 메인 프로세스(Electron)의 선언된 이벤트를 실행
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  // 메인 프로세스(Electron)에 요청을 보내고 처리 결과를 Promise로 응답받음 (async/await)
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  }
});
