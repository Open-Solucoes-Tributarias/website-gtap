import { useMemo } from "react";
//essa função é um hook que verifica a data atual e retorna como resultado, baseado na lista de lotes array

const lotes = [
  {
    nome: "Primeiro Lote",
    preco: "R$ 3.190,00",
    ano: 2025,
    mesInicio: 1,
    mesFim: 4,
    label: "JANEIRO A MAIO",
  },
  {
    nome: "Segundo Lote",
    preco: "R$ 3.490,00",
    ano: 2025,
    mesInicio: 5,
    mesFim: 8,
    label: "JUNHO A AGOSTO",
  },
  {
    nome: "Terceiro Lote",
    preco: "R$ 3.690,00",
    ano: 2025,
    mesInicio: 9,
    mesFim: 10,
    label: "SETEMBRO A OUTUBRO",
  },
];

const getStatusDoLote = (ano, mesInicio, mesFim) => {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  if (ano < anoAtual || (ano === anoAtual && mesFim < mesAtual)) return "passado";
  if (ano === anoAtual && mesInicio <= mesAtual && mesFim >= mesAtual) return "presente";
  return "futuro";
};

export const useLoteAtual = () => {
  const lotesComStatus = useMemo(() => {
    return lotes.map((lote) => ({
      ...lote,
      status: getStatusDoLote(lote.ano, lote.mesInicio, lote.mesFim),
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