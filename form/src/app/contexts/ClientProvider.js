"use client";
import { FormProvider } from './FormContext';

export default function ClientProvider({ children }) {
    return <FormProvider>{children}</FormProvider>;
}