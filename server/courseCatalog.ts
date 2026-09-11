export interface SestSenatCourse {
  id: string;
  code: string;
  name: string;
  category: "transporte" | "gestao" | "tecnologia" | "seguranca" | "operacao";
  modality: "Presencial" | "EAD" | "Semipresencial";
  workloadHours: number;
  description: string;
  benefits: string[];
  imageUrl: string;
  isPopular?: boolean;
  minStudents?: number;
}

export const CATALOG_COURSES: SestSenatCourse[] = [
  {
    id: "direcao-defensiva",
    code: "TRA-01",
    name: "Direção Defensiva e Prevenção de Sinistros",
    category: "transporte",
    modality: "Presencial",
    workloadHours: 20,
    description: "Treinamento prático e comportamental com técnicas avançadas para redução de acidentes, custos com manutenção corretiva e preservação de vidas nas rodovias e cidades.",
    benefits: ["Simulador de direção de alta tecnologia", "Instrutores homologados", "Certificado oficial SEST SENAT"],
    imageUrl: "/manus-storage/direcao_defensiva_f5931e6c.png",
    isPopular: true,
  },
  {
    id: "power-bi-gestao",
    code: "TEC-02",
    name: "Power BI Aplicado à Gestão de Transporte e Logística",
    category: "tecnologia",
    modality: "Semipresencial",
    workloadHours: 32,
    description: "Criação de dashboards dinâmicos para controle de frotas, consumo de diesel, pontualidade de entregas, KPIs operacionais e relatórios executivos para diretoria.",
    benefits: ["Modelagem de dados de telemetria e ERP", "Templates prontos para logística", "Aulas práticas com estudos de caso"],
    imageUrl: "/manus-storage/powerbi_7efca268.png",
    isPopular: true,
  },
  {
    id: "excel-operacoes",
    code: "TEC-01",
    name: "Excel Avançado para Logística, Escalas e Custos",
    category: "tecnologia",
    modality: "EAD",
    workloadHours: 40,
    description: "Domine planilhas complexas, PROCV/X, tabelas dinâmicas, fórmulas lógicas e automação de planilhas para roteirização, fretes e escalas de motoristas.",
    benefits: ["Foco em rotinas reais de transportadoras", "Planilhas de cálculo de frete e custos operacionais", "Certificação reconhecida no mercado"],
    imageUrl: "/manus-storage/excel_b390a7b8.png",
    isPopular: true,
  },
  {
    id: "operador-empilhadeira",
    code: "OPE-03",
    name: "Operação e Segurança de Empilhadeiras (NR-11)",
    category: "operacao",
    modality: "Presencial",
    workloadHours: 16,
    description: "Formação completa com foco em movimentação, armazenagem e manuseio de cargas em galpões logísticos e centros de distribuição, seguindo rigorosamente a NR-11.",
    benefits: ["Aulas práticas em pátio dedicado em Deodoro", "Prevenção de avarias de carga", "Habilitação profissional imediata"],
    imageUrl: "/manus-storage/empilhadeira_6aef7e70.jpg",
    isPopular: true,
  },
  {
    id: "lideranca-transporte",
    code: "GES-04",
    name: "Liderança Operacional e Gestão de Equipes de Transporte",
    category: "gestao",
    modality: "Presencial",
    workloadHours: 24,
    description: "Desenvolvimento de encarregados, supervisores de tráfego e coordenadores de filial para engajar motoristas, reduzir turnover e mediar conflitos na rotina.",
    benefits: ["Comunicação assertiva na pista e no escritório", "Gestão de metas e produtividade da frota", "Alinhamento com a cultura da empresa"],
    imageUrl: "/manus-storage/lideranca_c7ee327c.jpg",
    isPopular: true,
  },
  {
    id: "transporte-coletivo-passageiros",
    code: "TRA-05",
    name: "Condutor de Veículo de Transporte Coletivo de Passageiros (Resolução CONTRAN)",
    category: "transporte",
    modality: "Presencial",
    workloadHours: 50,
    description: "Curso regulamentado obrigatório para motoristas de ônibus urbano, intermunicipal e turismo. Inclui simulador de ônibus e atendimento inclusivo ao passageiro.",
    benefits: ["Simulador de última geração em Deodoro RJ", "Homologação pelo DETRAN/CONTRAN", "Aulas de acessibilidade e primeiros socorros"],
    imageUrl: "/manus-storage/onibus_passageiros_15490163.png",
    isPopular: true,
  }
];
