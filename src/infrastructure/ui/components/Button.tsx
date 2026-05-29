import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: '#F4A261',
    borderColor: '#F4A261',
  },
  buttonSecondary: {
    backgroundColor: '#6D597A',
    borderColor: '#6D597A',
  },
  buttonOutline: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#374151',
  },
  loading: {
    marginRight: 8,
  },
});

export const Button = ({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: any = [styles.button];
    
    if (disabled) {
      baseStyle.push({ opacity: 0.5 });
    }
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.buttonPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
    }
    return baseStyle;
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.buttonTextPrimary;
      case 'secondary':
        return styles.buttonTextSecondary;
      case 'outline':
        return styles.buttonTextOutline;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.85}
    >
      {loading && <ActivityIndicator color={variant === 'outline' ? '#F4A261' : '#FFFFFF'} style={styles.loading} />}
      <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
};
