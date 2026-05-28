import LottieView from 'lottie-react-native';
import { View } from 'react-native';

export const SuccessAnimation = () => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/success.json')}
      autoPlay
      loop={false}
      style={{ width: 120, height: 120 }}
    />
  </View>
);
