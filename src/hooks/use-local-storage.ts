"use client";

import * as React from "react";

/**
 * Estado persistido em localStorage. Começa sempre com `initial` para o
 * HTML do servidor bater com o do cliente; o valor salvo entra depois da
 * hidratação (`ready` avisa quando isso aconteceu).
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // Leitura só pós-hidratação, de propósito: o HTML do servidor não
      // conhece o localStorage e precisa casar com o primeiro render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // storage bloqueado ou JSON corrompido: segue com o padrão
    }
     
    setReady(true);
  }, [key]);

  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sem espaço ou modo privado: não dá pra persistir, tudo bem
    }
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}
