# Fio Oculto — Apresentador

Aplicação web para um apresentador virtual interativo de LIVE, com personagem em camadas, painel de controle e arquitetura preparada para eventos, fala e trilhas.

## Estado atual
- Apresentador visual com respiração, piscadas, gestos e expressões.
- Módulos de eventos, fila, cenas, Presenter Engine, SpeechQueue, MusicEngine e adaptador de integração.
- A demonstração manual não representa eventos reais do TikTok.
- Endpoint server-side de voz ElevenLabs preparado; ainda depende de secrets, voice ID e integração com a reprodução/OBS.
- Provedor real de TikTok LIVE, trilhas originais e personagem-gato rigado ainda dependem de implementação e/ou assets.

## Desenvolvimento
Requer Bun (recomendado, pois o repositório inclui bun.lock):

```sh
bun install --frozen-lockfile
bun run dev
```

## Verificações
```sh
bun run test
bun run lint
bun run build
```

GitHub Actions executa essas verificações em pushes para main/feat/**, pull requests para main e execução manual.

## Próximas etapas
Consulte [docs/ROADMAP-LIVE-INTERATIVA.md](docs/ROADMAP-LIVE-INTERATIVA.md).

## Sincronização com OBS
A rota `/broadcast` é a Browser Source limpa em 16:9. A arquitetura usa BroadcastChannel para comunicação entre abas compatíveis no mesmo navegador/perfil. Isso não substitui backend para sincronização entre dispositivos.

## Voz ElevenLabs
O endpoint seguro está documentado em [docs/CONFIGURAR-VOZ-ELEVENLABS.md](docs/CONFIGURAR-VOZ-ELEVENLABS.md). Não configure credenciais no código ou no GitHub; use secrets do ambiente de deploy.

## Lovable
Projeto conectado: https://lovable.dev/projects/569f1805-c96e-435b-aea6-a8febc61bd49
