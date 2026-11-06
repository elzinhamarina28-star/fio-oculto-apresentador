# IA e reações da LIVE — Fio Oculto

## O que esta branch integra

- Painel **Central de inteligência · LIVE** dentro do overlay.
- IA conversacional server-side por `hostSpeak` e Lovable AI Gateway.
- Voz ElevenLabs pela rota server-side `POST /api/tts`.
- Fila de fala para evitar sobreposição e botão para interromper a fila.
- Ativação de áudio por clique do operador (necessária para a política de autoplay do navegador).
- Indicador de volume do áudio para movimentar a boca do personagem.
- Arte do gato preto existente em `src/assets/presenter/cat.png`, com animações de patrulha, corrida e mordida.
- Assunto diário em horário de São Paulo, perguntas, histórias, desafios, surpresa e investigação fictícia de apelido.
- Conector local TikFinity por WebSocket, com estado de conexão, timeout e desconexão manual.
- Mapeamento de nome e ID de presente para reação visual e efeito sonoro próprios.

## Configuração de voz

O servidor precisa de `ELEVENLABS_API_KEY`. Opcionalmente, configure `ELEVENLABS_VOICE_ID` para escolher outra voz. Nunca coloque a chave em código frontend, em variáveis `VITE_*` ou no GitHub.

O primeiro clique em **Ativar áudio** libera o áudio do navegador. Depois, **Testar voz** faz uma chamada real ao endpoint e consome os créditos/limites da conta ElevenLabs.

## TikFinity — eventos reais

A captura não é automática. Para conectar:

1. Abra o TikFinity no mesmo computador que executa a página/OBS.
2. Conecte o TikFinity à conta e à LIVE.
3. Confirme que o WebSocket local está habilitado na porta `21213`.
4. Na Central de inteligência, clique em **Conectar TikFinity**.
5. Confirme o estado conectado e faça um teste com comentário ou presente real de baixo impacto.

O overlay conecta em `ws://localhost:21213/`. Em uma página HTTPS, o navegador/ambiente pode bloquear WebSocket local inseguro; se isso ocorrer, será necessário um gateway local compatível com WSS ou uma configuração de navegador/OBS adequada. Não cole tokens ou cookies do TikTok no painel.

O estado conectado confirma apenas o WebSocket local. A confirmação de que os eventos reais estão chegando depende de uma LIVE ativa e de um teste observado no painel.

## Reações

O registro central fica em `src/lib/engine/gifts.ts`. Cada presente pode definir animação, expressão, efeito de palco, som e orientação para a fala da IA. Presentes desconhecidos recebem fallback por faixa de valor.

A investigação do perfil usa somente o apelido enviado pelo evento e produz uma brincadeira explicitamente fictícia; não acessa nem infere dados privados do espectador.

## Música e assets

Os 47 manifests de áudio em `src/assets/audio/` e o player musical foram preservados. Esta implementação não altera, move ou remove nenhum arquivo de música.

## Limites conhecidos

- O painel de demonstração usa eventos marcados como `demo`; eles não são eventos reais.
- TikFinity precisa estar instalado/aberto e conectado à LIVE no computador do operador.
- O navegador precisa permitir o áudio após o clique em **Ativar áudio**.
- A movimentação da boca acompanha o nível do áudio, como aproximação visual; não é sincronização fonética por visemas.
- Não publicar/deploy automaticamente. Validar a prévia e o áudio no OBS antes de uma transmissão real.
