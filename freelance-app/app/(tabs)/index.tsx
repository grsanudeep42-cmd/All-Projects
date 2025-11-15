import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Button, Platform, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';


export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuth(); // get logout method from context


  const clearStorage = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        console.log('Cleared accessToken and userId from localStorage');
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userId');
        console.log('Cleared accessToken and userId from SecureStore');
      }
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  };


  const handleLoginClick = async () => {
    await clearStorage();
    logout();  // **Update token state here**
    console.log('Navigating to login');
    router.replace('/(auth)/login');
  };


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home / Dashboard</Text>
      <Button title="Login" onPress={handleLoginClick} />
      <Button title="Jobs" onPress={() => router.push('/jobs')} />
      <Button 
        title="🧪 Test Reviews" 
        onPress={() => router.push('/(tabs)/job-reviews?jobId=1&revieweeId=7')} 
      />
    </View>
  );
}
