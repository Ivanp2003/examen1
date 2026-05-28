import { TextInput, Text, View } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, error, multiline, keyboardType, autoCapitalize }: InputProps) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-text mb-2">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholderTextColor="#94A3B8"
      className={`p-4 bg-gray-50 border rounded-xl text-text ${error ? 'border-error' : 'border-gray-200'} ${multiline ? 'min-h-[100px]' : ''}`}
    />
    {error && <Text className="text-error text-xs mt-1">{error}</Text>}
  </View>
);
