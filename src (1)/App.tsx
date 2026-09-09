import { AppProvider, useApp } from './context';
import Layout from './components/Layout';
import { OfflineBanner, ToastContainer } from './components/ui';
import LanguageScreen from './screens/LanguageScreen';
import AuthScreen from './screens/AuthScreen';
import FarmProfileScreen from './screens/FarmProfileScreen';
import HomeScreen from './screens/HomeScreen';
import EstimatorScreen from './screens/EstimatorScreen';
import SmartSellScreen from './screens/SmartSellScreen';
import AmenitiesScreen from './screens/AmenitiesScreen';
import LedgerScreen from './screens/LedgerScreen';
import AlertsScreen from './screens/AlertsScreen';
import SchemesScreen from './screens/SchemesScreen';
import ProfileScreen from './screens/ProfileScreen';
import DiseaseScreen from './screens/DiseaseScreen';
import ProviderScreen from './screens/ProviderScreen';

function AppRouter() {
  const { currentScreen, isAuthenticated, toasts, isOnline, t } = useApp();

  // Pre-auth screens (no layout)
  if (!isAuthenticated) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        {!isOnline && <OfflineBanner message={t('common.offline')} />}
        {currentScreen === 'language' && <LanguageScreen />}
        {currentScreen === 'auth' && <AuthScreen />}
        {currentScreen === 'farm-profile' && <FarmProfileScreen />}
        {!['language', 'auth', 'farm-profile'].includes(currentScreen) && <AuthScreen />}
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  const screenMap: Record<string, React.ReactNode> = {
    home: <HomeScreen />,
    estimator: <EstimatorScreen />,
    'smart-sell': <SmartSellScreen />,
    amenities: <AmenitiesScreen />,
    ledger: <LedgerScreen />,
    alerts: <AlertsScreen />,
    schemes: <SchemesScreen />,
    loans: <SchemesScreen />,
    disease: <DiseaseScreen />,
    'farm-profile': <FarmProfileScreen />,
    profile: <ProfileScreen />,
    provider: <ProviderScreen />,
  };

  return (
    <div className="h-full">
      {!isOnline && <OfflineBanner message={t('common.offline')} />}
      <Layout>
        {screenMap[currentScreen] ?? <HomeScreen />}
      </Layout>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
