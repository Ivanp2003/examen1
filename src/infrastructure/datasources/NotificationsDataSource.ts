import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../api/supabase';

// Configuración básica de cómo se muestran las alertas cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationsDataSource {
  async registerPushToken(userId: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('⚠️ Las notificaciones push no están disponibles en la web');
      return;
    }

    try {
      // 1. Solicitar permisos al sistema operativo
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permiso de notificaciones denegado');
        return;
      }

      // 2. Obtener el token único provisto por Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '3f11369f-a7f8-4d98-80e2-1b70fc00be7f', // extra.eas.projectId de app.json
      });
      const token = tokenData.data;

      // 3. Guardarlo en el perfil del usuario en Supabase
      await supabase
        .from('usuarios')
        .update({ push_token: token })
        .eq('id', userId);

      console.log('✅ Token push registrado con éxito:', token);

      // Configuración obligatoria para canales de Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C63FF',
        });
      }
    } catch (error) {
      console.error('Error registrando notificaciones push:', error);
    }
  }
}
