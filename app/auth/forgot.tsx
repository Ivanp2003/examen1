import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/infrastructure/api/supabase';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  card: { margin: 24, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F3F5' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#6D597A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#6D597A', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F1F3F5', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: '#6D597A' },
  button: { marginTop: 16, paddingVertical: 14, backgroundColor: '#6D597A', borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  backLink: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#F4A261', fontWeight: '600' },
});

// ✅ SIEMPRE usar Vercel como intermediario (funciona en Expo Go Y en APK)
const RESET_REDIRECT_URL = 'https://pet-adopt-web-five.vercel.app/?type=recovery';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      return;
    }
    try {
      setSending(true);
      console.log('🔗 Enviando reset con redirect a Vercel:', RESET_REDIRECT_URL);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: RESET_REDIRECT_URL,
      });

      if (error) throw error;
      Alert.alert(
        'Correo enviado ✅',
        'Revisa tu bandeja de entrada. El enlace te llevará a una página web donde podrás cambiar tu contraseña.',
      );
      router.back();
    } catch (err: any) {
      console.error('❌ Error al enviar correo de recuperación:', err);
      Alert.alert('Error', err.message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Te enviaremos un enlace para restablecer tu contraseña.</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="tu@correo.com"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} disabled={sending} onPress={handleSend}>
          <Text style={styles.buttonText}>{sending ? 'Enviando...' : 'Enviar enlace'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
