export type FacultySpecialty = {
  code: string;
  name: string;
};

export type Faculty = {
  code: string;
  name: string;
  imageUrl: string;
  specialties: FacultySpecialty[];
};

export const FACULTIES: Faculty[] = [
  {
    code: "A",
    name: "Arquitectura, Urbanismo y Artes",
    imageUrl:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "A1", name: "Arquitectura" },
      { code: "A2", name: "Urbanismo" },
    ],
  },
  {
    code: "C",
    name: "Ingenieria Civil",
    imageUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    specialties: [{ code: "C1", name: "Ingenieria Civil" }],
  },
  {
    code: "E",
    name: "Ingenieria Economica, Estadistica y Ciencias Sociales",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "E1", name: "Ingenieria Economica" },
      { code: "E3", name: "Ingenieria Estadistica" },
    ],
  },
  {
    code: "G",
    name: "Ingenieria Geologica, Minera y Metalurgica",
    imageUrl:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "G1", name: "Ingenieria Geologica" },
      { code: "G2", name: "Ingenieria Metalurgica" },
      { code: "G3", name: "Ingenieria de Minas" },
    ],
  },
  {
    code: "I",
    name: "Ingenieria Industrial y Sistemas",
    imageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "I1", name: "Ingenieria Industrial" },
      { code: "I2", name: "Ingenieria de Sistemas" },
      { code: "I3", name: "Ingenieria de Software" },
    ],
  },
  {
    code: "L",
    name: "Ingenieria Electrica y Electronica",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "L1", name: "Ingenieria Electrica" },
      { code: "L2", name: "Ingenieria Electronica" },
      { code: "L3", name: "Ingenieria de Telecomunicaciones" },
      { code: "L4", name: "Ingenieria de Ciberseguridad" },
    ],
  },
  {
    code: "M",
    name: "Ingenieria Mecanica",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "M3", name: "Ingenieria Mecanica" },
      { code: "M4", name: "Ingenieria Mecanica y Electrica" },
      { code: "M5", name: "Ingenieria Naval" },
      { code: "M6", name: "Ingenieria Mecatronica" },
      { code: "M7", name: "Ingenieria Aeroespacial" },
    ],
  },
  {
    code: "N",
    name: "Ciencias",
    imageUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "N1", name: "Fisica" },
      { code: "N2", name: "Matematicas" },
      { code: "N3", name: "Quimica" },
      { code: "N5", name: "Ingenieria Fisica" },
      { code: "N6", name: "Ciencia de la Computacion" },
    ],
  },
  {
    code: "P",
    name: "Ingenieria de Petroleo, Gas Natural y Petroquimica",
    imageUrl:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "P2", name: "Ingenieria Petroquimica" },
      { code: "P3", name: "Ingenieria de Petroleo y Gas Natural" },
    ],
  },
  {
    code: "Q",
    name: "Ingenieria Quimica y Textil",
    imageUrl:
      "https://images.unsplash.com/photo-1581093588401-16ec4f6cbbe2?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "Q1", name: "Ingenieria Quimica" },
      { code: "Q2", name: "Ingenieria Textil" },
    ],
  },
  {
    code: "S",
    name: "Ingenieria Ambiental",
    imageUrl:
      "https://images.unsplash.com/photo-1472313420546-a46e561861d8?auto=format&fit=crop&w=1200&q=80",
    specialties: [
      { code: "S1", name: "Ingenieria Sanitaria" },
      { code: "S2", name: "Ingenieria de Higiene y Seguridad Industrial" },
      { code: "S3", name: "Ingenieria Ambiental" },
    ],
  },
];
