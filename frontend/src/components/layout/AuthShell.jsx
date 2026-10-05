import { bannerImage } from '@/lib/images'

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-[calc(100dvh-5rem)] md:grid-cols-2">
      <div className="relative hidden bg-ink md:block">
        <img
          src={bannerImage('auth', 1000, 1300)}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-medium tracking-tight uppercase sm:text-4xl">{title}</h1>
          <p className="mt-2 mb-8 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
