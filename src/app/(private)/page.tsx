import type {Metadata} from "next";
import React from "react";
import Link from "next/link";
import { getSiteLabels } from "@/lib/site";
import { isRegistrationActivityOpen, isSemiScholarshipActivityOpen } from "@/lib/schedule-activities";

export const metadata: Metadata = {
  title: "Portal de Inscripciones DIAD - UNI",
  description: "Sistema de inscripciones para postulantes a la Universidad Nacional de Ingeniería",
}

export default async function HomePage() {
  const [isRegistrationOpen, isSemiScholarshipOpen, siteLabels] = await Promise.all([
    isRegistrationActivityOpen(),
    isSemiScholarshipActivityOpen(),
    getSiteLabels(),
  ]);

  return (
      <>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
                className="inline-block bg-[#E6D9AA] text-[#711610] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              {siteLabels.admissionProcessLabel.toUpperCase()}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Tu camino hacia la{" "}
              <span className="text-[#711610] relative inline-block">
                            UNI
                            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8"
                                 fill="none">
                                <path d="M0 6C50 2 150 2 200 6" stroke="#711610" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </span>
              {" "}comienza aquí
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Gestiona tu proceso de inscripción de manera rápida, segura y sencilla.
              Todo lo que necesitas en un solo lugar.
            </p>
            {isRegistrationOpen ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href='/login-registro'
                    className="cursor-pointer bg-[#711610] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#711610]/90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Iniciar Inscripción
                </Link>
                <Link
                    href="#servicios"
                    className="cursor-pointer bg-white text-[#711610] border-2 border-[#711610] px-8 py-4 rounded-xl font-semibold hover:bg-[#711610]/5 transition">
                  Ver guía
                </Link>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl rounded-2xl border border-[#E6D9AA] bg-white/80 px-6 py-5 text-center shadow-sm">
                <p className="text-lg font-bold text-[#711610]">No hay inscripciones activas</p>
                <p className="mt-2 text-sm text-gray-600">
                  Por el momento no existe un proceso de inscripción dentro de plazo.
                </p>
              </div>
            )}
          </div>

          {isSemiScholarshipOpen && (
            <div
                className="mb-20 bg-gradient-to-r from-[#E6D9AA]/40 to-[#E6D9AA]/20 rounded-3xl p-8 md:p-12 border-2 border-[#E6D9AA]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 bg-[#711610] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#711610]">
                      Solicitudes de Semibeca
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Las solicitudes de semibeca para el {siteLabels.admissionProcessLabel} <span
                      className="font-bold text-[#711610]">están abiertas</span>.
                    Si calificas académicamente, puedes solicitar apoyo económico.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#711610] font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"/>
                    </svg>
                    Fechas límite: Ver bases y requisitos
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                      href="/login-registro"
                      className="bg-[#711610] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#711610]/90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap">
                    Solicitar Semibeca
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isRegistrationOpen && (
            <>
              {/* Services Cards */}
              <div id="servicios" className="mb-20">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                  ¿Qué puedes hacer aquí?
                </h3>
                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                  Accede a todos los servicios que necesitas para completar tu proceso de inscripción
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 - Registro */}
                  <div
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-[#711610]/30 group cursor-pointer">
                    <div
                        className="w-14 h-14 bg-gradient-to-br from-[#711610] to-[#711610]/80 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Ingresar Datos</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Completa tu información personal y académica de forma segura
                    </p>
                    <div
                        className="text-[#711610] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Comenzar
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Card 2 - Pagos */}
                  <div
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-[#711610]/30 group cursor-pointer">
                    <div
                        className="w-14 h-14 bg-gradient-to-br from-[#711610] to-[#711610]/80 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Realizar Pagos</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Paga tu inscripción de manera rápida y segura online
                    </p>
                    <div
                        className="text-[#711610] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ir a pagos
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Card 3 - Descargar */}
                  <div
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-[#711610]/30 group cursor-pointer">
                    <div
                        className="w-14 h-14 bg-gradient-to-br from-[#711610] to-[#711610]/80 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Descargar Docs</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Accede y descarga tus documentos oficiales cuando los necesites
                    </p>
                    <div
                        className="text-[#711610] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver archivos
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Card 4 - Cargar */}
                  <div
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-[#711610]/30 group cursor-pointer">
                    <div
                        className="w-14 h-14 bg-gradient-to-br from-[#711610] to-[#711610]/80 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Cargar Archivos</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Sube tu documentación requerida de forma simple y rápida
                    </p>
                    <div
                        className="text-[#711610] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Subir docs
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Steps */}
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-20">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                  Proceso de Inscripción
                </h3>
                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                  Sigue estos simples pasos para completar tu inscripción
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div
                          className="w-16 h-16 bg-[#711610] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                        1
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Regístrate</h5>
                      <p className="text-sm text-gray-600">Crea tu cuenta con tus datos básicos</p>
                    </div>
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-[#E6D9AA]"></div>
                  </div>

                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div
                          className="w-16 h-16 bg-[#711610] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                        2
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Completa datos</h5>
                      <p className="text-sm text-gray-600">Ingresa tu información académica</p>
                    </div>
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-[#E6D9AA]"></div>
                  </div>

                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div
                          className="w-16 h-16 bg-[#711610] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                        3
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">Realiza el pago</h5>
                      <p className="text-sm text-gray-600">Paga tu derecho de inscripción</p>
                    </div>
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-[#E6D9AA]"></div>
                  </div>

                  <div>
                    <div className="flex flex-col items-center text-center">
                      <div
                          className="w-16 h-16 bg-[#711610] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                        4
                      </div>
                      <h5 className="font-bold text-gray-900 mb-2">¡Listo!</h5>
                      <p className="text-sm text-gray-600">Descarga tu comprobante</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div id="ayuda"
                   className="bg-gradient-to-r from-[#711610] to-[#711610]/90 rounded-3xl p-8 md:p-12 text-white text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                  Nuestro equipo está disponible para ayudarte en cada paso del proceso
                </p>
                <div className="flex justify-center">
                  <Link
                      href="/login-registro"
                      className="bg-white text-[#711610] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg">
                    Ingresar al portal
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>
      </>
  );
}
