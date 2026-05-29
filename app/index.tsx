import { Redirect } from 'expo-router';

console.log('index cargando con Redirect...');

export default function Index() {
  return <Redirect href="/login" />;
}
