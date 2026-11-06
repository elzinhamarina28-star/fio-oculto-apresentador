/**
 * Daily programming: one topic per calendar day (São Paulo time), same for everyone that day.
 * Add topics freely; order defines the rotation.
 */
export interface DailyTopic {
  title: string;
  angle: string;
}

export const TOPICS: DailyTopic[] = [
  { title: "O mistério das meias que somem na máquina de lavar", angle: "teoria da conspiração doméstica" },
  { title: "Quem come o último pedaço de pizza e finge que não foi", angle: "investigação de crime culinário" },
  { title: "Vizinhos barulhentos: o que eles estão construindo às 7h da manhã?", angle: "vigilância de condomínio" },
  { title: "O grupo da família no WhatsApp e suas mensagens enigmáticas", angle: "decifrar códigos de tia" },
  { title: "Por que o gato derruba tudo da mesa?", angle: "o gato como suspeito principal" },
  { title: "Crushes, contatinhos e o mistério do visto às 3h da manhã", angle: "romance investigativo, leve" },
  { title: "O controle remoto que desaparece dentro do sofá", angle: "arqueologia do sofá" },
  { title: "Segunda-feira: acidente ou sabotagem?", angle: "processo contra o calendário" },
  { title: "Lendas urbanas da sua cidade", angle: "o chat conta, o detetive julga" },
  { title: "A geladeira aberta às 2h da manhã", angle: "flagrante noturno" },
  { title: "Profissões que parecem mentira", angle: "dossiê de carreiras absurdas" },
  { title: "Sonhos estranhos e o que eles 'revelam'", angle: "interpretação nada científica" },
  { title: "O primeiro encontro mais desastroso", angle: "relatório de ocorrência amorosa" },
  { title: "Se o seu pet tivesse um perfil secreto", angle: "investigação de pets" },
];

/** Day number in São Paulo (UTC-3) so the topic flips at local midnight. */
export function dayIndex(now: Date = new Date()): number {
  return Math.floor((now.getTime() - 3 * 3600_000) / 86_400_000);
}

export function topicForDate(now: Date = new Date()): DailyTopic {
  const day = dayIndex(now);
  // A coprime multiplier shuffles the topic order while keeping one stable draw per local day.
  const i = (((day * 5 + 3) % TOPICS.length) + TOPICS.length) % TOPICS.length;
  return TOPICS[i]!;
}
