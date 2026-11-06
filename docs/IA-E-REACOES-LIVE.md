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

O servidor que hospeda a aplicação precisa receber `ELEVENLABS_API_KEY` como segredo de ambiente. Opcionalmente, configure `ELEVENLABS_VOICE_ID` para escolher outra voz. Um Secret cadastrado apenas no GitHub Actions não é automaticamente enviado ao servidor do Lovable. Nunca coloque a chave em código frontend, em variáveis `VITE_*` ou em arquivos do repositório.

O primeiro clique em **Ativar áudio** libera o áudio do navegador. Depois, **Testar voz** faz uma chamada real ao endpoint e consome os créditos/limites da conta ElevenLabs.

## TikFinity — eventos reais

A captura não é automática. Para conectar:

1. O aplicativo TikFinity Desktop precisa estar aberto no mesmo computador que executa o OBS e a página do overlay.
2. O Event API / WebSocket local do TikFinity precisa estar habilitado e disponível na porta `21213`.
3. A Central de inteligência conecta ao endereço local `ws://localhost:21213/`.
4. O painel mostra separadamente o estado do socket e o último evento recebido; estar conectado não prova, sozinho, que os eventos estão chegando.
5. Os tipos tratados pelo código são `chat`, `like`, `follow`, `social` (quando a ação é follow) e `gift`. `share`, `roomUser` e `subscribe` ainda não disparam reações.

O endpoint `ws://localhost:21213/` e a exigência de executar o TikFinity Desktop no mesmo computador são documentados pelo próprio TikFinity. Se a prévia hospedada não conseguir acessar o serviço local, teste o overlay como Browser Source do OBS no mesmo PC; não exponha a porta local à internet nem cole tokens ou cookies no painel.

O estado conectado confirma apenas o WebSocket local. A confirmação de que os eventos reais estão chegando depende de uma LIVE ativa e de um teste observado no painel.

## Reações

O registro central fica em `src/lib/engine/gifts.ts`. Cada presente pode definir animação, expressão, efeito de palco, som e orientação para a fala da IA. Presentes desconhecidos recebem fallback por faixa de valor.

A investigação do perfil usa somente o apelido enviado pelo evento e produz uma brincadeira explicitamente fictícia; não acessa nem infere dados privados do espectador.

## Música e assets

Os 47 manifests de áudio em `src/assets/audio/` e o player musical foram preservados. Esta implementação não altera, move ou remove nenhum arquivo de música.

## Limites conhecidos

- O painel de demonstração usa eventos marcados como `demo`; eles não são eventos reais.
- TikFinity Desktop e o overlay precisam executar no mesmo computador para a Event API local.
- A utilização real do TikTok LIVE e de Presentes depende da elegibilidade e dos requisitos de idade do TikTok; mantenha a demonstração para testes se a conta não for elegível.
- O navegador precisa permitir o áudio após o clique em **Ativar áudio**.
- A movimentação da boca acompanha o nível do áudio, como aproximação visual; não é sincronização fonética por visemas.
- Não publicar/deploy automaticamente. Validar a prévia e o áudio no OBS antes de uma transmissão real.
