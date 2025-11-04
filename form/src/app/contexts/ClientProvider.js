"use client";
import { FormProvider } from './FormContext';
import { AuthProvider } from './AuthContext';

export default function ClientProvider({ children }) {
    return (
        <AuthProvider>
            <FormProvider>
                {children}
            </FormProvider>
        </AuthProvider>
    );
}