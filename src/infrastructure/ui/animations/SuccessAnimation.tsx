import LottieView from 'lottie-react-native';
import { View } from 'react-native';

const SuccessAnimation: React.FC = () => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/success.json')}
      autoPlay
      loop={false}
      style={{ width: 120, height: 120 }}
    />
  </View>
);

export default SuccessAnimation;
