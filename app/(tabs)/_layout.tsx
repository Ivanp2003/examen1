import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

const tabs = [
  { name: 'index', title: 'Inicio', icon: '🏠' },
  { name: 'explore', title: 'Explorar', icon: '🗺️' },
  { name: 'chat', title: 'Solicitudes', icon: '📋' },
  { name: 'profile', title: 'Perfil', icon: '👤' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarShowLabel: true,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <View className={`w-10 h-10 items-center justify-center rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
                <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{tab.icon}</Text>
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
