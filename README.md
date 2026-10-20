# Sala de Jogos

Jogos de grupo para jogar com um aparelho só, no mesmo padrão de UI/UX do
projeto **monthly-budget** (Next.js + Tailwind v4 + shadcn/ui "new-york"
neutral, fonte Geist, tema escuro por padrão, componentes em
atoms/molecules/organisms/templates).

## Rodar

```bash
npm install
npm run dev     # http://localhost:3100
```

Outros scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

## O que tem hoje

- **Catálogo** (`/`): cards dos jogos; só o Impostor está jogável, o resto
  aparece como "Em breve".
- **Impostor** (`/impostor`): partida completa em um aparelho.
- **Impostor online** (`/online`): sala com código e QR; cada um joga no
  próprio celular.
- **Pacotes** (`/impostor/pacotes`): editor de categorias de palavras.

## Jogo do Impostor

Fluxo: montagem → revelação → discussão → votação → resultado → pódio.

- **Modos de conversa**: rodada de dicas (cada um fala uma palavra), rodada
  de perguntas estilo Spyfall (o app sorteia quem abre, quem responde vira o
  próximo a perguntar) ou conversa livre.
- **Revelação na ordem da mesa**: cada um toca no próprio nome quando o
  celular chega na mão; quem já viu fica marcado.
- **Esqueci minha palavra**: na discussão dá para rever a própria carta em
  segredo.
- **Placar ao vivo**: botão no topo mostra ranking e histórico das rodadas
  sem revelar a rodada atual.
- **Partida persistida**: recarregar a página ou sair da tela não perde o
  placar (fica em `localStorage`).

### Configurações

Jogadores (3 a 20), número de impostores, pacotes usados, dificuldade das
palavras (todas / só fáceis / só difíceis), dica que o impostor
recebe (nada / categoria / primeira letra / palavra parecida), avisar ou não
que a pessoa é o impostor, mostrar a categoria para todos, modo de conversa,
ordem de fala, votação dentro do app, segundo turno no empate, chance de
redenção, pontuação de cada desfecho e número de rodadas (0 = sem limite).

### Pontuação

| Situação | Pontos |
| --- | --- |
| Impostor pego | +2 para cada inocente |
| Impostor escapou | +3 para o impostor |
| Impostor pego que acerta a palavra | +2 para o impostor |

Esses valores são o padrão: cada partida pode mudar os três no setup.

Empate na votação abre um **segundo turno** só entre os mais votados (dá para
desligar); empate de novo solta o impostor.

## Modo online

Para jogar em chamada de vídeo, com cada um no seu aparelho.

1. O anfitrião abre `/online`, põe o nome e cria a sala.
2. A sala mostra um **código de 5 letras**, um **QR Code** e um link
   (`/online?code=XXXXX`) para compartilhar.
3. Quem entra pelo link ou pelo código aparece no lobby na hora (SSE).
4. O anfitrião define as regras e conduz as fases; cada jogador vê só a
   própria carta e vota no próprio celular. A votação fecha sozinha quando
   todo mundo vota.

**A sala dura 24h.** Depois disso o servidor apaga tudo — código, jogadores,
placar e palavras sorteadas. Salas vencidas também são varridas a cada
requisição.

### Como está implementado

- Regras e estado da sala: `src/lib/server/room-store.ts`.
- Onde a sala é guardada: `src/lib/server/room-storage.ts`, com duas
  implementações escolhidas pelas variáveis de ambiente:
  - **memória** (padrão, sem configuração) — morre com o processo e só serve
    para uma instância;
  - **Upstash Redis** — uma chave `game-night:room:<CODIGO>` por sala, com
    TTL nativo de 24h; é o modo necessário em serverless.
- Transporte: `POST /api/rooms`, `/api/rooms/[code]/join`,
  `/api/rooms/[code]/action` e um stream SSE em `/api/rooms/[code]/stream`.
  Em memória o stream é avisado na hora; com Redis ele relê a sala a cada 2s
  e só empurra quando o número de versão muda.
- O servidor manda para cada celular só a carta daquele jogador: a palavra e
  a lista de impostores nunca saem do servidor antes da revelação.

### Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | endpoint REST da database Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | token REST da mesma database |

Sem as duas, o app cai no modo memória (nenhuma configuração é obrigatória em
desenvolvimento). A integração Upstash da Vercel cria `KV_REST_API_URL` e
`KV_REST_API_TOKEN`, que o app também aceita. Veja `.env.example`.

**Na Vercel:** crie a database em [upstash.com](https://upstash.com) (ou pelo
marketplace da Vercel), copie as duas variáveis em *Settings → Environment
Variables* para Production/Preview/Development e redeploy.

## Pacotes de palavras

14 pacotes nativos (Lugares, Comidas, Animais, Profissões, Brasil, Games…),
só leitura. Para adaptar, duplique um nativo ou crie do zero: nome, ícone e
uma palavra por linha — termine a linha com `*` para marcar a palavra como
difícil. Dá para importar e exportar JSON:

```json
[
  {
    "name": "Meu pacote",
    "emoji": "🎯",
    "words": ["Um", { "text": "Dois", "level": "hard" }]
  }
]
```

Pacotes e presets ficam no `localStorage` do navegador — não há backend.

## Estrutura

```
src/app                      rotas (App Router)
src/components/ui            primitivos shadcn copiados do monthly-budget
src/components/molecules     blocos reaproveitáveis (OptionRow, Stepper)
src/components/organisms     telas do jogo
src/components/templates     AppShell (sidebar + bottom nav)
src/lib/games/catalog.ts     catálogo da home
src/lib/games/impostor       tipos, engine, pacotes e storage do jogo
src/lib/games/impostor/online  tipos e cliente (SSE) do modo online
src/lib/server/room-store.ts   regras da sala online
src/lib/server/room-storage.ts memória ou Upstash Redis (TTL de 24h)
src/app/api/rooms              rotas da sala online
```

Novo jogo: adicione a entrada em `catalog.ts` e crie a rota com os organisms
correspondentes.
