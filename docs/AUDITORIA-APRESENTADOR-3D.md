# Auditoria do apresentador híbrido

## Validação inicial — 8 de novembro de 2026

- A página atual abriu no navegador sem erros de execução observados.
- Não existe Canvas 3D no apresentador atual. Corpo, cabeça, cenário e gato são imagens; não possuem skinning ou hierarquia de ossos.
- Os 33 testes existentes passaram. Esse resultado não valida animação esquelética, voz audível ou captura OBS.
- O plano foi aprovado com escolha de modelo gratuito compatível. Não apagar ou substituir recursos existentes por um modelo incompatível.

## Primeiro arquivo real inspecionado

**RobotExpressive**, de Tomás Laulhé, com modificações de Don McCurdy.

Proveniência:
- Arquivo: https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb
- Declaração de licença CC0 1.0: https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/RobotExpressive/README.md

O download temporário foi validado como GLB (assinatura `glTF`), com 463.988 bytes. Foram inspecionados JSON interno, skins, nomes de juntas, animações e nomes de morph targets. Não foi integrado ao aplicativo.

### Capacidades verificadas no arquivo

- Dois skins, com hierarquia contendo quadril, abdômen, torso, pescoço, cabeça, ombros, braços, antebraços, palmas, articulações de polegar/indicador/médio/anelar, pernas e pés.
- Somente as malhas das mãos contêm atributos `JOINTS_0` e `WEIGHTS_0`. Tronco, braços, pernas, pés e cabeça usam partes rígidas articuladas, não deformação contínua de uma malha humana. Portanto, a existência de dois skins não comprova skinning corporal completo.
- Clips: `Dance`, `Death`, `Idle`, `Jump`, `No`, `Punch`, `Running`, `Sitting`, `Standing`, `ThumbsUp`, `Walking`, `WalkJump`, `Wave`, `Yes`.
- Morph targets faciais: `Angry`, `Surprised`, `Sad`.

### Por que não é uma substituição compatível

- É um robô estilizado, não o apresentador humano renovado solicitado.
- Não há um conjunto completo de dedos humanos nomeados; não foi encontrado dedo mínimo na hierarquia.
- Não possui morph targets nomeados de piscar, sorriso ou visemas/abertura da boca. Não foi verificado controle independente de mandíbula e olhos.
- Os nomes `Sitting` e `Standing` não comprovam, sem execução visual, uma sequência de contato com cadeira ou entrada completa.
- Não fornece cinco danças distintas verificadas, nem interação com cadeira, mesa e gato.

**Conclusão:** demonstra disponibilidade de um recurso gratuito com esqueleto e clips, mas não satisfaz o contrato completo. Não recolorir esse robô e declarar a exigência humanoide atendida; não adicionar botões de movimentos ausentes.

## Gate para integração

Outro arquivo inspecionado, **CesiumMan** do catálogo Khronos, contém 19 juntas, uma animação sem nome e nenhum morph target. Não possui dedos articulados nem expressões faciais; sua licença declarada é CC-BY-4.0, não CC0. Foi descartado, sem integração ao aplicativo. Fonte: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CesiumMan

A integração depende de um arquivo gratuito cuja licença permita sua distribuição no aplicativo e que contenha o rig humanoide, skinning, expressões e animações exigidos, ou recursos compatíveis de autoria/retargeting verificáveis. O modelo deverá ser inspecionado antes de instalar e conectar um renderizador substituto.

Quando aprovado tecnicamente, armazenar o binário pelo fluxo de assets, manter os créditos e demonstrar visualmente caminhada, sentar e levantar antes de considerar a primeira etapa concluída. Não há personagem 3D concluído nesta auditoria.

## Resultado da pesquisa adicional

- Kenney Animated Characters Protagonists/Survivors declaram CC0 nas páginas oficiais, mas o download assinado retornou HTTP 403 no ambiente de inspeção. Não foi possível verificar esqueleto, malhas, morph targets e animações desses pacotes. Fonte: https://kenney.nl/assets/animated-characters-protagonists
- Quaternius Universal Base Characters declara CC0 na página do pacote, enquanto a licença geral atual possui restrições de redistribuição. Sem arquivo acessível acompanhado de licença específica inequívoca, não incorporar o modelo ao aplicativo. Fonte: https://quaternius.com/packs/universalbasecharacters.html e https://quaternius.com/license.html
- Os demais exemplos humanoides Khronos pesquisados possuem licenças diferentes de CC0 ou são demonstrações abstratas, não apresentadores completos.

**Bloqueio externo da etapa 1:** nenhum arquivo gratuito inspecionado reúne o contrato completo. É necessário obter um pacote gratuito acessível com licença específica e os recursos exigidos. Enviar um pacote candidato permite inspeção, mas não garante sua compatibilidade. As etapas de renderização, gato, integração e saída OBS permanecem pendentes; não foram simuladas como concluídas.