import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '@/components/layout/AuthShell'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { email, hasErrors, required, validate } from '@/lib/validation'
import { DEMO_CREDENTIALS } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  useDocumentTitle('Log in')
  const [params] = useSearchParams()
  const { login, status, error, clearError } = useAuthStore()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => clearError, [clearError])

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values, {
      email: [required('Email'), email],
      password: [required('Password')],
    })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    // On success <GuestRoute> redirects to `?redirect=` (or home).
    await login(values)
  }

  const update = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }))

  const signupHref = params.get('redirect')
    ? `/signup?redirect=${encodeURIComponent(params.get('redirect') ?? '')}`
    : '/signup'

  return (
    <AuthShell title="Log in" subtitle="Access your orders, wishlist and faster checkout.">
      {params.get('redirect') && <Alert className="mb-6">Please log in to continue.</Alert>}
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          required
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" variant="dark" size="lg" fullWidth loading={status === 'loading'}>
          Log in
        </Button>
      </form>
      <button
        type="button"
        onClick={() => setValues({ ...DEMO_CREDENTIALS })}
        className="mt-4 w-full rounded-sm bg-surface-muted p-3 text-left text-xs hover:bg-surface"
      >
        <span className="block label">Demo account</span>
        <span className="font-mono text-muted">
          {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </span>
      </button>
      <p className="mt-8 text-sm">
        New here?{' '}
        <Link to={signupHref} className="underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
