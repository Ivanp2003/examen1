import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../src/infrastructure/api/supabase';
import { router } from 'expo-router';
import '../global.css';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  useEffect(() => {
    const handleOAuthCallback = async (url: string) => {
      if (url.includes('access_token') || url.includes('error_code') || url.includes('code')) {
        // Supabase automatically handles the session from the URL
        // Just check if we have a session now
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('OAuth session established');
          // Navigate to tabs after successful OAuth
          router.replace('/(tabs)');
        }
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleOAuthCallback(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleOAuthCallback(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pet/[id]" />
        <Stack.Screen name="create-pet" />
        <Stack.Screen name="ai-chat" />
        <Stack.Screen name="adopt/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
