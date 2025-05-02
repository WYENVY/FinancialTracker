import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createMaterialTopTabNavigator();

function MainHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen</Text>
    </View>
  );
}

function HelloTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={MainHome} />
      <Tab.Screen name="Hello" component={HelloTab} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
  },
});
