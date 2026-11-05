# Reprodução musical por cena no OBS

A saída `/broadcast` agora monta `SceneMusicPlayer`. O painel principal envia o identificador da cena pelo `BroadcastChannel`; a Browser Source do OBS recebe o evento e seleciona a faixa correspondente.

## Cenas configuradas

| Cena | Faixa | Reprodução |
|---|---|---|
| Investigação | 11 — Sala de Investigação | Loop |
| Dossiê | 12 — Arquivo Secreto | Loop |
| Conversa | 13 — Café com Suspeita | Loop |
| Modo Caos | 14 — Teoria Maluca | Loop |
| Gato | 15 — O Gato Está Observando | Loop |
| Transição | 19 — Intervalo Curioso | Uma vez |
| Descoberta | 17 — Pista Encontrada | Uma vez |
| Encerramento | 20 — Encerramento em Aberto | Uma vez |

As faixas 16 — Virada de Roteiro e 18 — Modo Conversa permanecem catalogadas para acionamento por evento/estado específico. A associação automática será feita quando esses eventos estiverem definidos.

## Arquivos de áudio

O player espera estes nomes em `public/audio/`:

- `11-sala-de-investigacao.mp3`
- `12-arquivo-secreto.mp3`
- `13-cafe-com-suspeita.mp3`
- `14-teoria-maluca.mp3`
- `15-o-gato-esta-observando.mp3`
- `16-virada-de-roteiro.mp3`
- `17-pista-encontrada.mp3`
- `18-modo-conversa.mp3`
- `19-intervalo-curioso.mp3`
- `20-encerramento-em-aberto.mp3`

**Importante:** o player e o roteamento estão implementados, mas os MP3 ainda precisam ser adicionados a `public/audio/`. Enquanto um arquivo não existir, o player exibe o estado de arquivo ausente em vez de declarar a reprodução como pronta.

## Limitações atuais

- O controle por `BroadcastChannel` funciona entre painel e Browser Source no mesmo navegador/perfil.
- O player inicia a reprodução quando recebe uma mudança de cena; o navegador/OBS pode exigir permissão de áudio/autoplay.
- O volume inicial é 18%. A redução automática durante a fala (ducking) e o crossfade ainda não estão implementados.
- A validação final exige testar com os arquivos MP3 reais dentro do OBS Studio.
