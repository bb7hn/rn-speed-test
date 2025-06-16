import React, {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const UNITS = {
  // rawSpeed is Bps
  Bps: '(rawSpeed) => rawSpeed',
  KBps: '(rawSpeed) => rawSpeed / 1000',
  MBps: '(rawSpeed) => rawSpeed / 1000000',
  GBps: '(rawSpeed) => rawSpeed / 1000000000',

  bps: '(rawSpeed) => rawSpeed * 8',
  Kbps: '(rawSpeed) => (rawSpeed * 8) / 1000',
  Mbps: '(rawSpeed) => (rawSpeed * 8) / 1000000',
  Gbps: '(rawSpeed) => (rawSpeed * 8) / 1000000000',
};
export type RnSpeedTestConfig = {
  token: string;
  timeout: number;
  https: boolean;
  urlCount: number;
  bufferSize: number;
  unit: keyof typeof UNITS;
};
interface RnSpeedTestInterface {
  networkSpeed: number | undefined;
  networkSpeedText: string;
  setConfig: Dispatch<SetStateAction<RnSpeedTestConfig>>;
}
const RnSpeedTest = React.createContext({} as RnSpeedTestInterface);
export default function RnSpeedTestProvider({
  children,
  initialConfig,
  onError,
}: {
  children: React.ReactNode;
  initialConfig: RnSpeedTestConfig;
  onError?: (e: string) => void;
}) {
  const [networkSpeed, setNetworkSpeed] = useState<number | undefined>(
    undefined
  );
  const [config, setConfig] = useState<RnSpeedTestConfig>(initialConfig);

  const networkSpeedText = `${networkSpeed || 'undefined'} ${config.unit}`;
  const webViewRef = useRef<WebView>(null);

  const source = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>WebView</title>
  </head>
  <body>
    <script type="module">
      import FastSpeedtest from 'https://cdn.jsdelivr.net/npm/fast-speedtest-api@0.3.2/+esm';

      try{
        const speedtest = new FastSpeedtest({
          token: "${config.token}",
          verbose:false,
          timeout: ${config.timeout},
          https: ${config.https},
          urlCount: ${config.urlCount},
          bufferSize: ${config.bufferSize},
          unit: ${(UNITS as any)[config.unit]},
        });

        window.test = ()=>{
          speedtest.getSpeed().then(s => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ speed: s.toFixed(2) }));
          })
        }
      } catch(e){
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
      }
    </script>
    </body>
    </html>
`;

  useEffect(() => {
    const checkAndRun = () => {
      if (webViewRef.current) {
        const run = `
          try{
            if (typeof window.test === 'function') {
              window.test()
            } else {
              setTimeout(() => {
                if (typeof window.test === 'function') {
                  window.test()
                } else {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ error: 'Speed test function not ready' }));
                }
              }, 2000);
            }
          } catch(e){
            window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message }));
          }
          `;
        webViewRef.current.injectJavaScript(run);
      }
    };

    setTimeout(checkAndRun, 2000);
  }, []);

  const values = {
    networkSpeed,
    networkSpeedText,
    setConfig,
  };

  return (
    <RnSpeedTest.Provider value={values}>
      <View style={styles.view}>
        <WebView
          source={{
            html: source,
          }}
          ref={webViewRef}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.speed) {
              setNetworkSpeed(data.speed);
            } else if (data.error) {
              if (onError) {
                onError(data.error);
              } else {
                throw data.error;
              }
            }
          }}
        />
      </View>
      {children}
    </RnSpeedTest.Provider>
  );
}

export const useRnSpeedTest = () => useContext(RnSpeedTest);

const styles = StyleSheet.create({
  view: {
    width: 0,
    height: 0,
    opacity: 0,
    display: 'none',
    pointerEvents: 'none',
  },
});
