import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import RnSpeedTestProvider, {
  useRnSpeedTest,
  type RnSpeedTestConfig,
} from 'rn-speed-test';

const Example = ({ error }: { error: string }) => {
  const { networkSpeed, networkSpeedText } = useRnSpeedTest();

  return (
    <View style={styles.main}>
      <Text style={styles.text}>
        {error ? error : networkSpeed ? networkSpeedText : 'calculating...'}
      </Text>
    </View>
  );
};
export default function App() {
  const [error, setError] = React.useState('');
  const cfg: RnSpeedTestConfig = {
    token: 'YOUR_TOKEN_HERE',
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: 'MBps',
  };
  return (
    <RnSpeedTestProvider initialConfig={cfg} onError={setError}>
      <Example error={error} />
    </RnSpeedTestProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
});
