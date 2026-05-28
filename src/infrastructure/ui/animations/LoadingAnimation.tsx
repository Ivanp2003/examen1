import LottieView from 'lottie-react-native';
import { View } from 'react-native';

export const LoadingAnimation = () => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/loading.json')}
      autoPlay
      loop
      style={{ width: 120, height: 120 }}
    />
  </View>
);
