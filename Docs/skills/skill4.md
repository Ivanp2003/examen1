4. TanStack Form Fields for React Native
Ensure forms utilize native event bindings (onChangeText instead of web onChange / value instead of checked):

TypeScript
// Pattern for TextInput using TanStack Form fields
<form.Field
  name="petName"
  children={(field) => (
    <TextInput
      value={field.state.value}
      onChangeText={(text) => field.handleChange(text)}
      className="p-4 bg-gray-100 rounded-xl"
    />
  )}
/>
5. Lottie View Implementation
To fulfill the 3-animation quota seamlessly:

TypeScript
import LottieView from 'lottie-react-native';

export const LoadingAnimation = () => (
  <LottieView
    source={require('../../../assets/animations/loading.json')}
    autoPlay
    loop
    style={{ width: 150, height: 150 }}
  />
);