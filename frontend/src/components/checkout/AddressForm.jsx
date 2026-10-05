import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { INDIAN_STATES } from '@/data/indianStates'
import { email, hasErrors, indianPhone, pincode, required, validate } from '@/lib/validation'

const RULES = {
  fullName: [required('Full name')],
  phone: [required('Mobile number'), indianPhone],
  email: [required('Email'), email],
  line1: [required('Address')],
  city: [required('City')],
  state: [required('State')],
  pincode: [required('PIN code'), pincode],
}

const STATE_OPTIONS = INDIAN_STATES.map((state) => ({ value: state, label: state }))

export function AddressForm({ initialValues, onSubmit, submitSlot }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const fieldProps = (field) => ({
    name: field,
    value: values[field],
    error: touched[field] ? errors[field] : undefined,
    onChange: (event) => {
      const next = { ...values, [field]: event.target.value }
      setValues(next)
      if (touched[field]) setErrors(validate(next, RULES))
    },
    onBlur: () => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      setErrors(validate(values, RULES))
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values, RULES)
    setErrors(nextErrors)
    setTouched(Object.fromEntries(Object.keys(RULES).map((key) => [key, true])))
    if (hasErrors(nextErrors)) {
      const firstInvalid = Object.keys(nextErrors)[0]
      document.querySelector(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    onSubmit({ ...values, phone: values.phone.replace(/\D/g, '').slice(-10) })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" autoComplete="name" required {...fieldProps('fullName')} />
        <Input
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          hint="For delivery updates"
          required
          {...fieldProps('phone')}
        />
      </div>
      <Input label="Email" type="email" autoComplete="email" required {...fieldProps('email')} />
      <Input
        label="Address line 1"
        autoComplete="address-line1"
        placeholder="Flat / house no., building, street"
        required
        {...fieldProps('line1')}
      />
      <Input
        label="Address line 2 (optional)"
        autoComplete="address-line2"
        placeholder="Area, landmark"
        {...fieldProps('line2')}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="City" autoComplete="address-level2" required {...fieldProps('city')} />
        <Select
          label="State"
          autoComplete="address-level1"
          options={STATE_OPTIONS}
          placeholder="Select state"
          required
          {...fieldProps('state')}
        />
        <Input
          label="PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          required
          {...fieldProps('pincode')}
        />
      </div>
      {submitSlot}
    </form>
  )
}
