/* JARDIM DO JAVASCRIPT · 24 fases + 4 desafios opcionais */
window.JARDIM_NIVEIS = [
  {
    "id": 1,
    "title": "Primeiro contato",
    "world": 1,
    "subject": "Chamadas de funções",
    "mission": "Leve o robô até o portal, duas casas à direita.",
    "start": [
      1,
      2
    ],
    "goal": [
      3,
      2
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [],
    "starter": "// Nível 01 · Primeiro contato\n// Escreva seu código abaixo.\n\n",
    "hint": "Cada direita() move uma casa.",
    "hint2": "Escreva direita(); em duas linhas.",
    "brief": "Cada comando move uma casa: siga duas casas à direita até o portal."
  },
  {
    "id": 2,
    "title": "Um comando, vários passos",
    "world": 1,
    "subject": "Argumentos",
    "mission": "Avance quatro casas usando apenas um comando com número.",
    "start": [
      0,
      1
    ],
    "goal": [
      4,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "argumento"
    ],
    "starter": "// Nível 02 · Um comando, vários passos\n// Escreva seu código abaixo.\n\n",
    "hint": "O número dentro dos parênteses indica quantos passos.",
    "hint2": "Experimente direita(4);",
    "brief": "Informe a quantidade de passos entre parênteses para andar quatro casas à direita."
  },
  {
    "id": 3,
    "title": "Virando a esquina",
    "world": 1,
    "subject": "Sequência de instruções",
    "mission": "Suba duas casas e depois siga três casas à direita.",
    "start": [
      1,
      3
    ],
    "goal": [
      4,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [
      [
        2,
        2
      ],
      [
        3,
        2
      ]
    ],
    "requires": [],
    "starter": "// Nível 03 · Virando a esquina\n// Escreva seu código abaixo.\n\n",
    "hint": "A ordem dos comandos importa.",
    "hint2": "Primeiro cima(2);, depois direita(3);",
    "brief": "Primeiro suba duas casas; depois vá três casas à direita. Não atravesse as pedras."
  },
  {
    "id": 4,
    "title": "Energia encontrada",
    "world": 1,
    "subject": "Coleta de objetos",
    "mission": "Pegue a bateria no caminho e chegue até o portal.",
    "start": [
      1,
      2
    ],
    "goal": [
      5,
      2
    ],
    "batteries": [
      [
        3,
        2
      ]
    ],
    "switches": [],
    "rocks": [],
    "requires": [],
    "starter": "// Nível 04 · Energia encontrada\n// Escreva seu código abaixo.\n\n",
    "hint": "Você só pode coletar quando estiver sobre a bateria.",
    "hint2": "Ande 2, use coletar() e ande mais 2.",
    "brief": "Vá duas casas à direita, colete a bateria e só então continue até o portal."
  },
  {
    "id": 5,
    "title": "Desafio em zigue-zague",
    "world": 1,
    "subject": "Ordem e coleta",
    "mission": "Colete as duas baterias e siga até o portal.",
    "start": [
      0,
      4
    ],
    "goal": [
      3,
      1
    ],
    "batteries": [
      [
        0,
        2
      ],
      [
        3,
        2
      ]
    ],
    "switches": [],
    "rocks": [],
    "requires": [],
    "starter": "// Nível 05 · Desafio em zigue-zague\n// Escreva seu código abaixo.\n\n",
    "hint": "O caminho passa por (0,2) e (3,2).",
    "hint2": "Suba 2, colete, vá à direita 3, colete e suba 1.",
    "brief": "Suba até a primeira bateria, colete, siga à direita até a segunda e colete. Depois suba ao portal."
  },
  {
    "id": 6,
    "title": "A muralha de pedra",
    "world": 1,
    "subject": "Planejamento de rotas",
    "mission": "Contorne as pedras, recupere a bateria e encontre a saída.",
    "start": [
      0,
      2
    ],
    "goal": [
      6,
      2
    ],
    "batteries": [
      [
        3,
        1
      ]
    ],
    "switches": [],
    "rocks": [
      [
        2,
        2
      ],
      [
        3,
        2
      ],
      [
        4,
        2
      ]
    ],
    "requires": [],
    "starter": "// Nível 06 · A muralha de pedra\n// Escreva seu código abaixo.\n\n",
    "hint": "Existe uma passagem segura acima das pedras.",
    "hint2": "Comece com direita(); cima(); e contorne pela linha 1.",
    "brief": "A passagem central tem pedras. Procure o caminho por cima, recolha a bateria e contorne a muralha até a saída."
  },
  {
    "id": 7,
    "title": "Energia constante",
    "world": 2,
    "subject": "const",
    "mission": "Guarde o número 5 em uma constante e use-o para caminhar.",
    "start": [
      0,
      1
    ],
    "goal": [
      5,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "const"
    ],
    "starter": "// Nível 07 · Energia constante\n// Escreva seu código abaixo.\n\n",
    "hint": "Uma constante guarda um valor: const passos = 5;",
    "hint2": "Depois use direita(passos);",
    "brief": "Crie uma constante com o valor 5 e use seu nome como quantidade de passos para a direita."
  },
  {
    "id": 8,
    "title": "Contando caminhos",
    "world": 2,
    "subject": "let e reatribuição",
    "mission": "Use uma variável let para dar dois blocos de dois passos.",
    "start": [
      0,
      3
    ],
    "goal": [
      4,
      3
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "let"
    ],
    "starter": "// Nível 08 · Contando caminhos\n// Escreva seu código abaixo.\n\n",
    "hint": "let permite guardar e alterar um valor.",
    "hint2": "Faça let passos = 2; e chame direita(passos) duas vezes.",
    "brief": "Crie uma variável let com o valor 2. Use-a em dois deslocamentos à direita."
  },
  {
    "id": 9,
    "title": "Bateria inteligente",
    "world": 2,
    "subject": "if",
    "mission": "Use if e bateriaAqui() para pegar a bateria antes de sair.",
    "start": [
      1,
      3
    ],
    "goal": [
      4,
      1
    ],
    "batteries": [
      [
        1,
        1
      ]
    ],
    "switches": [],
    "rocks": [],
    "requires": [
      "if"
    ],
    "starter": "// Nível 09 · Bateria inteligente\n// Escreva seu código abaixo.\n\n",
    "hint": "bateriaAqui() só retorna true quando o robô está na mesma casa da bateria. Primeiro suba duas casas; depois execute o if. Use parênteses no sensor e chaves no bloco.",
    "hint2": "cima(2);\nif (bateriaAqui()) {\n  coletar();\n}\ndireita(3);",
    "brief": "Suba duas casas até a bateria (coluna 2, linha 2). Só então teste if (bateriaAqui()) e execute coletar() dentro das chaves. Depois vá três casas à direita."
  },
  {
    "id": 10,
    "title": "Escolha um caminho",
    "world": 2,
    "subject": "if / else",
    "mission": "A direita está bloqueada: use if / else para escolher outro caminho.",
    "start": [
      0,
      2
    ],
    "goal": [
      4,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [
      [
        1,
        2
      ]
    ],
    "requires": [
      "if",
      "else"
    ],
    "starter": "// Nível 10 · Escolha um caminho\n// Escreva seu código abaixo.\n\n",
    "hint": "livre(\"direita\") testa se o caminho está desocupado.",
    "hint2": "if (livre(\"direita\")) {\n  direita();\n} else {\n  cima();\n  direita(4);\n}",
    "brief": "Verifique livre(\"direita\") com if. Como há uma pedra, use else para escolher o desvio por cima."
  },
  {
    "id": 11,
    "title": "Condições combinadas",
    "world": 2,
    "subject": "Operador &&",
    "mission": "Use && para verificar duas condições antes de avançar e coletar.",
    "start": [
      0,
      4
    ],
    "goal": [
      4,
      4
    ],
    "batteries": [
      [
        2,
        4
      ]
    ],
    "switches": [],
    "rocks": [],
    "requires": [
      "and",
      "if"
    ],
    "starter": "// Nível 11 · Condições combinadas\n// Escreva seu código abaixo.\n\n",
    "hint": "&& significa E: as duas condições devem ser verdadeiras.",
    "hint2": "direita(2);\nif (bateriaAqui() && livre(\"direita\")) {\n  coletar();\n}\ndireita(2);",
    "brief": "Vá até a bateria. Combine duas verificações com && dentro de if antes de coletar; depois continue à direita."
  },
  {
    "id": 12,
    "title": "Painel de energia",
    "world": 2,
    "subject": "Sensores e ações",
    "mission": "Acesse o painel, ative-o e conclua o trajeto.",
    "start": [
      0,
      2
    ],
    "goal": [
      5,
      2
    ],
    "batteries": [],
    "switches": [
      [
        2,
        2
      ]
    ],
    "rocks": [],
    "requires": [
      "const",
      "if"
    ],
    "starter": "// Nível 12 · Painel de energia\n// Escreva seu código abaixo.\n\n",
    "hint": "painelAqui() verifica se o robô está sobre um painel.",
    "hint2": "const passos = 2;\ndireita(passos);\nif (painelAqui()) {\n  ativar();\n}\ndireita(3);",
    "brief": "Vá ao painel. Use uma constante e if com painelAqui() para decidir quando ativar; depois siga à direita."
  },
  {
    "id": 13,
    "title": "O primeiro for",
    "world": 3,
    "subject": "Laço for",
    "mission": "Avance cinco casas usando um laço for.",
    "start": [
      0,
      2
    ],
    "goal": [
      5,
      2
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "for"
    ],
    "starter": "// Nível 13 · O primeiro for\n// Escreva seu código abaixo.\n\n",
    "hint": "for (let i = 0; i < 5; i++) repete cinco vezes.",
    "hint2": "Coloque direita(); dentro das chaves do for.",
    "brief": "Use for para repetir cinco vezes um movimento à direita. Cada repetição deve mover uma casa."
  },
  {
    "id": 14,
    "title": "Agora com while",
    "world": 3,
    "subject": "Laço while",
    "mission": "Utilize while para repetir quatro movimentos.",
    "start": [
      0,
      1
    ],
    "goal": [
      4,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "while"
    ],
    "starter": "// Nível 14 · Agora com while\n// Escreva seu código abaixo.\n\n",
    "hint": "while repete enquanto a condição for verdadeira.",
    "hint2": "Comece com let passos = 0; e incremente passos++ no laço.",
    "brief": "Crie um contador e use while para andar quatro casas à direita. Atualize o contador para o laço terminar."
  },
  {
    "id": 15,
    "title": "Linha de baterias",
    "world": 3,
    "subject": "for com coleta",
    "mission": "Colete as três baterias da linha usando um laço for.",
    "start": [
      0,
      2
    ],
    "goal": [
      6,
      2
    ],
    "batteries": [
      [
        1,
        2
      ],
      [
        3,
        2
      ],
      [
        5,
        2
      ]
    ],
    "switches": [],
    "rocks": [],
    "requires": [
      "for"
    ],
    "starter": "// Nível 15 · Linha de baterias\n// Escreva seu código abaixo.\n\n",
    "hint": "Cada bateria está a duas casas da próxima.",
    "hint2": "No for: direita(); coletar(); direita(); por três repetições.",
    "brief": "Percorra a linha com for. Pare sobre cada uma das três baterias e execute coletar() antes de seguir."
  },
  {
    "id": 16,
    "title": "Subida repetida",
    "world": 3,
    "subject": "Laços encadeados",
    "mission": "Suba quatro vezes e avance quatro vezes usando for.",
    "start": [
      1,
      4
    ],
    "goal": [
      5,
      0
    ],
    "batteries": [],
    "switches": [],
    "rocks": [
      [
        2,
        3
      ],
      [
        3,
        3
      ]
    ],
    "requires": [
      "for"
    ],
    "starter": "// Nível 16 · Subida repetida\n// Escreva seu código abaixo.\n\n",
    "hint": "Você pode escrever dois laços for, um para cada direção.",
    "hint2": "Primeiro quatro cima(), depois quatro direita().",
    "brief": "Use repetição para subir quatro casas e, em seguida, andar quatro casas à direita."
  },
  {
    "id": 17,
    "title": "Até encontrar a parede",
    "world": 3,
    "subject": "while com sensor",
    "mission": "Caminhe à direita enquanto o caminho estiver livre.",
    "start": [
      0,
      2
    ],
    "goal": [
      5,
      2
    ],
    "batteries": [],
    "switches": [],
    "rocks": [
      [
        6,
        2
      ]
    ],
    "requires": [
      "while"
    ],
    "starter": "// Nível 17 · Até encontrar a parede\n// Escreva seu código abaixo.\n\n",
    "hint": "O sensor livre(\"direita\") muda quando encontra uma pedra.",
    "hint2": "Use while (livre(\"direita\")) { direita(); }",
    "brief": "Use while com livre(\"direita\") para avançar uma casa por vez. Pare quando a próxima casa estiver bloqueada."
  },
  {
    "id": 18,
    "title": "Coleta automática",
    "world": 3,
    "subject": "for + if",
    "mission": "Com for e if, caminhe até as três baterias e colete cada uma.",
    "start": [
      0,
      0
    ],
    "goal": [
      6,
      0
    ],
    "batteries": [
      [
        2,
        0
      ],
      [
        4,
        0
      ],
      [
        6,
        0
      ]
    ],
    "switches": [],
    "rocks": [],
    "requires": [
      "for",
      "if"
    ],
    "starter": "// Nível 18 · Coleta automática\n// Escreva seu código abaixo.\n\n",
    "hint": "Cada bateria aparece a cada duas casas.",
    "hint2": "Repita três vezes: direita(2) e um if com coletar().",
    "brief": "Use for para avançar e if com bateriaAqui() para coletar. A última bateria está na mesma casa do portal."
  },
  {
    "id": 19,
    "title": "Minhas próprias instruções",
    "world": 4,
    "subject": "Declaração de função",
    "mission": "Crie uma função chamada avancar e use-a duas vezes.",
    "start": [
      0,
      1
    ],
    "goal": [
      4,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "function"
    ],
    "starter": "// Nível 19 · Minhas próprias instruções\n// Escreva seu código abaixo.\n\n",
    "hint": "Uma função reúne comandos que podem ser reutilizados.",
    "hint2": "function avancar() { direita(2); } e depois avancar() duas vezes.",
    "brief": "Crie a função avancar para mover duas casas à direita. Chame essa função duas vezes."
  },
  {
    "id": 20,
    "title": "Função com parâmetro",
    "world": 4,
    "subject": "Parâmetros",
    "mission": "Crie uma função com parâmetro que mova o robô cinco casas.",
    "start": [
      0,
      1
    ],
    "goal": [
      5,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "function",
      "parameter"
    ],
    "starter": "// Nível 20 · Função com parâmetro\n// Escreva seu código abaixo.\n\n",
    "hint": "O parâmetro é um nome recebido entre os parênteses.",
    "hint2": "function andar(n) { direita(n); } e chame andar(5);",
    "brief": "Crie uma função que receba a quantidade de passos por parâmetro e chame-a passando 5."
  },
  {
    "id": 21,
    "title": "Mapa em um array",
    "world": 4,
    "subject": "Arrays + for...of",
    "mission": "Crie um array com movimentos e percorra-o com for...of.",
    "start": [
      0,
      3
    ],
    "goal": [
      3,
      1
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "array",
      "forof"
    ],
    "starter": "// Nível 21 · Mapa em um array\n// Escreva seu código abaixo.\n\n",
    "hint": "Um array usa colchetes: [\"cima\", \"direita\"].",
    "hint2": "Percorra com for (const movimento of movimentos).",
    "brief": "Guarde as direções em um array e leia cada uma com for...of. O caminho precisa subir e seguir à direita."
  },
  {
    "id": 22,
    "title": "Tamanho da lista",
    "world": 4,
    "subject": "Propriedade .length",
    "mission": "Use .length para controlar quantas vezes avançar.",
    "start": [
      0,
      2
    ],
    "goal": [
      5,
      2
    ],
    "batteries": [],
    "switches": [],
    "rocks": [],
    "requires": [
      "array",
      "length"
    ],
    "starter": "// Nível 22 · Tamanho da lista\n// Escreva seu código abaixo.\n\n",
    "hint": "O tamanho do array é passos.length.",
    "hint2": "Use for (let i = 0; i < passos.length; i++) { direita(); }",
    "brief": "Crie um array com cinco elementos. Use .length para determinar quantos movimentos à direita serão feitos."
  },
  {
    "id": 23,
    "title": "Plano de navegação",
    "world": 4,
    "subject": "Função + array",
    "mission": "Crie uma função para percorrer um array de direções, colete as baterias e ative o painel.",
    "start": [
      0,
      4
    ],
    "goal": [
      6,
      1
    ],
    "batteries": [
      [
        3,
        4
      ],
      [
        6,
        4
      ]
    ],
    "switches": [
      [
        6,
        2
      ]
    ],
    "rocks": [
      [
        3,
        3
      ],
      [
        4,
        3
      ]
    ],
    "requires": [
      "function",
      "array",
      "forof"
    ],
    "starter": "// Nível 23 · Plano de navegação\n// Escreva seu código abaixo.\n\n",
    "hint": "Organize os deslocamentos em uma função que percorre um array.",
    "hint2": "Vá 3 à direita, colete, 3 à direita, colete, suba 2, ative, suba 1.",
    "brief": "Crie uma função que percorra as direções de um array com for...of. Colete as duas baterias, ative o painel e termine no portal."
  },
  {
    "id": 24,
    "title": "O grande jardim",
    "world": 4,
    "subject": "Desafio final: integrar conceitos",
    "mission": "Use função, array e repetição para coletar duas baterias, ativar o painel e chegar ao portal.",
    "start": [
      0,
      4
    ],
    "goal": [
      6,
      0
    ],
    "batteries": [
      [
        2,
        4
      ],
      [
        4,
        2
      ]
    ],
    "switches": [
      [
        5,
        2
      ]
    ],
    "rocks": [
      [
        3,
        3
      ],
      [
        4,
        3
      ],
      [
        5,
        3
      ],
      [
        0,
        1
      ]
    ],
    "requires": [
      "function",
      "array",
      "for"
    ],
    "starter": "// Nível 24 · O grande jardim\n// Escreva seu código abaixo.\n\n",
    "hint": "Comece criando uma função de avanço repetido e guarde os trechos em um array.",
    "hint2": "Visite, nesta ordem: coluna 3, linha 5 (colete); coluna 3, linha 3; coluna 5, linha 3 (colete); coluna 6, linha 3 (ative); coluna 7, linha 3; coluna 7, linha 1 (portal).",
    "brief": "Planeje a rota em um array e execute-a com uma função e for. Visite as duas baterias e o painel antes de terminar no portal."
  },
  {
    "id": 25,
    "world": 5,
    "title": "Labirinto inteligente",
    "subject": "Função, parâmetro e sensores",
    "start": [
      0,
      4
    ],
    "goal": [
      6,
      0
    ],
    "batteries": [
      [
        1,
        4
      ],
      [
        3,
        2
      ],
      [
        6,
        1
      ]
    ],
    "switches": [
      [
        5,
        2
      ]
    ],
    "rocks": [
      [
        2,
        3
      ],
      [
        2,
        4
      ],
      [
        4,
        0
      ],
      [
        4,
        1
      ]
    ],
    "requires": [
      "function",
      "parameter",
      "while",
      "if"
    ],
    "mission": "Combine uma função com parâmetro, while e if para coletar três baterias e ativar o painel, contornando duas barreiras.",
    "brief": "Suba para contornar a primeira barreira e passe por baixo da segunda. Consulte os sensores antes de coletar ou ativar. Termine no portal.",
    "hint": "Uma função pode receber uma direção e usar while com livre(direcao). Cuidado: o sensor só vê a casa seguinte.",
    "hint2": "Comece coletando na coluna 2, linha 5. A barreira da coluna 3 termina na linha 3; a da coluna 5 permite passagem pela linha 3.",
    "starter": "// Desafio extra 1 · Labirinto inteligente\n// Planeje sua solução abaixo.\n\n"
  },
  {
    "id": 26,
    "world": 6,
    "title": "Patrulha em camadas",
    "subject": "Laços aninhados e coleta condicional",
    "start": [
      0,
      4
    ],
    "goal": [
      6,
      0
    ],
    "batteries": [
      [
        2,
        4
      ],
      [
        4,
        2
      ],
      [
        2,
        0
      ]
    ],
    "switches": [
      [
        6,
        2
      ],
      [
        4,
        0
      ]
    ],
    "rocks": [
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        4,
        1
      ],
      [
        5,
        1
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ],
      [
        4,
        3
      ],
      [
        5,
        3
      ]
    ],
    "requires": [
      "function",
      "for",
      "nestedfor",
      "if"
    ],
    "mission": "Percorra três corredores com for dentro de for, coletando três baterias e ativando dois painéis.",
    "brief": "Planeje a ida e a volta nos corredores horizontais. Use um laço para os corredores e outro para os passos; verifique os itens a cada parada.",
    "hint": "Alterne o sentido horizontal a cada corredor. As colunas 1 e 7 ligam os corredores.",
    "hint2": "Percorra a linha 5 para a direita, suba à linha 3, volte para a esquerda, suba à linha 1 e siga ao portal.",
    "starter": "// Desafio extra 2 · Patrulha em camadas\n// Planeje sua solução abaixo.\n\n"
  },
  {
    "id": 27,
    "world": 7,
    "title": "Rota planejada",
    "subject": "Arrays, retorno e decisões",
    "start": [
      0,
      0
    ],
    "goal": [
      6,
      4
    ],
    "batteries": [
      [
        0,
        3
      ],
      [
        2,
        4
      ],
      [
        4,
        1
      ],
      [
        6,
        2
      ]
    ],
    "switches": [
      [
        2,
        0
      ],
      [
        4,
        4
      ]
    ],
    "rocks": [
      [
        1,
        1
      ],
      [
        1,
        2
      ],
      [
        1,
        3
      ],
      [
        3,
        0
      ],
      [
        3,
        1
      ],
      [
        3,
        2
      ],
      [
        5,
        2
      ],
      [
        5,
        3
      ],
      [
        5,
        4
      ]
    ],
    "requires": [
      "function",
      "parameter",
      "return",
      "array",
      "forof",
      "length",
      "if"
    ],
    "mission": "Crie uma função com parâmetro e retorno para consultar a rota; percorra um array com for...of e visite quatro baterias e dois painéis.",
    "brief": "As paredes alternam as passagens por cima e por baixo. Organize as direções em um array e use uma função com return para decidir o próximo passo.",
    "hint": "Use .length para verificar o tamanho do plano. Sua função pode retornar livre(direcao) para evitar movimentos bloqueados.",
    "hint2": "A parede da coluna 2 tem passagem pelas linhas 1 e 5; a da coluna 4, pelas linhas 4 e 5; a da coluna 6, pelas linhas 1 e 2.",
    "starter": "// Desafio extra 3 · Rota planejada\n// Planeje sua solução abaixo.\n\n"
  },
  {
    "id": 28,
    "world": 8,
    "title": "Mestre dos jardins",
    "subject": "Integração avançada de algoritmos",
    "start": [
      0,
      4
    ],
    "goal": [
      6,
      0
    ],
    "batteries": [
      [
        2,
        4
      ],
      [
        6,
        3
      ],
      [
        4,
        2
      ],
      [
        0,
        1
      ],
      [
        3,
        0
      ]
    ],
    "switches": [
      [
        6,
        4
      ],
      [
        0,
        2
      ],
      [
        5,
        0
      ]
    ],
    "rocks": [
      [
        0,
        3
      ],
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ],
      [
        4,
        3
      ],
      [
        5,
        3
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ],
      [
        4,
        1
      ],
      [
        5,
        1
      ],
      [
        6,
        1
      ]
    ],
    "requires": [
      "function",
      "parameter",
      "return",
      "array",
      "forof",
      "for",
      "nestedfor",
      "while",
      "if",
      "else",
      "and"
    ],
    "mission": "Integre funções, arrays, laços aninhados, while e decisões para recuperar cinco baterias e ativar três painéis em um labirinto.",
    "brief": "O caminho sobe pela direita, cruza o centro e sobe pela esquerda. Separe navegação e ações em funções; revise cada corredor antes de seguir.",
    "hint": "Guarde trechos da rota em arrays. Use funções com retorno e condições combinadas para verificar passagem e itens.",
    "hint2": "Linha 5: siga à direita. Coluna 7: suba à linha 3. Linha 3: siga à esquerda. Coluna 1: suba à linha 1. Depois siga ao portal.",
    "starter": "// Desafio extra 4 · Mestre dos jardins\n// Planeje sua solução abaixo.\n\n"
  }
];
