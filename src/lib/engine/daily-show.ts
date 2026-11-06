/** Daily audience segments. Stable for the day in the live's local timezone. */
export type DailySegment = { date: string; topic: string; challenge: string; storyStarter: string };
const SEGMENTS: Omit<DailySegment, "date">[] = [
  { topic: "Se os objetos da sua casa pudessem falar, qual entregaria seus segredos primeiro?", challenge: "Defenda por 20 segundos um objeto completamente inútil como se fosse uma invenção milionária.", storyStarter: "Era uma terça-feira normal até a geladeira pedir demissão..." },
  { topic: "Qual talento absurdo seria totalmente inútil numa competição?", challenge: "Invente um talento impossível para o apresentador e convença o chat de que ele é real.", storyStarter: "O gato entrou no estúdio usando crachá e exigiu falar com a gerência..." },
  { topic: "Quem sobreviveria melhor: alguém que nunca perde a calma ou alguém que sempre tem um plano?", challenge: "O chat escolhe duas pessoas fictícias; o apresentador narra uma disputa de argumentos.", storyStarter: "O elevador parou entre andares e anunciou que só subiria depois de ouvir uma piada..." },
  { topic: "Se sua vida tivesse um narrador, em qual momento ele pediria férias?", challenge: "Conte uma situação cotidiana como se fosse a final de um campeonato mundial.", storyStarter: "O controle remoto desapareceu e deixou uma carta dizendo: não me procurem..." },
  { topic: "Qual regra maluca melhoraria (ou pioraria) uma cidade inteira?", challenge: "Crie uma lei absurda e deixe o chat votar se ela seria aprovada.", storyStarter: "À meia-noite, todas as placas da cidade começaram a dar conselhos..." },
  { topic: "É melhor ter sempre a resposta certa ou sempre a pergunta mais inesperada?", challenge: "Faça uma pergunta tão criativa que o chat precise inventar uma teoria coletiva.", storyStarter: "A campainha tocou. Do lado de fora havia apenas um bilhete: 'vocês foram escolhidos'..." },
  { topic: "Qual comida seria a pior chefe de uma empresa?", challenge: "Faça o discurso de contratação de uma pizza para diretora financeira.", storyStarter: "A última fatia de pizza convocou uma reunião extraordinária..." },
];
function localDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function getDailySegment(date = new Date()): DailySegment {
  const key = localDate(date);
  return { date: key, ...SEGMENTS[hash(key) % SEGMENTS.length] };
}
export function getGiftShow(giftName = "", giftId = "") {
  const key = (giftName + " " + giftId).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/lion|leao|leão/.test(key)) return { kind: "wow" as const, line: "UM LEÃO NO ESTÚDIO?! Alguém avisa a produção!" };
  if (/rose|rosa/.test(key)) return { kind: "dance" as const, line: "Uma rosa! O apresentador já quer abrir um jardim cenográfico!" };
  if (/galaxy|universo|planet/.test(key)) return { kind: "detective" as const, line: "Presente intergaláctico! Investigação em outra dimensão!" };
  if (/coffee|cafe|café/.test(key)) return { kind: "laugh" as const, line: "Café recebido! Agora vai falar até com as paredes!" };
  if (/heart|coracao|coração/.test(key)) return { kind: "happy" as const, line: "Chegou carinho! O coração cenográfico não estava preparado!" };
  if (/cat|gato|paw|pata/.test(key)) return { kind: "catbite" as const, line: "GATO! TIRA ESSE GATO DO MEU MICROFONE!" };
  const kinds = ["wow", "dance", "laugh", "detective", "suspicious"] as const;
  const seed = hash(key || "misterio");
  const lines = ["Presente misterioso! A produção perdeu o roteiro!", "Isso desbloqueou um acontecimento inesperado!", "O arquivo Fio Oculto acaba de ganhar uma nova ocorrência!", "Alerta de presente! O apresentador está tentando entender!", "Atenção, chat: isso merece uma teoria!"];
  return { kind: kinds[seed % kinds.length], line: lines[seed % lines.length] };
}
