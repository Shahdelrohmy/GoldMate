// TEMPORARY preview app: simple state-based navigation so every screen can be seen on a phone.
// B replaces this with Expo Router (5 tabs) and the real data layer. Texts here are dev-only.
import { useCallback, useState } from 'react'
import { Pressable, Share, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon, OptionChips, Text, type IconName } from '../components'
import { useLanguage } from '../i18n'
import {
  AddPieceScreen,
  AuthScreen,
  CalculatorsScreen,
  MakingChargesScreen,
  PriceCheckScreen,
  PricesScreen,
  SettingsScreen,
  VaultScreen,
  ZakatScreen,
} from '../screens'
import { ThemeProvider, useTheme } from '../theme'
import type { Preferences, ViewStatus } from '../types'
import { demoPieces, demoPrices, demoSummary, demoZakat } from './demoData'
import { demoCalculateMaking, demoCheckPrice } from './demoApi'

type Route = 'auth' | 'prices' | 'vault' | 'zakat' | 'calculators' | 'settings' | 'add' | 'making' | 'check'
type Tab = 'prices' | 'vault' | 'zakat' | 'calculators' | 'settings'

const initialPreferences: Preferences = { jewelryOpinion: 'include', priceAlerts: true, zakatReminders: true, analyticsConsent: false }

function Root() {
  const { t, language } = useLanguage()
  const { colors, spacing, layout } = useTheme()
  const insets = useSafeAreaInsets()
  const [route, setRoute] = useState<Route>('auth')
  const [status, setStatus] = useState<ViewStatus>('ready')
  const [zakatAbove, setZakatAbove] = useState(false)
  const [preferences, setPreferences] = useState(initialPreferences)
  const [pieces, setPieces] = useState(demoPieces)

  const exportData = useCallback(async () => {
    await Share.share({ message: JSON.stringify({ demo: true, language, preferences }, null, 2) })
  }, [language, preferences])

  const tabs: { id: Tab; label: string; icon: IconName }[] = [
    { id: 'prices', label: t('prices'), icon: 'prices' },
    { id: 'vault', label: t('vault'), icon: 'vault' },
    { id: 'zakat', label: t('zakat'), icon: 'zakat' },
    { id: 'calculators', label: t('calculators'), icon: 'calculator' },
    { id: 'settings', label: t('settings'), icon: 'settings' },
  ]
  const activeTab: Tab | null = route === 'add' ? 'vault' : route === 'making' || route === 'check' ? 'calculators' : route === 'auth' ? null : route

  let screen
  switch (route) {
    case 'auth':
      screen = <AuthScreen onSubmit={() => setRoute('prices')} />
      break
    case 'prices':
      screen = <PricesScreen status={status} data={demoPrices} onRetry={() => setStatus('ready')} />
      break
    case 'vault':
      screen = <VaultScreen status={status} summary={demoSummary} pieces={pieces} onAdd={() => setRoute('add')} onRetry={() => setStatus('ready')} />
      break
    case 'add':
      screen = (
        <AddPieceScreen
          onBack={() => setRoute('vault')}
          onSubmit={(piece) => setPieces((list) => [...list, { id: String(Date.now()), type: piece.type, weightG: piece.weightG, karat: piece.karat, price: piece.price, source: 'manual' }])}
          onSaved={() => setRoute('vault')}
        />
      )
      break
    case 'zakat':
      screen = <ZakatScreen key={String(zakatAbove)} status={demoZakat(zakatAbove, language)} />
      break
    case 'calculators':
      screen = <CalculatorsScreen onOpenMaking={() => setRoute('making')} onOpenPriceCheck={() => setRoute('check')} />
      break
    case 'making':
      screen = <MakingChargesScreen onBack={() => setRoute('calculators')} onCalculate={demoCalculateMaking} />
      break
    case 'check':
      screen = <PriceCheckScreen onBack={() => setRoute('calculators')} onCheck={demoCheckPrice} />
      break
    case 'settings':
      screen = <SettingsScreen preferences={preferences} onChange={setPreferences} onExport={exportData} onDelete={() => { setPreferences(initialPreferences); setRoute('auth') }} />
      break
  }

  const showStateBar = route === 'prices' || route === 'vault'
  const showZakatBar = route === 'zakat'

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {showStateBar || showZakatBar ? (
        <View style={{ paddingTop: insets.top, paddingHorizontal: spacing[4], paddingBottom: spacing[2], backgroundColor: colors.cardRaised }}>
          <Text variant="caption" tone="muted" style={{ marginBottom: spacing[1] }}>
            DEV preview
          </Text>
          {showStateBar ? (
            <OptionChips<ViewStatus>
              variant="compact"
              value={status}
              onChange={setStatus}
              options={[{ id: 'ready', label: 'Data' }, { id: 'loading', label: 'Loading' }, { id: 'error', label: 'Error' }, { id: 'empty', label: 'Empty' }]}
            />
          ) : (
            <OptionChips<'below' | 'above'>
              variant="compact"
              value={zakatAbove ? 'above' : 'below'}
              onChange={(v) => setZakatAbove(v === 'above')}
              options={[{ id: 'below', label: 'Below nisab' }, { id: 'above', label: 'Above nisab' }]}
            />
          )}
        </View>
      ) : null}
      <View style={{ flex: 1 }}>{screen}</View>
      {activeTab ? (
        <View
          style={{
            flexDirection: 'row',
            paddingBottom: insets.bottom,
            borderTopWidth: layout.stroke,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTab
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setStatus('ready')
                  setRoute(tab.id)
                }}
                style={{ flex: 1, minHeight: layout.touchTarget + spacing[2], alignItems: 'center', justifyContent: 'center', gap: spacing[1] }}
              >
                <Icon name={tab.icon} color={active ? colors.gold : colors.muted} />
                <Text variant="caption" style={{ color: active ? colors.gold : colors.muted }}>
                  {tab.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

export default function DevApp() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
