import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useNotificationCounts } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { newApplicants, newResponses } = useNotificationCounts();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="GigsScreen"
        options={{
          title: 'Gigs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="briefcase.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"    // <--- was "InboxScreen", now matches your messages.tsx file!
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="t.bubble.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-job"
        options={{
          title: 'Post Job',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,

        }}
      />
      <Tabs.Screen
        name="my-applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane" color={color} />,
          tabBarBadge: newResponses || undefined,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
          tabBarBadge: newApplicants || undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
