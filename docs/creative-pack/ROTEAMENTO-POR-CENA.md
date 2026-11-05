# Roteamento musical por cena

O arquivo `src/lib/engine/music-scenes.ts` registra a associação inicial entre cenas e trilhas. O roteamento está separado dos arquivos de áudio para permitir validar a lógica sem MP3 presentes.

| Cena | Faixa | Uso |
|---|---:|---|
| Investigação | 11 — Sala de Investigação | Fundo em loop |
| Conversa | 13 — Café com Suspeita | Fundo em loop |
| Gato | 15 — O Gato Está Observando | Fundo em loop |
| Dossiê | 12 — Arquivo Secreto | Fundo em loop |
| Modo Caos | 14 — Teoria Maluca | Fundo em loop |
| Transição | 19 — Intervalo Curioso | Vinheta sem loop |
| Descoberta | 17 — Pista Encontrada | Vinheta sem loop |
| Encerramento | 20 — Encerramento em Aberto | Sem loop, depende do áudio final |

As faixas 16 e 18 permanecem no catálogo como trilhas de evento/estado: Virada de Roteiro e Modo Conversa. Não foram atribuídas a uma cena automática até existir um evento ou regra de cena correspondente.

**Pendente antes de tocar áudio:** adicionar os MP3 finais em `public/audio/`, preencher os caminhos dos assets, e implementar/validar o player com crossfade e ducking sincronizado à SpeechQueue. Nenhum MP3 foi copiado para o repositório nesta alteração.
