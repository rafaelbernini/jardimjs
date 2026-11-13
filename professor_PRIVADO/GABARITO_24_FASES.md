# Gabarito do professor — Jardim do JavaScript

**24 fases**. Cada exemplo abaixo foi elaborado para percorrer o mapa e demonstrar o conceito previsto.

## 01 — Primeiro contato
**Conteúdo:** Chamadas de funções  
**Objetivo:** Leve o robô até o portal, duas casas à direita.

```javascript
direita();
direita();
```

## 02 — Um comando, vários passos
**Conteúdo:** Argumentos  
**Objetivo:** Avance quatro casas usando apenas um comando com número.

```javascript
direita(4);
```

## 03 — Virando a esquina
**Conteúdo:** Sequência de instruções  
**Objetivo:** Suba duas casas e depois siga três casas à direita.

```javascript
cima(2);
direita(3);
```

## 04 — Energia encontrada
**Conteúdo:** Coleta de objetos  
**Objetivo:** Pegue a bateria no caminho e chegue até o portal.

```javascript
direita(2);
coletar();
direita(2);
```

## 05 — Desafio em zigue-zague
**Conteúdo:** Ordem e coleta  
**Objetivo:** Colete as duas baterias e siga até o portal.

```javascript
cima(2);
coletar();
direita(3);
coletar();
cima();
```

## 06 — A muralha de pedra
**Conteúdo:** Planejamento de rotas  
**Objetivo:** Contorne as pedras, recupere a bateria e encontre a saída.

```javascript
direita();
cima();
direita(2);
coletar();
direita(3);
baixo();
```

## 07 — Energia constante
**Conteúdo:** const  
**Objetivo:** Guarde o número 5 em uma constante e use-o para caminhar.

```javascript
const passos = 5;
direita(passos);
```

## 08 — Contando caminhos
**Conteúdo:** let e reatribuição  
**Objetivo:** Use uma variável let para dar dois blocos de dois passos.

```javascript
let passos = 2;
direita(passos);
passos = 2;
direita(passos);
```

## 09 — Bateria inteligente
**Conteúdo:** if  
**Objetivo:** Use if e bateriaAqui() para pegar a bateria antes de sair.

```javascript
cima(2);
if (bateriaAqui()) {
  coletar();
}
direita(3);
```

## 10 — Escolha um caminho
**Conteúdo:** if / else  
**Objetivo:** A direita está bloqueada: use if / else para escolher outro caminho.

```javascript
if (livre("direita")) {
  direita();
} else {
  cima();
}
direita(4);
```

## 11 — Condições combinadas
**Conteúdo:** Operador &&  
**Objetivo:** Use && para verificar duas condições antes de avançar e coletar.

```javascript
if (livre("direita") && !bateriaAqui()) {
  direita(2);
}
coletar();
direita(2);
```

## 12 — Painel de energia
**Conteúdo:** Sensores e ações  
**Objetivo:** Acesse o painel, ative-o e conclua o trajeto.

```javascript
const passos = 2;
direita(passos);
if (painelAqui()) {
  ativar();
}
direita(3);
```

## 13 — O primeiro for
**Conteúdo:** Laço for  
**Objetivo:** Avance cinco casas usando um laço for.

```javascript
for (let i = 0; i < 5; i++) {
  direita();
}
```

## 14 — Agora com while
**Conteúdo:** Laço while  
**Objetivo:** Utilize while para repetir quatro movimentos.

```javascript
let passos = 0;
while (passos < 4) {
  direita();
  passos++;
}
```

## 15 — Linha de baterias
**Conteúdo:** for com coleta  
**Objetivo:** Colete as três baterias da linha usando um laço for.

```javascript
for (let i = 0; i < 3; i++) {
  direita();
  coletar();
  direita();
}
```

## 16 — Subida repetida
**Conteúdo:** Laços encadeados  
**Objetivo:** Suba quatro vezes e avance quatro vezes usando for.

```javascript
for (let i = 0; i < 4; i++) { cima(); }
for (let i = 0; i < 4; i++) { direita(); }
```

## 17 — Até encontrar a parede
**Conteúdo:** while com sensor  
**Objetivo:** Caminhe à direita enquanto o caminho estiver livre.

```javascript
while (livre("direita")) {
  direita();
}
```

## 18 — Coleta automática
**Conteúdo:** for + if  
**Objetivo:** Com for e if, caminhe até as três baterias e colete cada uma.

```javascript
for (let i = 0; i < 3; i++) {
  direita(2);
  if (bateriaAqui()) { coletar(); }
}
```

## 19 — Minhas próprias instruções
**Conteúdo:** Declaração de função  
**Objetivo:** Crie uma função chamada avancar e use-a duas vezes.

```javascript
function avancar() {
  direita(2);
}
avancar();
avancar();
```

## 20 — Função com parâmetro
**Conteúdo:** Parâmetros  
**Objetivo:** Crie uma função com parâmetro que mova o robô cinco casas.

```javascript
function andar(quantidade) {
  direita(quantidade);
}
andar(5);
```

## 21 — Mapa em um array
**Conteúdo:** Arrays + for...of  
**Objetivo:** Crie um array com movimentos e percorra-o com for...of.

```javascript
const movimentos = ["cima", "cima", "direita", "direita", "direita"];
for (const movimento of movimentos) {
  if (movimento === "cima") cima();
  else direita();
}
```

## 22 — Tamanho da lista
**Conteúdo:** Propriedade .length  
**Objetivo:** Use .length para controlar quantas vezes avançar.

```javascript
const passos = [1, 2, 3, 4, 5];
for (let i = 0; i < passos.length; i++) {
  direita();
}
```

## 23 — Plano de navegação
**Conteúdo:** Função + array  
**Objetivo:** Crie uma função para percorrer um array de direções, colete as baterias e ative o painel.

```javascript
function seguirRota(rota) {
  for (const direcao of rota) {
    if (direcao === "direita") direita();
    else if (direcao === "cima") cima();
  }
}
seguirRota(["direita", "direita", "direita"]);
coletar();
seguirRota(["direita", "direita", "direita"]);
coletar();
cima(2);
ativar();
cima();
```

## 24 — O grande jardim
**Conteúdo:** Desafio final: integrar conceitos  
**Objetivo:** Use função, array e repetição para coletar duas baterias, ativar o painel e chegar ao portal.

```javascript
const trechos = [2, 2];
function andarDireita(n) {
  for (let i = 0; i < n; i++) { direita(); }
}
andarDireita(trechos[0]);
coletar();
cima(2);
andarDireita(trechos[1]);
coletar();
direita();
ativar();
direita();
cima(2);
```
