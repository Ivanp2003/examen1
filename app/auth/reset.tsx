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
  input: { backgroundColor: '#F1F3F5', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: '#6D597A', marginBottom: 12 },
  button: { marginTop: 8, paddingVertical: 14, backgroundColor: '#6D597A', borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  backLink: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#F4A261', fontWeight: '600' },
});

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleReset = async () => {
    if (password.length < 8) {
      Alert.alert('Restablecer contraseña', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Restablecer contraseña', 'Las contraseñas no coinciden.');
      return;
    }
    setSaving(true);
    try {
      await authRepo.updatePassword(password);
      Alert.alert('Éxito', 'Tu contraseña ha sido actualizada. Inicia sesión con tu nueva contraseña.');
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Restablecer contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu nueva contraseña para continuar.</Text>
        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} disabled={saving} onPress={handleReset}>
          <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar nueva contraseña'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
