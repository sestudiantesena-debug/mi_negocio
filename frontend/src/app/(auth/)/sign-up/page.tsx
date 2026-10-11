'use client';

import { SignUp } from '@clerk/nextjs';
import { Shield, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-600 mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta en mi_negocio Admin</h1>
          <p className="text-gray-600 mt-2">Únete y automatiza tus ventas con IA</p>
        </div>

        <div className="card p-8">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white',
                card: 'shadow-none border-none bg-transparent',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-600',
                footerActionLink: 'text-primary-600 hover:text-primary-700',
              },
            }}
            routing="path"
            signInUrl="/sign-in"
            redirectUrl="/admin/dashboard"
          />
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>¿Ya tienes cuenta? <a href="/sign-in" className="text-primary-600 hover:underline font-medium">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  );
}