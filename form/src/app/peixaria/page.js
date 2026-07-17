import { Suspense } from "react";
import PeixariaClient from "./PeixariaClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando peixaria...</div>}>
      <PeixariaClient />
    </Suspense>
  );
}
