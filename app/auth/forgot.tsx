import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SupabaseAuthRepository } from '../../src/infrastructure/repositories/SupabaseAuthRepository';

const authRepo = new SupabaseAuthRepository();

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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Recuperar contraseña', 'Ingresa tu correo');
      return;
    }
    setSending(true);
    try {
      // Redirige a la app para que el callback capture el evento PASSWORD_RECOVERY
      const redirectTo = 'petadopt://auth/callback';
      await authRepo.resetPassword(email.trim(), redirectTo);
      Alert.alert('Recuperar contraseña', 'Si el correo existe, recibirás un enlace para restablecerla.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo enviar el correo.');
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
