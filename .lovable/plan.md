# Integração dos sons do Fio Oculto

## Análise atual
- O projeto ainda **não tem nenhum áudio**. Não há pasta de sons nem referências a MP3.
- Já existe a estrutura do Motor de música (trilhas com volume próprio, repetição, troca suave e volume reduzido quando o apresentador fala), mas ela ainda não tem faixas cadastradas.
- Só há uma cena ("Estúdio").

## Conteúdo do pacote (50 arquivos)
- **3 com erro e descartados**: `AUD-20261105-WA0047.mp3`, `WA0047(1)` e `WA0047(2)` (0,08 s cada).
- **47 válidos**, entre 48 s e 3 min, todos serão integrados com os nomes originais, na ordem dos números (WA0000 → WA0052).
- **Cópias idênticas, mantidas como você pediu**: WA0015 e WA0015(1), WA0018 e WA0018(1), WA0037 e WA0037(1), WA0039 e WA0039(1).
- WA0000 e WA0005 têm o mesmo tamanho, mas **conteúdo diferente**: são duas faixas distintas.
- Atenção: sua lista tem 46 links do Suno (alguns repetidos) e há 47 arquivos válidos. Não dá para ligar cada arquivo a um link com certeza, então os nomes originais dos arquivos são a referência.

## Como será feita a integração
1. Cada MP3 válido é enviado para o armazenamento de arquivos do projeto. No código fica só um pequeno arquivo de referência por som (o GitHub não recebe arquivos pesados e não há divergência).
2. Uma lista única de sons, na ordem original, com nome, duração e se a faixa repete.
3. O Motor de música passa a conhecer essas 47 faixas.
4. O painel ganha uma seção "Músicas" para ouvir cada faixa, parar, ajustar o volume de cada uma, ajustar o volume geral e silenciar.
5. A cena "Estúdio" não recebe trilha automática até você escolher qual faixa usar. Nada mais no painel ou no apresentador muda.

## Verificação
- Teste automático: confere que existem exatamente 47 faixas, na ordem certa, sem os 3 arquivos com erro, e com as 4 cópias mantidas.
- Teste no navegador: cada uma das 47 faixas é carregada e começa a tocar, com um relatório de qualquer falha.

## Arquivos
Novos:
- `src/assets/audio/AUD-20261105-WA00xx.mp3.asset.json` (47 referências)
- `src/lib/engine/tracks.ts` (lista ordenada)
- `src/components/presenter/MusicPanel.tsx`
- `src/test/tracks.test.ts`

Alterados:
- `src/lib/engine/music-engine.ts` (tocar uma faixa para teste)
- `src/routes/index.tsx` (mostrar a seção Músicas no painel)

## Pergunta em aberto
Qual faixa deve tocar automaticamente na cena "Estúdio"? Pode ficar para depois.
