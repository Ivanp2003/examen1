import LottieView from 'lottie-react-native';
import { View } from 'react-native';

interface PawAnimationProps {
  size?: number;
  loop?: boolean;
}

const PawAnimation: React.FC<PawAnimationProps> = ({ size = 120, loop = true }) => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/paw.json')}
      autoPlay
      loop={loop}
      style={{ width: size, height: size }}
    />
  </View>
);

export default PawAnimation;
