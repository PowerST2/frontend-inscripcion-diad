/**
 * Hook useStorage - Para usar localStorage en componentes cliente
 * Facilita la integración con React y maneja automáticamente la hidratación
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { setStorage, getStorage, removeStorage } from "@/helpers/storage";

interface UseStorageOptions {
  /**
   * Sincronizar entre pestañas del navegador
   */
  sync?: boolean;
  /**
   * Tiempo de expiración en milisegundos
   */
  expiresIn?: number;
}

/**
 * Hook personalizado para manejar localStorage
 * @param key - Clave del localStorage
 * @param initialValue - Valor inicial si no existe en storage
 * @param options - Opciones adicionales
 * @returns [valor, setValue, removeValue, isLoading]
 */
export function useStorage<T>(
  key: string,
  initialValue?: T,
  options?: UseStorageOptions
): [T | null, (value: T) => void, () => void, boolean] {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      // Obtener el valor del localStorage durante la inicialización
      return getStorage<T>(key, initialValue);
    } catch (error) {
      console.error(`Error al inicializar useStorage para la clave "${key}":`, error);
      return initialValue ?? null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Actualizar isLoading después del montaje
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Configurar sincronización entre pestañas si está habilitada
  useEffect(() => {
    if (!options?.sync) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue.value || null);
        } catch (error) {
          console.error("Error al sincronizar storage entre pestañas:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, options?.sync]);

  const setValue = useCallback(
    (value: T) => {
      try {
        setStorage(key, value, { expiresIn: options?.expiresIn });
        setStoredValue(value);
      } catch (error) {
        console.error(`Error al establecer el valor en useStorage para la clave "${key}":`, error);
      }
    },
    [key, options?.expiresIn]
  );

  const removeValue = useCallback(() => {
    try {
      removeStorage(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Error al eliminar del useStorage la clave "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, removeValue, isLoading];
}

/**
 * Hook para manejar localStorage de un objeto completo
 * Útil cuando tienes múltiples campos relacionados
 */
export function useStorageObject<T extends object>(
  key: string,
  initialValue?: T,
  options?: UseStorageOptions
): [T | null, (updates: Partial<T>) => void, () => void, boolean] {
  const [storedValue, setStoredValue, removeValue, isLoading] = useStorage<T>(
    key,
    initialValue,
    options
  );

  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setStoredValue({
        ...storedValue,
        ...updates,
      } as T);
    },
    [storedValue, setStoredValue]
  );

  return [storedValue, updateValue, removeValue, isLoading];
}

/**
 * Hook para manejar localStorage con estado de error
 */
export function useStorageWithError<T>(
  key: string,
  initialValue?: T,
  options?: UseStorageOptions
): [T | null, (value: T) => void, () => void, boolean, Error | null] {
  const [storedValue, setStoredValue, removeValue, isLoading] = useStorage<T>(
    key,
    initialValue,
    options
  );
  const [error, setError] = useState<Error | null>(null);

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    },
    [setStoredValue]
  );

  return [storedValue, setValue, removeValue, isLoading, error];
}

