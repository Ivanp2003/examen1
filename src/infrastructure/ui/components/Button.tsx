import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

const variants = {
  primary: 'bg-primary border-primary',
  secondary: 'bg-secondary border-secondary',
  outline: 'bg-transparent border-primary',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary',
};

export const Button = ({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    className={`py-4 px-6 rounded-2xl border items-center justify-center flex-row ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
  >
    {loading && <ActivityIndicator color="white" className="mr-2" />}
    <Text className={`font-semibold text-base ${textVariants[variant]}`}>{title}</Text>
  </TouchableOpacity>
);
