import LottieView from 'lottie-react-native';
import { View } from 'react-native';

const LoadingAnimation: React.FC = () => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/loading.json')}
      autoPlay
      loop
      style={{ width: 120, height: 120 }}
    />
  </View>
);

export default LoadingAnimation;
