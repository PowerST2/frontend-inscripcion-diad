/**
 * Ejemplo de uso del helper de storage
 * Este archivo muestra cómo usar las funciones en tus componentes
 */

import { setStorage, getStorage, removeStorage, clearStorage } from "@/helpers";

// ============================================
// EJEMPLO 1: Guardar y obtener información
// ============================================

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

// Guardar usuario
const user: User = {
  id: 1,
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "987654321",
};

setStorage("user", user);

// Obtener usuario
const savedUser = getStorage<User>("user");
console.log("Usuario guardado:", savedUser);

// Obtener con valor por defecto
const defaultUser: User = {
  id: 0,
  name: "Usuario Anónimo",
  email: "anonimo@example.com",
};
const userOrDefault = getStorage<User>("user", defaultUser);

// ============================================
// EJEMPLO 2: Guardar con expiración
// ============================================

// Guardar un token que expira en 1 hora (3600000 ms)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
setStorage("authToken", token, { expiresIn: 3600000 });

// Obtener token
const savedToken = getStorage<string>("authToken");
console.log("Token:", savedToken);

// Después de 1 hora, getStorage retornará null automáticamente

// ============================================
// EJEMPLO 3: Guardar datos de formulario
// ============================================

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  program: string;
}

const formData: FormData = {
  firstName: "Carlos",
  lastName: "López",
  email: "carlos@example.com",
  university: "UNI",
  program: "Ingeniería Civil",
};

// Guardar progreso del formulario
setStorage("inscriptionForm", formData);

// Obtener datos del formulario más tarde
const savedFormData = getStorage<FormData>("inscriptionForm");
console.log("Datos del formulario:", savedFormData);

// ============================================
// EJEMPLO 4: Guardar arrays
// ============================================

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
}

const documents: Document[] = [
  {
    id: "doc1",
    name: "DNI.pdf",
    uploadedAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "doc2",
    name: "Certificado.pdf",
    uploadedAt: "2025-01-15T10:35:00Z",
  },
];

setStorage("uploadedDocuments", documents);

// Obtener documentos
const savedDocuments = getStorage<Document[]>("uploadedDocuments", []);
console.log("Documentos guardados:", savedDocuments);

// ============================================
// EJEMPLO 5: Eliminar datos específicos
// ============================================

// Eliminar solo el usuario
removeStorage("user");

// ============================================
// EJEMPLO 6: Verificar si existe una clave
// ============================================

import { hasStorage } from "@/helpers";

if (hasStorage("user")) {
  console.log("El usuario existe en localStorage");
} else {
  console.log("El usuario no existe en localStorage");
}

// ============================================
// EJEMPLO 7: Limpiar todo
// ============================================

// Eliminar todo el localStorage
// clearStorage();

// ============================================
// NOTAS IMPORTANTES:
// ============================================
/*
1. El helper usa JSON.stringify/parse automáticamente
2. Solo funciona en el navegador (no en SSR)
3. Para usar en componentes, envuelve en 'use client'
4. El localStorage tiene límite (~5-10MB según navegador)
5. Los datos persisten después de cerrar el navegador
6. La expiración se verifica cuando se intenta obtener el valor
*/

