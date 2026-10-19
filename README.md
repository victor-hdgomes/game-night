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
- **Pacotes** (`/impostor/pacotes`): editor de categorias de palavras.

## Jogo do Impostor

Fluxo: montagem → revelação → discussão → votação → resultado → pódio.

- **Revelação na ordem da mesa**: cada um toca no próprio nome quando o
  celular chega na mão; quem já viu fica marcado.
- **Esqueci minha palavra**: na discussão dá para rever a própria carta em
  segredo.
- **Placar ao vivo**: botão no topo mostra ranking e histórico das rodadas
  sem revelar a rodada atual.
- **Partida persistida**: recarregar a página ou sair da tela não perde o
  placar (fica em `localStorage`).

### Configurações

Jogadores (3 a 20), número de impostores, pacotes usados, dica que o impostor
recebe (nada / categoria / primeira letra / palavra parecida), avisar ou não
que a pessoa é o impostor, mostrar a categoria para todos, rodada de dicas,
ordem de fala, votação dentro do app e chance de redenção. Dá para salvar
combinações como presets em **Minhas configurações**.

### Pontuação

| Situação | Pontos |
| --- | --- |
| Impostor pego | +2 para cada inocente |
| Impostor escapou | +3 para o impostor |
| Impostor pego que acerta a palavra | +2 para o impostor |

Empate na votação conta como impostor não descoberto.

## Pacotes de palavras

14 pacotes nativos (Lugares, Comidas, Animais, Profissões, Brasil, Games…),
só leitura. Para adaptar, duplique um nativo ou crie do zero: nome, ícone e
uma palavra por linha. Dá para importar e exportar JSON:

```json
[{ "name": "Meu pacote", "emoji": "🎯", "words": ["Um", "Dois"] }]
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
```

Novo jogo: adicione a entrada em `catalog.ts` e crie a rota com os organisms
correspondentes.
