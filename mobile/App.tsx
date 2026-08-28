import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/store/AppContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { SetPinScreen } from './src/screens/SetPinScreen';
import { CustomerMainScreen } from './src/screens/CustomerMainScreen';
import { VendorMainScreen } from './src/screens/VendorMainScreen';
import { DemoSplitScreen } from './src/screens/DemoSplitScreen';

const MainNavigator: React.FC = () => {
  const { currentRoute, navigateTo, isRegistered, role } = useApp();

  // Route selector
  switch (currentRoute) {
    case 'splash':
      return (
        <SplashScreen
          onFinish={() => {
            if (isRegistered) {
              navigateTo(role === 'vendor' ? 'vendor_main' : 'customer_main');
            } else {
              navigateTo('onboarding');
            }
          }}
        />
      );

    case 'onboarding':
      return (
        <OnboardingScreen
          onComplete={() => {
            navigateTo('register');
          }}
        />
      );

    case 'register':
      return <RegisterScreen />;

    case 'otp':
      return <OtpScreen />;

    case 'set_pin':
      return <SetPinScreen />;

    case 'customer_main':
    case 'student_main':
      return <CustomerMainScreen />;

    case 'vendor_main':
      return <VendorMainScreen />;

    case 'demo_split_screen':
      return <DemoSplitScreen />;

    default:
      return <CustomerMainScreen />;
  }
};

const RootAppContainer: React.FC = () => {
  const { colors } = useApp();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBarStyle} />
      <MainNavigator />
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RootAppContainer />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
