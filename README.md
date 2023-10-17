# React Native Speed Test

react native network speed test package

## Installation

```sh
npm install rn-speed-test
```

## Usage

```ts
import { useState } from 'react';
import { View, Text } from 'react-native';
import RnSpeedTestProvider, { useRnSpeedTest, RnSpeedTestConfig,} from 'rn-speed-test';

const SomeComponent = ()=>{
  const { networkSpeed, networkSpeedText } = useRnSpeedTest();
  return(
    <View>
      <Text>{networkSpeed||'calculating'}</Text>
    </View>)
}

const App = ()=>{
  const [error,setError] = useState('');
  const config:RnSpeedTestConfig = {
    token: 'YOUR_TOKEN__HERE',
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: 'MBps',
  };
  return (
    <RnSpeedTestProvider initialConfig={config} onError={setError}>
      //  Rest of the app ...
    </RnSpeedTestProvider>
  )
}
export default App
```

<!-- ## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow. -->

## License

MIT

---
