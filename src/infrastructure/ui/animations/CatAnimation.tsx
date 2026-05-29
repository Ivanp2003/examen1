import LottieView from 'lottie-react-native';
import { View } from 'react-native';

interface CatAnimationProps {
  size?: number;
  loop?: boolean;
}

const CatAnimation: React.FC<CatAnimationProps> = ({ size = 120, loop = true }) => (
  <View className="items-center justify-center">
    <LottieView
      source={require('../../../../assets/animations/cat.json')}
      autoPlay
      loop={loop}
      style={{ width: size, height: size }}
    />
  </View>
);

export default CatAnimation;
