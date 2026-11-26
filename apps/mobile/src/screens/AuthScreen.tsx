import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Button, Card, Icon, IconButton, Input, Screen, Text, UtilityActions } from '../components'
import { useLanguage } from '../i18n'
import { useTheme } from '../theme'

export type AuthMode = 'login' | 'register'
export type AuthValues = { name: string; email: string; password: string }

type AuthScreenProps = {
  /** Called only after the form passes validation. Real Supabase call is connected by B. */
  onSubmit: (mode: AuthMode, values: AuthValues) => void | Promise<void>
  onForgotPassword?: () => void
}

export function AuthScreen({ onSubmit, onForgotPassword }: AuthScreenProps) {
  const { t } = useLanguage()
  const { colors, spacing, radius, layout, fontSize, fontWeight } = useTheme()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AuthValues, string>>>({})
  const isLogin = mode === 'login'

  function validate() {
    const next: typeof errors = {}
    if (!isLogin && name.trim().length === 0) next.name = t('errNameRequired')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t('errEmailInvalid')
    if (password.length < 8) next.password = t('errPasswordShort')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit() {
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit(mode, { name: name.trim(), email: email.trim(), password })
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login')
    setErrors({})
  }

  return (
    <Screen>
      <View pointerEvents="none" style={{ position: 'absolute', top: -spacing[12], end: -spacing[10], width: 192, height: 192 }}>
        <View style={{ flex: 1, borderRadius: radius.pill, borderWidth: layout.stroke, borderColor: colors.border, opacity: 0.6 }} />
        <View
          style={{
            position: 'absolute',
            top: spacing[12],
            start: spacing[12],
            end: spacing[12],
            bottom: spacing[12],
            borderRadius: radius.pill,
            borderWidth: layout.stroke,
            borderColor: colors.gold,
            opacity: 0.5,
          }}
        />
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <UtilityActions />
      </View>

      <View style={{ alignItems: 'center', paddingVertical: spacing[6] }}>
        <View
          style={{
            width: layout.touchTarget,
            height: layout.touchTarget,
            marginBottom: spacing[3],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: layout.strokeStrong,
            borderColor: colors.gold,
            borderRadius: radius.card,
            transform: [{ rotate: '6deg' }],
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: spacing[2],
              end: -spacing[1],
              width: spacing[3],
              height: spacing[1],
              borderRadius: radius.pill,
              backgroundColor: colors.gold,
            }}
          />
          <Text variant="title" tone="gold" style={{ transform: [{ rotate: '-6deg' }] }}>
            G
          </Text>
        </View>
        <Text
          variant="display"
          style={{ fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: -1.2 }}
        >
          GoldMate
        </Text>
        <Text variant="label" tone="muted" style={{ marginTop: spacing[2], fontWeight: fontWeight.regular }}>
          {t('eyebrow')}
        </Text>
      </View>

      <Card style={{ padding: spacing[6] }}>
        <View style={{ marginBottom: spacing[6] }}>
          <Text variant="title" accessibilityRole="header">
            {isLogin ? t('loginTitle') : t('registerTitle')}
          </Text>
          <Text variant="label" tone="muted" style={{ marginTop: spacing[2], fontWeight: fontWeight.regular }}>
            {isLogin ? t('loginSubtitle') : t('registerSubtitle')}
          </Text>
        </View>

        {!isLogin ? (
          <Input
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={name}
            onChangeText={setName}
            autoComplete="name"
            textContentType="name"
            error={errors.name}
            icon={<Icon name="user" color={colors.muted} />}
          />
        ) : null}
        <Input
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          forceLTR
          error={errors.email}
          icon={<Icon name="mail" color={colors.muted} />}
        />
        <Input
          label={t('password')}
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          textContentType={isLogin ? 'password' : 'newPassword'}
          error={errors.password}
          icon={<Icon name="lock" color={colors.muted} />}
          endAdornment={
            <IconButton
              bordered={false}
              icon={showPassword ? 'eyeOff' : 'eye'}
              accessibilityLabel={showPassword ? t('hidePassword') : t('showPassword')}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        {isLogin ? (
          <Pressable
            accessibilityRole="button"
            onPress={onForgotPassword}
            style={{ alignSelf: 'flex-end', minHeight: layout.touchTarget, justifyContent: 'center', marginTop: -spacing[2] }}
          >
            <Text variant="label" tone="gold">
              {t('forgot')}
            </Text>
          </Pressable>
        ) : null}

        <Button title={isLogin ? t('login') : t('register')} fullWidth loading={submitting} onPress={submit} />

        <View style={{ marginTop: spacing[6], flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing[1] }}>
          <Text variant="label" tone="muted" style={{ fontWeight: fontWeight.regular }}>
            {isLogin ? t('noAccount') : t('hasAccount')}
          </Text>
          <Pressable accessibilityRole="button" onPress={switchMode} style={{ minHeight: layout.touchTarget, justifyContent: 'center' }}>
            <Text variant="label" tone="gold" style={{ fontWeight: fontWeight.bold }}>
              {isLogin ? t('createNow') : t('loginNow')}
            </Text>
          </Pressable>
        </View>
      </Card>

      <View style={{ paddingTop: spacing[4], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] }}>
        <Icon name="shield" size={16} color={colors.muted} />
        <Text variant="caption" tone="muted">
          {t('security')}
        </Text>
      </View>
    </Screen>
  )
}
