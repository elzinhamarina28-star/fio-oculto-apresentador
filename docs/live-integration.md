# Integração de voz e eventos — Fio Oculto LIVE

## Voz ElevenLabs

A aplicação usa o endpoint server-side `POST /api/tts`. A chave nunca deve ser colocada no frontend, em variáveis `VITE_*` ou commitada no Git.

1. Crie/abra uma API key no painel ElevenLabs.
2. No ambiente de deploy da aplicação (Lovable/Cloudflare, conforme o destino publicado), cadastre o secret `ELEVENLABS_API_KEY`.
3. Faça um novo deploy.
4. No painel do Fio Oculto, use **Testar voz** ou **Ouvir atrações do dia**.

Voz padrão selecionada: **Moutella — Brazilian Mentor** (`X3j2R63Qu4Gdv6dsU2hB`), português brasileiro conversacional. Modelo: `eleven_multilingual_v2`.

O endpoint limita o texto a 700 caracteres, não armazena o conteúdo e devolve áudio MP3. Se a chave não estiver configurada, retorna HTTP 503 com instrução de configuração. Não exponha a chave no navegador.

## Eventos do TikTok LIVE

A captura ainda não está conectada. Não há credencial, ferramenta ou provedor de eventos configurado neste repositório. Os eventos internos aceitam `source: "tiktok-live"`, mas isso não cria por si só uma conexão real.

Antes de ativar eventos reais:
- Escolher um provedor de captura compatível com a conta e o fluxo LIVE (por exemplo, TikFinity ou uma integração oficial disponível).
- Configurar um gateway autenticado server-side para comentários, follows, likes e gifts.
- Mapear o identificador e o nome reais de cada presente para a reação específica.
- Testar reconexão, duplicidade, rajadas de comentários e limites de fala.
- Nunca registrar tokens, cookies, chaves ou dados privados dos espectadores.

Não use eventos de demonstração como se fossem eventos reais.
