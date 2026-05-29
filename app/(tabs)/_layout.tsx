import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

const tabs = [
  { name: 'index', title: 'Inicio', icon: '🏠' },
  { name: 'explore', title: 'Explorar', icon: '🗺️' },
  { name: 'chat', title: 'Solicitudes', icon: '📋' },
  { name: 'profile', title: 'Perfil', icon: '👤' },
];

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 80,
    paddingBottom: 12,
    paddingTop: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(244, 162, 97, 0.15)',
  },
  icon: {
    fontSize: 20,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#F4A261',
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
              <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
                <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>{tab.icon}</Text>
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
