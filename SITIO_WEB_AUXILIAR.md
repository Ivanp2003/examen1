# Sitio Web Auxiliar para Vercel - Instrucciones de Despliegue

Este sitio web auxiliar es necesario para manejar las redirecciones de Supabase Auth (confirmación de email y recuperación de contraseña) que no funcionan directamente en apps móviles.

## 📋 Requisitos Previos

1. Tener Node.js instalado
2. Tener una cuenta en Vercel
3. Tener las credenciales de Supabase (URL y Anon Key)

## 🔧 Configuración del Sitio Web

### 1. Actualizar credenciales en `petadopt-web/script.js`

Antes de desplegar, abre el archivo `petadopt-web/script.js` y reemplaza:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Con tus credenciales reales de Supabase (disponibles en Supabase Dashboard → Project Settings → API).

## 🚀 Despliegue con Vercel CLI

### Paso 1: Instalar Vercel CLI globalmente

```bash
npm install -g vercel
```

### Paso 2: Iniciar sesión en Vercel

```bash
vercel login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Vercel.

### Paso 3: Desplegar el sitio web

Navega a la carpeta `petadopt-web`:

```bash
cd petadopt-web
```

Ejecuta el comando de despliegue:

```bash
vercel
```

Sigue las instrucciones en pantalla:
- **Set up and deploy?** → `Y`
- **Which scope?** → Selecciona tu cuenta de Vercel
- **Link to existing project?** → `N` (para crear uno nuevo)
- **What's your project's name?** → `petadopt-web` (o el nombre que prefieras)
- **In which directory is your code located?** → `./` (por defecto)
- **Want to override the settings?** → `N` (usar configuración por defecto)

Vercel desplegará el sitio y te proporcionará una URL como:
```
https://petadopt-web-xyz.vercel.app
```

### Paso 4: Despliegue a producción

Para hacer el despliegue permanente en producción:

```bash
vercel --prod
```

## ⚙️ Configuración en Supabase

### 1. Configurar Site URL

Ve a **Supabase Dashboard → Authentication → URL Configuration**:

**Site URL:**
```
https://petadopt-web-xyz.vercel.app
```
*(Reemplaza `petadopt-web-xyz.vercel.app` con tu URL real de Vercel)*

### 2. Configurar Redirect URLs

En la misma sección **Authentication → URL Configuration → Redirect URLs**, agrega:

```
https://petadopt-web-xyz.vercel.app/**
```

*(Reemplaza con tu URL real de Vercel)*

### 3. Configurar Email Templates (Opcional pero Recomendado)

Ve a **Supabase Dashboard → Authentication → Email Templates**:

**Confirm Signup:**
- Subject: Confirma tu cuenta en PetAdopt
- URL Template: `https://petadopt-web-xyz.vercel.app?type=signup&access_token={{ .AccessToken }}&refresh_token={{ .RefreshToken }}&type=signup`

**Reset Password:**
- Subject: Restablece tu contraseña de PetAdopt
- URL Template: `https://petadopt-web-xyz.vercel.app?type=recovery&access_token={{ .AccessToken }}&refresh_token={{ .RefreshToken }}&type=recovery`

## 🧪 Pruebas

### Prueba de Confirmación de Email
1. Regístrate un nuevo usuario en tu app móvil
2. Recibirás un email de confirmación
3. Haz clic en el enlace del email
4. Deberías ver la página de "¡Cuenta Confirmada!" en Vercel
5. Al hacer clic en "Abrir PetAdopt", la app móvil debería abrirse

### Prueba de Recuperación de Contraseña
1. En la app móvil, selecciona "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Recibirás un email de recuperación
4. Haz clic en el enlace del email
5. Deberías ver el formulario de restablecimiento en Vercel
6. Ingresa y confirma tu nueva contraseña
7. Al hacer clic en "Abrir PetAdopt", la app móvil debería abrirse

## 📝 Notas Importantes

- **Deep Linking:** El esquema `petadopt://` ya está configurado en `app.json` para Android e iOS
- **Expo Go:** Para que el deep linking funcione en Expo Go, necesitas configurar el scheme en tu dispositivo
- **Producción:** Para producción, se recomienda crear un dev build de Expo con tu scheme configurado
- **Seguridad:** Nunca expongas tu `service_role` key en el frontend. Solo usa la `anon` key

## 🔄 Actualizaciones Futuras

Si necesitas actualizar el sitio web:

1. Modifica los archivos en `petadopt-web/`
2. Ejecuta `vercel --prod` dentro de la carpeta
3. Vercel desplegará automáticamente los cambios

## 🆘 Solución de Problemas

### Error: "No se encontraron tokens de acceso"
- Verifica que las URLs en los email templates de Supabase incluyan `access_token` y `refresh_token`

### Error: "Tipo de acción no válido"
- Asegúrate de que el parámetro `type` en la URL sea `signup` o `recovery`

### Deep linking no funciona
- En Expo Go, verifica que el scheme `petadopt://` esté configurado
- Para producción, usa un dev build de Expo

### Error al actualizar contraseña
- Verifica que la sesión se haya establecido correctamente con los tokens de la URL
- Revisa la consola del navegador para errores de Supabase
