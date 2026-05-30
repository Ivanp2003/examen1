# DIRECTIVA CRÍTICA: ERRADICACIÓN TOTAL DE STYLESHEET

## 🚨 PROPÓSITO
Para cumplir con la rúbrica de puntos adicionales, queda **ESTRICTAMENTE PROHIBIDO** el uso de `StyleSheet.create` o la propiedad `style={styles...}` de React Native en TODO el espacio de trabajo. Todo el diseño del sistema debe ser sustituido por **NativeWind (Tailwind CSS)** mediante la propiedad `className`.

## 🤖 INSTRUCCIONES OBLIGATORIAS PARA LA IA
Debes escanear, refactorizar y reescribir los archivos del directorio `app/` removiendo el objeto de estilos tradicionales y traduciendo cada propiedad a clases de Tailwind.

### 1. IMPORTACIONES PROHIBIDAS
Cualquier archivo modificado NO debe importar `StyleSheet` desde 'react-native'.
* ❌ `import { View, Text, StyleSheet } from 'react-native';`
* `import { View, Text } from 'react-native';`

### 2. REFACTORIZACIÓN DE VISTAS (Conversión de Estilos Básicos)
* `style={styles.container}` (donde container tiene `flex: 1, backgroundColor: '#FFF7ED'`) ➡️ `className="flex-1 bg-[#FFF7ED]"`
* `style={styles.row}` (con `flexDirection: 'row', alignItems: 'center'`) ➡️ `className="flex-row items-center"`
* `style={styles.card}` (con `borderRadius: 12, padding: 16, margin: 8`) ➡️ `className="rounded-xl p-4 m-2"`
* `style={styles.title}` (con `fontSize: 24, fontWeight: 'bold', color: '#6D597A'`) ➡️ `className="text-2xl font-bold text-[#6D597A]"`

### 3. COMPONENTES CLAVE A REVISAR Y LIMPIAR:
* `app/(tabs)/index.tsx` (Catálogo principal + botones de Editar/Eliminar del CRUD)
* `app/(tabs)/chat.tsx` (Bandeja de solicitudes y botón de chat)
* `app/(tabs)/profile.tsx` (Pantalla de perfil del usuario)
* `app/(tabs)/explore.tsx` (Pantalla del mapa de refugios con expo-location)
* `app/create-pet.tsx` (Formulario de creación y edición)
* `app/login.tsx` y `app/register.tsx` (Pantallas de autenticación)
* `app/chat-room.tsx` (Sala de chat bidireccional en tiempo real)
* `app/pet/[id].tsx` y `app/adopt/[id].tsx` (Detalles de mascotas y formularios)

## 🎯 REGLA DE RETORNO
No alteres la lógica interna de Zustand, ni los useEffects de Supabase, ni los canales de Realtime. Modifica ÚNICAMENTE la capa de presentación reemplazando los contenedores y textos con sus equivalentes de NativeWind y borrando el bloque `const styles = StyleSheet.create({...})` del final de cada archivo.