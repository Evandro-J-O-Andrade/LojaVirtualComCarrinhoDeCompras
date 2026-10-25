# Angel Cosméticos — borboletas animadas na hero

## Arquivos
- `BorboletasHero.tsx`: componente decorativo SVG, sem GIFs ou imagens externas.
- `borboletas-hero.css`: trajetórias, batimento das asas, responsividade e reduced motion.
- `HeroCinematico.integration.patch`: pequeno patch para importar e inserir a camada na hero.

## Integração
1. Copie `BorboletasHero.tsx` e `borboletas-hero.css` para `web/src/domains/home/components/`.
2. Confira o patch de integração contra a versão local de `HeroCinematico.tsx`; aplique-o somente se os trechos de contexto corresponderem.
3. Insira a camada depois do fundo cinematográfico e antes do container do conteúdo. O container e os controles devem usar `z-10`, mantendo as borboletas abaixo de cards, textos e CTAs.
4. Execute na pasta `web`: `npm run test:run`, `npm run lint` e `npm run build`.

## Comportamento
- Quatro trajetórias distintas no desktop e duas no mobile.
- SVG inline, sem arquivos de mídia, bibliotecas extras ou chamadas de rede.
- `pointer-events: none` e `aria-hidden` impedem interferência em cliques e leitores de tela.
- A camada é desativada com `prefers-reduced-motion: reduce`.

Este pacote contém a implementação proposta, mas não altera o repositório nem afirma que os testes foram executados.
