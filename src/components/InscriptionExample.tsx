/**
 * Componente ejemplo de inscripción que demuestra el uso del helper de storage
 * Este archivo puede servir como referencia para implementar la funcionalidad
 */

"use client";

import { useStorage } from "@/hooks";
import { useState } from "react";

interface InscriptionData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  program: string;
}

export function InscriptionExample() {
  const [formData, setFormData, resetForm, isLoading] = useStorage<InscriptionData>(
    "inscriptionData",
    {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      university: "UNI",
      program: "",
    }
  );

  const [showSaved, setShowSaved] = useState(false);

  if (isLoading) {
    return <div className="text-center p-8">Cargando datos guardados...</div>;
  }

  const handleInputChange = (field: keyof InscriptionData, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Formulario de Inscripción</h3>

      {showSaved && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          ✓ Datos guardados automáticamente
        </div>
      )}

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData?.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#711610] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={formData?.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Tu apellido"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#711610] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData?.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="tu.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#711610] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData?.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+51 999999999"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#711610] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programa
          </label>
          <select
            value={formData?.program || ""}
            onChange={(e) => handleInputChange("program", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#711610] focus:border-transparent outline-none"
          >
            <option value="">Selecciona un programa</option>
            <option value="Ingeniería Civil">Ingeniería Civil</option>
            <option value="Ingeniería Mecánica">Ingeniería Mecánica</option>
            <option value="Ingeniería Eléctrica">Ingeniería Eléctrica</option>
            <option value="Ingeniería Industrial">Ingeniería Industrial</option>
            <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => resetForm()}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#711610] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#711610]/90 transition"
          >
            Continuar
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
        <p>
          💡 <strong>Tip:</strong> Tus datos se guardan automáticamente en el navegador mientras escribes.
          Puedes cerrar esta página y tus datos se recuperarán cuando regreses.
        </p>
      </div>
    </div>
  );
}

