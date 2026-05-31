import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../src/infrastructure/api/supabase';
import { oauthCallback } from '../../src/infrastructure/api/oauthCallback';
import tw from 'twrnc';

export default function AuthCallback() {
  const linkingUrl = Linking.useURL();

  useEffect(() => {
    // 🛠️ Forzar cierre de la pestaña de Chrome que quedó abierta
    WebBrowser.dismissBrowser();

    const createSessionFromUrl = async (urlStr: string) => {
      try {
        console.log("🔗 Analizando URL cruda en callback:", urlStr);

        // 🛠️ EXTRACCIÓN MANUAL QUIRÚRGICA: Supabase manda los datos en el fragmento '#'
        let accessToken = '';
        let refreshToken = '';

        // Buscamos el access_token en el string
        const accessMatch = urlStr.match(/access_token=([^&]+)/);
        if (accessMatch) accessToken = accessMatch[1];

        // Buscamos el refresh_token en el string
        const refreshMatch = urlStr.match(/refresh_token=([^&]+)/);
        if (refreshMatch) refreshToken = refreshMatch[1];

        if (accessToken && refreshToken) {
          console.log("🔑 Tokens detectados con éxito. Estableciendo sesión...");

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          console.log("✅ Sesión inyectada en Supabase correctamente.");
        } else {
          console.warn("⚠️ No se encontraron tokens de acceso en el hash de la URL.");
        }
      } catch (err) {
        console.error("❌ Error crítico en el proceso del callback:", err);
      }
    };

    // El Singleton es más confiable (lo seteamos desde login.tsx al recibir success de openAuthSessionAsync).
    // Linking.useURL() puede no incluir el fragmento en algunas plataformas.
    const urlDesdeSingleton = oauthCallback.getUrl();
    const urlToProcess = urlDesdeSingleton || linkingUrl;

    if (urlToProcess) {
      createSessionFromUrl(urlToProcess);
      // Limpiamos el singleton para que no repita el bucle en el próximo inicio
      if (urlDesdeSingleton) oauthCallback.clear();
    } else {
      console.log("⏳ Esperando URL de OAuth...");
    }
  }, [linkingUrl]);

  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <ActivityIndicator size="large" color="#FF6B6B" />
    </View>
  );
}
