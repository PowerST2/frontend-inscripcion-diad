/**
 * Helper para manejar localStorage de forma segura y sencilla
 * Incluye serialización/deserialización automática de JSON
 */

export interface StorageOptions {
  /**
   * Tiempo de expiración en milisegundos (opcional)
   */
  expiresIn?: number;
}

export interface StorageData<T> {
  value: T;
  expiresAt?: number;
}

/**
 * Establece un valor en localStorage
 * @param key - Clave del localStorage
 * @param value - Valor a guardar (se serializa automáticamente)
 * @param options - Opciones adicionales (expiración, etc)
 */
export function setStorage<T>(
  key: string,
  value: T,
  options?: StorageOptions
): void {
  try {
    const data: StorageData<T> = {
      value,
      ...(options?.expiresIn && {
        expiresAt: Date.now() + options.expiresIn,
      }),
    };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error al guardar en localStorage la clave "${key}":`, error);
  }
}

/**
 * Obtiene un valor del localStorage
 * @param key - Clave del localStorage
 * @param defaultValue - Valor por defecto si no existe o ha expirado
 * @returns El valor desserializado o el valor por defecto
 */
export function getStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);

    if (!item) {
      return defaultValue ?? null;
    }

    const data: StorageData<T> = JSON.parse(item);

    // Verificar si ha expirado
    if (data.expiresAt && Date.now() > data.expiresAt) {
      removeStorage(key);
      return defaultValue ?? null;
    }

    return data.value;
  } catch (error) {
    console.error(`Error al obtener del localStorage la clave "${key}":`, error);
    return defaultValue ?? null;
  }
}

/**
 * Elimina un valor del localStorage
 * @param key - Clave del localStorage a eliminar
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error al eliminar del localStorage la clave "${key}":`, error);
  }
}

/**
 * Limpia todo el localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error al limpiar localStorage:", error);
  }
}

/**
 * Obtiene todas las claves del localStorage
 * @returns Array con todas las claves
 */
export function getStorageKeys(): string[] {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error("Error al obtener las claves del localStorage:", error);
    return [];
  }
}

/**
 * Obtiene el tamaño total del localStorage en bytes
 * @returns Tamaño en bytes
 */
export function getStorageSize(): number {
  let size = 0;
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error("Error al calcular el tamaño del localStorage:", error);
  }
  return size;
}

/**
 * Verifica si una clave existe en localStorage
 * @param key - Clave a verificar
 * @returns true si existe, false en caso contrario
 */
export function hasStorage(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error al verificar si existe la clave "${key}":`, error);
    return false;
  }
}

/**
 * Hook personalizado para localStorage (uso en componentes)
 * No se exporta aquí porque requiere contexto de componente
 */
export interface UseStorageReturn<T> {
  value: T | null;
  setValue: (value: T, options?: StorageOptions) => void;
  removeValue: () => void;
  isLoading: boolean;
}

