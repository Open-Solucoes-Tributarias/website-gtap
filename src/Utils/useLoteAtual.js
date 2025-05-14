import { useMemo } from "react";

//essa função é um hook que veirifca a data atual e retorna como resultado, baseado na lista de lotes array

//   loteAtual, // objeto com todas as informações do lote atual
//     precoAtual, // string do valor do lote"
//     nomeLoteAtual, string nome do lote
//     lotes; // todos os lotes com status ('passado', 'presente', 'futuro')

const lotes = [
  {
    nome: "Primeiro Lote",
    preco: "R$ 3.190,00",
    mes: 1,
    ano: 2025,
    periodo: "JANEIRO A MAIO",
  },
  {
    nome: "Segundo Lote",
    preco: "R$ 3.490,00",
    mes: 6,
    ano: 2025,
    periodo: "JUNHO A AGOSTO",
  },
  {
    nome: "Terceiro Lote",
    preco: "R$ 3.690,00",
    mes: 9,
    ano: 2025,
    periodo: "SETEMBRO A OUTUBRO",
  },
];

const getStatusDoLote = (ano, periodo) => {
  const hoje = new Date();
  const [mesInicio, mesFim] = periodo.split(" A ").map((m) => m.trim());

  const meses = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  const mesInicioIndex = meses.indexOf(mesInicio.toUpperCase());
  const mesFimIndex = meses.indexOf(mesFim.toUpperCase());

  const dataInicio = new Date(ano, mesInicioIndex, 1);
  const dataFim = new Date(ano, mesFimIndex + 1, 0); // último dia do mês

  if (hoje >= dataInicio && hoje <= dataFim) return "presente";
  if (hoje < dataInicio) return "futuro";
  return "passado";
};

export const useLoteAtual = () => {
  const lotesComStatus = useMemo(() => {
    return lotes.map((lote) => ({
      ...lote,
      status: getStatusDoLote(lote.ano, lote.periodo),
    }));
  }, []);

  const loteAtual = lotesComStatus.find((lote) => lote.status === "presente");

  return {
    loteAtual,
    precoAtual: loteAtual?.preco || null,
    nomeLoteAtual: loteAtual?.nome || null,
    lotes: lotesComStatus,
  };
};
