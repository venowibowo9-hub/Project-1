import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { SignUpForm } from '@/components/sign-up-form'

export default async function SignUpPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              <Image
                src="/images/kapal-api-logo.jpg"
                alt="Kapal Api Logo"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-950 mb-2">
              Daftar Akun Baru
            </h1>
            <p className="text-gray-600">Buat akun untuk mengakses sistem</p>
          </div>

          {/* Sign Up Form */}
          <SignUpForm />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Login di sini
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © 2025 PT. Santos Jaya Abadi
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
