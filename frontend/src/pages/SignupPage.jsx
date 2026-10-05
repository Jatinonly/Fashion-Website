import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '@/components/layout/AuthShell'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { email, hasErrors, minLength, required, validate } from '@/lib/validation'
import { useAuthStore } from '@/store/authStore'

export default function SignupPage() {
  useDocumentTitle('Create account')
  const [params] = useSearchParams()
  const { signup, status, error, clearError } = useAuthStore()
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => clearError, [clearError])

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values, {
      name: [required('Name'), minLength('Name', 2)],
      email: [required('Email'), email],
      password: [
        required('Password'),
        minLength('Password', 8),
        (value) =>
          /\d/.test(value) && /[a-z]/i.test(value)
            ? undefined
            : 'Use at least one letter and one number',
      ],
      confirmPassword: [
        required('Confirm password'),
        (value) => (value === values.password ? undefined : 'Passwords do not match'),
      ],
    })
    if (!acceptTerms) nextErrors.terms = 'Please accept the terms to continue'
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    await signup({ name: values.name, email: values.email, password: values.password })
  }

  const update = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }))

  const loginHref = params.get('redirect')
    ? `/login?redirect=${encodeURIComponent(params.get('redirect') ?? '')}`
    : '/login'

  return (
    <AuthShell
      title="Create account"
      subtitle="Track orders, save favourites and check out faster."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
          required
        />
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
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters, with a letter and a number"
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
          required
        />
        <div>
          <Checkbox
            label="I agree to the terms of sale and privacy policy"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            aria-invalid={errors.terms ? true : undefined}
          />
          {errors.terms && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {errors.terms}
            </p>
          )}
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" variant="dark" size="lg" fullWidth loading={status === 'loading'}>
          Create account
        </Button>
      </form>
      <p className="mt-8 text-sm">
        Already have an account?{' '}
        <Link to={loginHref} className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
