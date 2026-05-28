import LottieView from 'lottie-react-native';
import { View } from 'react-native';

export const EmptyAnimation = () => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/empty.json')}
      autoPlay
      loop
      style={{ width: 150, height: 150 }}
    />
  </View>
);
