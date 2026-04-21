/* ══════════════════════════════════════════════
   42Battle Compendium — script.js
   Parsing .kit → données structurées → rendu GitBook
   ══════════════════════════════════════════════ */

'use strict';

// ── Données brutes des personnages (issues des fichiers .kit) ──
const RAW_CHARACTERS = [
  {
    id: 1, name: "Sammy",
    effets: ["15% Force & Speed"],
    passifs: [
      {
        name: "Pression", cd: null, req: null,
        lines: [
          "Sammy ajoute +2 à tous les effets de type « tous les X coups » contre un joueur.",
          "Autrement dit, un effet qui se déclenche tous les X coups devient tous les X+2 coups pour ses adversaires face à Sammy."
        ]
      }
    ],
    actifs: [
      {
        name: "Transcendance", cd: "1×/min", req: null,
        lines: [
          "Sammy devient <em>transcendé</em> pendant 20 secondes.",
          "Durant cette période :",
          ["Obtient 15% Speed supplémentaires.", "Inflige ½c de dégâts bruts supplémentaires tous les 2 coups d'épée."]
        ]
      }
    ]
  },
  {
    id: 2, name: "Keunotor",
    effets: ["Depth Strider 3"],
    passifs: [
      {
        name: "Lunatique", cd: null, req: null,
        lines: [
          "Toutes les 15 secondes, Keunotor obtient 2 modifications de stats aléatoires :",
          ["80% de chances : +10% dans un stat", "20% de chances : −5% dans un stat"]
        ]
      }
    ],
    actifs: [
      {
        name: "Cascade", cd: "1×/45s", req: null,
        lines: [
          "Keunotor dash en avant sur ~10 blocs.",
          "Ralentit les joueurs proches de 40% pendant 3s au départ et à l'arrivée.",
          "AoE : 7 blocs."
        ]
      }
    ]
  },
  {
    id: 3, name: "Shrek",
    effets: ["Aucun"],
    passifs: [
      {
        name: "Peau d'Ogre", cd: null, req: null,
        lines: [
          "À chaque fois que Shrek perd un cœur de vie, il gagne 1 cœur d'absorption pendant 4 secondes.",
          "Ne s'active qu'une seule fois par cœur par partie."
        ]
      }
    ],
    actifs: [
      {
        name: "Pet", cd: "1×/15s", req: null,
        lines: [
          "Shrek produit des odeurs atroces dans une zone de 10 blocs.",
          "Inflige 1c de dégâts et repousse ses ennemis (~3 blocs de knockback)."
        ]
      }
    ]
  },
  {
    id: 4, name: "Kyojuro",
    effets: ["Tous les 4 coups contre un joueur, Kyojuro l'enflamme pendant 4s pour 1c de dégât brut."],
    passifs: [
      {
        name: "Lame de Nichirin", cd: null, req: null,
        lines: [
          "Kyojuro commence la partie avec une lame aléatoire parmi les suivantes :",
          null,
          [
            { color: "rouge",  text: "Rouge : 10% Force" },
            { color: "jaune",  text: "Jaune : 15% Speed" },
            { color: "bleue",  text: "Bleue : 10% Résistance" },
            { color: "rose",   text: "Rose : +2c" },
            { color: "verte",  text: "Verte : +1c d'absorption/Gapple" }
          ]
        ]
      }
    ],
    actifs: [
      {
        name: "Dernier Souffle", cd: "1×/combat", req: null,
        lines: [
          "Kyojuro perd 4c de manière permanente et obtient en échange :",
          ["Soin complet.", "15% Force.", "25% Speed.", "Enflamme pendant 2s au lieu de 4s (dégâts inchangés)."]
        ]
      }
    ]
  },
  {
    id: 5, name: "Eren",
    effets: ["Régénération de 1c toutes les 20s, ou toutes les 10s si Eren a moins de 4c."],
    passifs: [
      {
        name: "Durcissement", cd: null, req: null,
        lines: [
          "Eren gagne de la résistance en fonction de ses points de vie :",
          ["15–12c : 10% Résistance (voir Transformation)", "12–6c : 0%", "6–4c : 10%", "4–0c : 20%"]
        ]
      }
    ],
    actifs: [
      {
        name: "Transformation", cd: "1×/min", req: null,
        lines: [
          "Eren se transforme en Titan Assaillant pendant 20s.",
          "Effets de la transformation :",
          ["Obtient +3c.", "Double l'effet de sa régénération (1c/10s ou 1c/5s).", "Inflige un saignement de 12s : 3c de dégâts physiques tous les 8 coups d'épée.", "Évapore toute l'eau proche dans un rayon de 15 blocs."]
        ]
      }
    ]
  },
  {
    id: 6, name: "Big Chungus",
    effets: ["+5c"],
    passifs: [
      {
        name: "Trou Noir", cd: null, req: "Tenir le trou noir en main",
        lines: [
          "Lorsque Big Chungus tient son trou noir :",
          ["Octroie Jump Boost V.", "Attire les ennemis par à-coups toutes les 5s, infligeant 1c de dégâts bruts s'ils possèdent plus de 6c."]
        ]
      }
    ],
    actifs: [
      {
        name: "Uno Reverse Card", cd: "1×/30s/pers", req: "Tenir l'item",
        lines: [
          "Big Chungus renvoie les dégâts ou raycasts sur ses adversaires.",
          "S'active automatiquement en tenant la Uno Reverse Card."
        ]
      }
    ]
  },
  {
    id: 7, name: "Matt",
    effets: ["20% Force & Speed", "−2c"],
    passifs: [
      {
        name: "Bot", cd: null, req: null,
        lines: [
          "Matt obtient 5% de Force supplémentaire contre la dernière personne qui lui a infligé un debuff."
        ]
      }
    ],
    actifs: [
      {
        name: "Wiimote", cd: "1×/40s", req: null,
        lines: [
          "Matt tire un rayon instantané (raycast) qui maintient sa cible au-dessus de sa tête pendant 3 secondes.",
          "S'il touche : reçoit 2c d'absorption pendant 6s.",
          "S'il rate : reçoit 5c d'absorption pendant 6s."
        ]
      }
    ]
  },
  {
    id: 8, name: "Thanos",
    effets: ["25% Ténacité", "+2c"],
    passifs: [
      {
        name: "Snap", cd: null, req: "10 pierres utilisées",
        lines: [
          "Une fois que Thanos a utilisé le pouvoir de 10 pierres, il peut claquer des doigts en sacrifiant son gant.",
          "Effet : divise la vie de tous les joueurs (sauf Thanos) par 2.",
          "Coût : perd le gant et 5c de manière permanente."
        ]
      }
    ],
    actifs: [
      {
        name: "Gant de l'Infini", cd: "Variable", req: "Clic-Gauche: changer de pierre | Clic-Droit: utiliser",
        lines: [
          "Thanos utilise la pierre sélectionnée :",
          [
            "Pouvoir (1×/30s) : Crée une petite explosion sur tous les joueurs de la partie, infligeant 1c de dégâts physiques.",
            "Espace (1×/30s) : Se téléporte sur le bloc visé.",
            "Réalité (1×/30s) : Thanos se soigne de 2,5c en 5 secondes."
          ]
        ]
      }
    ]
  },
  {
    id: 9, name: "Amogus",
    effets: ["Hors-combat : devient invisible, +50% Speed, Jump Boost V.", "Redevient visible en mangeant une gap ou en tirant une flèche."],
    passifs: [
      {
        name: "Imposteur", cd: null, req: null,
        lines: [
          "Lorsque Amogus redevient visible près d'un joueur, il obtient 25% Force pendant 5 secondes."
        ]
      }
    ],
    actifs: [
      {
        name: "Sabotage", cd: "1×/30s", req: "Nécessite une cible",
        lines: [
          "Ralentit sa cible de 50% pendant 2 secondes."
        ]
      }
    ]
  },
  {
    id: 10, name: "Gargamel",
    effets: ["Aucun"],
    passifs: [
      {
        name: "Mana", cd: null, req: null,
        lines: [
          "Gargamel génère 10 mana par seconde par joueur proche de lui.",
          "Le mana est visible sur la hotbar et au-dessus de sa tête."
        ]
      }
    ],
    actifs: [
      {
        name: "Baguette Magique", cd: "1×/10s", req: null,
        lines: [
          "Lance un sort (rayon de particules rapide) coûtant entre 100 et 600 mana.",
          "La puissance du sort augmente en fonction du mana dépensé :",
          [
            "0,5c de dégâts magiques /100 mana (max 3c)",
            "0,5c de soin /150 mana (max 2c)",
            "30% de fragilisation pendant 1s + 2s/200 mana (max 7s)"
          ]
        ]
      }
    ]
  },
  {
    id: 11, name: "Kratos",
    effets: ["40% Ténacité", "−2c"],
    passifs: [
      {
        name: "Rage", cd: null, req: null,
        lines: [
          "À chaque coup d'épée reçu ou infligé, Kratos gagne 3% de Rage.",
          "Bonus en fonction du niveau de Rage :",
          ["0–25% : 20% Speed", "25–50% : 20% Force & Speed", "50–75% : 30% Force & Speed", "75–100% : 40% Force, 30% Speed, 60% Ténacité"],
          "Hors-combat, Kratos perd 5% de Rage par seconde. Chaque % de Rage perdu le soigne de 1% des PV manquants."
        ]
      }
    ],
    actifs: [
      {
        name: "Fureur", cd: "1×/30s à 1×/min", req: null,
        lines: [
          "Renforce la prochaine attaque qui inflige 1c de dégât brut supplémentaire.",
          "Effets selon la Rage :",
          [
            "< 50% Rage : attaque normale renforcée.",
            "≥ 50% Rage : l'attaque immobilise la cible pendant 1s.",
            "100% Rage : inflige 2c dégâts bruts supplémentaires + immobilise 1s, mais le cooldown est doublé."
          ]
        ]
      }
    ]
  },
  {
    id: 12, name: "Chara",
    effets: ["15% Résistance"],
    passifs: [
      {
        name: "LOVE", cd: "1×/min", req: null,
        lines: [
          "Lorsque Chara passe sous 6c, elle obtient 2c d'absorption pendant 10 secondes."
        ]
      }
    ],
    actifs: [
      {
        name: "Détermination", cd: "1×/min", req: null,
        lines: [
          "Pendant 15 secondes, Chara marque ses adversaires tous les 3 coups d'épée et obtient 15% Speed.",
          "À la fin, toutes les marques explosent, infligeant 0,5c de dégâts magiques par marque :",
          ["1 ennemi marqué = 0,5c/ennemi", "2 ennemis marqués = 1c/ennemi"]
        ]
      }
    ]
  },
  {
    id: 13, name: "Dio",
    effets: ["20% Vampirisme", "100% Létalité", "Utilise la résistance de ses adversaires comme de la Force."],
    passifs: [
      {
        name: "Vampire", cd: null, req: "Nuit",
        lines: [
          "La nuit, Dio obtient 10% Force & 10% Résistance supplémentaires."
        ]
      }
    ],
    actifs: [
      {
        name: "Za Warudo", cd: "1×/min", req: null,
        lines: [
          "Dio immobilise tous les joueurs pendant 5 secondes."
        ]
      }
    ]
  },
  {
    id: 14, name: "Sett",
    effets: ["+1c"],
    passifs: [
      {
        name: "Roi de l'Arène", cd: null, req: null,
        lines: [
          "Sett inflige 2c de dégâts physiques tous les 10 coups d'épée.",
          "Non affecté par le passif de Sammy."
        ]
      }
    ],
    actifs: [
      {
        name: "Haymaker", cd: "1×/min", req: "1c manquant minimum",
        lines: [
          "Sett s'immobilise 1 seconde puis déclenche une frappe dans une zone devant lui.",
          "Les dégâts sont équivalents à son nombre de cœurs manquants.",
          "Les dégâts au centre de la zone sont de type brut."
        ]
      }
    ]
  },
  {
    id: 15, name: "Mr Incredible",
    effets: ["Aucun"],
    passifs: [
      {
        name: "Canny to Uncanny", cd: null, req: null,
        lines: [
          "Mr Incredible change de forme en cycle après avoir appliqué 2 Malus, dans cet ordre :",
          "VCanny → Canny → Uncanny → VUncanny → Uncanny → Canny → VCanny → …",
          "Il inflige un Malus tous les 10 coups d'épée contre un joueur.",
          null,
          [
            { color: "default", text: "Very Canny — 30% Speed · Malus : Gros KB, à l'atterrissage stun 1s + TP derrière la cible." },
            { color: "default", text: "Canny — 15% Speed & 10% Résistance · Malus : Gros KB, tant que la cible est en l'air +45% Speed." },
            { color: "default", text: "Uncanny — 10% Speed & 15% Résistance · Malus : Cible retournée + 90% Slow dégressif pendant 2s." },
            { color: "default", text: "Very Uncanny — 30% Résistance · Malus : Cible retournée + stun 1s." }
          ]
        ]
      }
    ],
    actifs: [
      {
        name: "Assurance", cd: "1×/30s", req: null,
        lines: [
          "Les prochains coups de Mr Incredible infligent des Malus tant qu'il frappe des personnes différentes."
        ]
      }
    ]
  },
  {
    id: 16, name: "Warwick",
    effets: ["15% Speed", "10% Vampirisme"],
    passifs: [
      {
        name: "Soif Inextinguible", cd: null, req: null,
        lines: [
          "Warwick gagne jusqu'à +40% Vampirisme supplémentaire en fonction de ses cœurs manquants.",
          "L'effet est maximisé lorsque Warwick possède moins de 4c."
        ]
      }
    ],
    actifs: [
      {
        name: "Hurlement Bestial", cd: "1×/30s", req: null,
        lines: [
          "Warwick obtient 30% Résistance pendant 2s.",
          "Après cela, il apeure tous les joueurs proches de lui."
        ]
      }
    ]
  },
  {
    id: 17, name: "Undyne",
    effets: ["+25% Résistance"],
    passifs: [
      {
        name: "Lances Infinies", cd: null, req: null,
        lines: [
          "Les coups d'épée d'Undyne enfoncent des lances dans ses adversaires.",
          "Cycle de lances par coup : +1, +2, +3, +1, …",
          "Un adversaire hors-combat perd la moitié de ses lances."
        ]
      }
    ],
    actifs: [
      {
        name: "Justice", cd: "1×/min", req: null,
        lines: [
          "Ordonne à toutes les lances de s'extirper de ses ennemis.",
          "Inflige 0,1c de dégâts magiques par lance.",
          "Ne peut pas tuer : laisse les cibles à ½c minimum."
        ]
      }
    ]
  },
  {
    id: 18, name: "Beugleur",
    effets: ["+1c", "15% Résistance"],
    passifs: [
      {
        name: "Lessivage", cd: null, req: null,
        lines: [
          "Les attaques de Beugleur infligent des dégâts de zone.",
          "De plus, il inflige des debuffs de zone tous les X coups d'épée :",
          ["Tous les 5 coups : 10% Slowness pendant 5s", "Tous les 7 coups : 10% Weakness pendant 7s", "Tous les 9 coups : 10% Fragilisation pendant 9s"],
          "Non affecté par Sammy."
        ]
      }
    ],
    actifs: [
      {
        name: "Renversement", cd: "1×/45s", req: null,
        lines: [
          "La prochaine attaque de Beugleur immobilise toutes ses cibles pendant 3 secondes."
        ]
      }
    ]
  },
  {
    id: 19, name: "Shoto",
    effets: ["10% Speed", "10% Résistance"],
    passifs: [
      {
        name: "Chaud & Froid", cd: null, req: null,
        lines: [
          "Shoto alterne entre brûler et refroidir ses adversaires selon le cycle jour/nuit.",
          null,
          [
            { color: "rouge", text: "Jour — Fire Resistance. Tous les 6 coups : 15% Slow & Fragilisation pendant 4s." },
            { color: "bleue", text: "Nuit — Frost Walker. Tous les 6 coups : brûle l'ennemi pour 1c physique en 4s + 15% Weakness 4s." }
          ]
        ]
      }
    ],
    actifs: [
      {
        name: "Explosion", cd: "1×/min", req: null,
        lines: [
          "Crée une explosion (feu ou glace selon Chaud & Froid) dans un cône devant lui.",
          null,
          [
            { color: "bleue", text: "Glace : Immobilise tous les joueurs touchés 2s + 1c dégâts magiques." },
            { color: "rouge", text: "Feu : 50% Slow 1s + brûlure 1c physique en 3s. Si la cible brûlait déjà : 2c bruts à la place." }
          ]
        ]
      }
    ]
  },
  {
    id: 20, name: "Gadjah",
    effets: ["30% Speed"],
    passifs: [
      {
        name: "Static", cd: null, req: null,
        lines: [
          "À chaque fois que Gadjah passe sous 4c, il inflige 1c de dégâts magiques à tous les joueurs proches (6 blocs + attaquant)."
        ]
      }
    ],
    actifs: [
      {
        name: "Grimoire", cd: "1×/30s", req: "Nécessite une cible",
        lines: [
          "Gadjah abat la foudre sur un ennemi visé, infligeant 1c de dégâts magiques.",
          "L'éclair se répète toutes les secondes en ciblant un joueur proche.",
          "Gadjah se soigne de 100% des dégâts de Grimoire.",
          "L'éclair ne peut pas rebondir sur Gadjah."
        ]
      }
    ]
  },
  {
    id: 21, name: "Henry Stickmin",
    effets: ["Aucun"],
    passifs: [
      {
        name: "Reference Pack", cd: null, req: null,
        lines: [
          "Henry Stickmin invoque Reference Pack au premier coup d'épée.",
          "Reference Pack combat à ses côtés et inflige 0,2c de dégâts magiques à chaque coup d'épée à tous les ennemis proches (15 blocs)."
        ]
      }
    ],
    actifs: [
      {
        name: "Reference Pack (Échange)", cd: "1×/15s", req: "Reference Pack à portée (15 blocs)",
        lines: [
          "Henry Stickmin échange sa position avec Reference Pack.",
          "Obtient 15% Force & Speed & Résistance temporairement."
        ]
      }
    ]
  },
  {
    id: 22, name: "Capybara",
    effets: ["20% Speed", "Depth Strider 3"],
    passifs: [
      {
        name: "Chill", cd: null, req: null,
        lines: [
          "Capybara inflige 15% Weakness pendant 5s à ses attaquants tous les 5 coups d'épée reçus."
        ]
      },
      {
        name: "Morsure", cd: "1×/45s", req: "Nécessite une cible (5 blocs)",
        lines: [
          "Capybara mord sa cible, infligeant 1c de dégât physique et 2s d'épouvante.",
          "Si la cible tient une pomme d'or, Capybara en mange une."
        ]
      }
    ],
    actifs: []
  },
  {
    id: 23, name: "Kira Yoshikage",
    effets: ["10% Speed", "Les flèches de Kira explosent au tir et à l'impact (1×/15s)."],
    passifs: [
      {
        name: "Bites the Dust", cd: null, req: null,
        lines: [
          "Les explosions de Kira marquent ses victimes, qui implosent lors du prochain coup d'épée de Kira.",
          "L'implosion inflige 1c de dégât magique."
        ]
      }
    ],
    actifs: [
      {
        name: "Killer Queen", cd: "1×/30s", req: null,
        lines: [
          "Kira crée une explosion sur le bloc visé.",
          "Propulse violemment et inflige 0,5c de dégât magique aux joueurs proches."
        ]
      }
    ]
  },
  {
    id: 24, name: "Sonic",
    effets: ["60% Speed", "Fire Resistance"],
    passifs: [
      {
        name: "2Fast4U", cd: null, req: null,
        lines: [
          "Sonic gagne 5% Force à chaque coup d'épée donné.",
          "Perd tout le bonus accumulé s'il reçoit un coup d'épée."
        ]
      }
    ],
    actifs: [
      {
        name: "Chili Dog", cd: "1×/45s", req: null,
        lines: [
          "Sonic mange un chili dog brûlant, enflammant le sol sous ses pieds.",
          "Les 3 prochains coups d'épée de Sonic infligent 2× plus de dégâts si la cible est en train de brûler."
        ]
      }
    ]
  },
  {
    id: 25, name: "Foxy",
    effets: ["Aucun"],
    passifs: [
      {
        name: "Crochet Rouillé", cd: null, req: null,
        lines: [
          "Foxy maudit ses adversaires tous les 8 coups d'épée.",
          "La malédiction inflige :",
          ["3c de dégâts en 12s", "30% Slowness pendant 2s"]
        ]
      }
    ],
    actifs: [
      {
        name: "JumpScare", cd: "1×/15s", req: "Nécessite une cible",
        lines: [
          "Foxy se téléporte dans le dos de sa cible.",
          "Son prochain coup d'épée inflige 1,5c de dégâts magiques.",
          "Après 1s, la téléportation est annulée."
        ]
      }
    ]
  },
  {
    id: 26, name: "The Lamb",
    effets: ["15% Vampirisme"],
    passifs: [
      {
        name: "Cultiste", cd: null, req: null,
        lines: [
          "The Lamb obtient jusqu'à +80% Speed en fonction de ses cœurs manquants.",
          "Speed maximale atteinte à 4c."
        ]
      }
    ],
    actifs: [
      {
        name: "Malédiction", cd: "1×/20s", req: null,
        lines: [
          "The Lamb utilise sa ferveur pour jeter des sorts sur ses adversaires.",
          "La forme du sort cycle à chaque utilisation : Coup renforcé → Boule de feu → Éruption.",
          "Chaque victime subit 20% Fragilisation pendant 3s + entre 1c et 3c de dégâts magiques selon les PV manquants de The Lamb.",
          "Les dégâts maximum sont atteints à 4c."
        ]
      }
    ]
  },
  {
    id: 27, name: "Mitsuri",
    effets: ["20% Force"],
    passifs: [
      {
        name: "Marque des Slayers", cd: null, req: null,
        lines: [
          "Lorsque Mitsuri est sous 8c, elle génère 1% de marque par seconde (2% si elle est sous 4c).",
          "À 100%, elle obtient :",
          ["Souffle de l'Amour inflige +50% dégâts.", "Voir la vie de ses adversaires par palier de 20%."]
        ]
      }
    ],
    actifs: [
      {
        name: "Souffle de l'Amour", cd: "1×/30s", req: null,
        lines: [
          "Réduit au silence les ennemis proches (AoE 5 blocs) puis dash en arrière et en hauteur.",
          "Dans les airs, Mitsuri flotte 1s avant de frapper avec son sabre (raycast), infligeant 1c de dégât magique."
        ]
      }
    ]
  },
  {
    id: 28, name: "Nerd",
    effets: ["Voit si un joueur possède plus, moins ou autant de gapples que lui."],
    passifs: [
      {
        name: "Ermhm, acshually ☝️🤓", cd: null, req: null,
        lines: [
          "Nerd gagne 1% Résistance par seconde en combat, jusqu'à +30%.",
          "Une fois hors-combat, si Nerd avait atteint 30% Rés, il obtient 5% Rés permanent.",
          "Nerd ne peut acquérir que 25% Rés de cette façon (via 5 combats)."
        ]
      },
      {
        name: "Fact Check", cd: "1×/45s", req: null,
        lines: [
          "Nerd annonce une vérité dans le chat, infligeant 1c de dégâts mentaux (magiques) à tous les adversaires de la partie."
        ]
      }
    ],
    actifs: []
  },
  {
    id: 29, name: "Roy Mustang",
    effets: ["15% Résistance"],
    passifs: [
      {
        name: "Réaction en Chaîne", cd: null, req: null,
        lines: [
          "Les flammes de Roy Mustang brûlent profondément leurs victimes (0,25c dégât magique/s).",
          "Elles se propagent aux joueurs proches (5 blocs), les brûlant pour la durée d'origine.",
          "En se propageant, les flammes brûlent 2s de moins sur la personne d'origine."
        ]
      }
    ],
    actifs: [
      {
        name: "Transmutation de Flammes", cd: null, req: null,
        lines: [
          "Roy Mustang projette 20 rayons de flammes en cercle autour de lui.",
          "Si une flamme ne touche personne : explose, infligeant 0,5c de dégâts magiques autour d'elle.",
          "Si elle touche un joueur : applique Réaction en Chaîne pendant 5s."
        ]
      }
    ]
  },
  {
    id: 30, name: "Luffy",
    effets: ["Luffy prend 15% moins de dégâts ne venant ni d'épée ni de flèche. (Non applicable aux attaques renforcées)"],
    passifs: [
      {
        name: "Haki de l'Observation", cd: null, req: null,
        lines: [
          "Tous les 5 coups d'épée reçus, Luffy annule les dégâts de celui-ci.",
          "Affecté par Sammy. Ne peut pas annuler une attaque renforcée."
        ]
      }
    ],
    actifs: [
      {
        name: "Gear 5", cd: "1×/min", req: null,
        isItem: true,
        lines: [
          "Luffy passe en Gear 5 pendant 20 coups d'épée et peut effectuer 3 doubles sauts pendant la transformation.",
          "En Gear 5, tous les 4 coups d'épée : balance ses adversaires en arrière (1c physique), puis ils reviennent à leur position.",
          "S'ils rencontrent un mur pendant le KB : 1c brut + retour à la position. Non affecté par Sammy.",
          "Les joueurs stun subissent directement 1c physique."
        ]
      }
    ]
  },
  {
    id: 31, name: "Drattak",
    effets: ["10% Force, Résistance & Speed"],
    passifs: [
      {
        name: "Impudence", cd: null, req: null,
        lines: [
          "À chaque kill, Drattak obtient 10% de Force supplémentaire (cumulable)."
        ]
      }
    ],
    actifs: [
      {
        name: "Colère", cd: "1×/min", req: null,
        lines: [
          "Drattak fonce en avant rapidement, infligeant 1c de dégât physique à tous les adversaires percutés.",
          "S'il touche un joueur, il obtient une deuxième utilisation (utilisable dans les 10s, ne peut pas en générer une troisième)."
        ]
      }
    ]
  },
  {
    id: 32, name: "Keiji",
    effets: ["25% Speed"],
    passifs: [
      {
        name: "Coq Volant", cd: null, req: null,
        lines: [
          "Keiji peut planer dans les airs sur quelques blocs.",
          "S'active avec un double saut dans les airs."
        ]
      }
    ],
    actifs: [
      {
        name: "Kokekoko", cd: "1×/min", req: null,
        lines: [
          "Keiji crie sur ses cibles, envoyant 5 vagues sonores (cercles de particules) devant lui.",
          "Chaque vague inflige 0,5c de dégât magique."
        ]
      }
    ]
  },
  {
    id: 33, name: "Gigachad",
    effets: ["15% Force & Résistance"],
    passifs: [
      {
        name: "I Refuse", cd: null, req: null,
        lines: [
          "Gigachad est immunisé à tous les debuffs."
        ]
      }
    ],
    actifs: [
      {
        name: "Aurafarm", cd: "1×/45s", req: null,
        lines: [
          "Pendant 5 secondes, Gigachad aurafarm sur ses adversaires :",
          ["Devient invincible et immobile.", "Se soigne de 0,5c par seconde."]
        ]
      }
    ]
  },
  {
    id: 34, name: "Bob",
    effets: ["Possède un bloc infini (reste 4s après pose)."],
    passifs: [
      {
        name: "Dalle en Béton", cd: null, req: null,
        lines: [
          "Tous les 9 coups d'épée, Bob coule une dalle en béton hermétique autour de ses adversaires.",
          "Ils étouffent, subissant 0,5c de dégât brut en 1,5s (durée de la dalle)."
        ]
      }
    ],
    actifs: [
      {
        name: "Marteau", cd: "1×/30s", req: null,
        lines: [
          "Bob donne un gros coup de marteau devant lui (portée 5 blocs), infligeant 1c de dégât physique.",
          "S'il touche un de ses blocs (dalle en béton comprise), le bloc explose en briques infligeant 1c de dégât brut à l'adversaire le plus proche.",
          "Dégâts maximaux : 2c bruts + 1c physique."
        ]
      }
    ]
  },
  {
    id: 35, name: "Papa Pig",
    effets: ["+3c"],
    passifs: [
      {
        name: "Tas de Graisse", cd: null, req: null,
        lines: [
          "À chaque coup d'épée reçu, Papa Pig fragilise de 1% (cumulable) son attaquant.",
          "Le debuff est retiré une fois hors-combat.",
          "Affecté par Sammy."
        ]
      }
    ],
    actifs: [
      {
        name: "Saut", cd: "1×/45s", req: null,
        lines: [
          "Papa Pig saute. À l'atterrissage, produit une onde de choc qui force ses adversaires à sauter.",
          "À leur atterrissage, Papa Pig double les stacks de Tas de Graisse."
        ]
      }
    ]
  },
  {
    id: 36, name: "Denji",
    effets: ["Aucun"],
    passifs: [
      {
        name: "Tronçonneuse", cd: null, req: null,
        lines: [
          "Tous les 5 coups d'épée, Denji fait saigner ses adversaires (0,75c de dégâts physiques en 3s).",
          "En frappant quelqu'un qui saigne, Denji se soigne de 0,25c (1×/saignement/personne)."
        ]
      }
    ],
    actifs: [
      {
        name: "Poignée de Lancement", cd: "1×/30s", req: null,
        lines: [
          "Denji se transforme en Chainsaw Man pendant 20s.",
          "Obtient 25% Speed, une régénération naturelle (1c/10s) et réduit le déclenchement de Tronçonneuse à 4 coups au lieu de 5."
        ]
      }
    ]
  },
  {
    id: 37, name: "Itadori",
    effets: ["20% Force", "+1c"],
    passifs: [
      {
        name: "Sukuna", cd: null, req: null,
        lines: [
          "La première fois qu'Itadori passe sous 4c, il devient Sukuna et change son actif."
        ]
      }
    ],
    actifs: [
      {
        name: "Black Flash (Itadori)", cd: "1×/15s", req: null,
        lines: [
          "La prochaine attaque d'Itadori inflige 1c de dégât brut supplémentaire avec un énorme knockback."
        ]
      },
      {
        name: "Découpe (Sukuna)", cd: "1×/15s", req: null,
        lines: [
          "La prochaine attaque de Sukuna inflige 1c de dégât brut à tous les adversaires encore en vie.",
          "Si la Découpe laisse un adversaire à 2c ou moins, il est alors exécuté."
        ]
      }
    ]
  },
  {
    id: 38, name: "Spongebob",
    effets: ["25% Résistance", "Depth Strider 3"],
    passifs: [
      {
        name: "Éponge", cd: "1×/10s", req: null,
        lines: [
          "Spongebob se soigne de 1c après avoir subi des dégâts."
        ]
      }
    ],
    actifs: [
      {
        name: "Éponge (Item)", cd: "1×/45s", req: null,
        isItem: true,
        lines: [
          "Inflige 1c de dégât magique tout autour de lui + 40% Slow pendant 3s.",
          "Chaque utilisation augmente les dégâts de 0,5c (cumulatif)."
        ]
      }
    ]
  },
  {
    id: 39, name: "Hank",
    effets: ["Hank gagne 7,5% Force & Speed par joueur en vie (dynamique, mis à jour en temps réel)."],
    passifs: [
      {
        name: "Folie Meurtrière", cd: null, req: null,
        lines: [
          "Hank obtient 7,5% Force & Speed par kill (cumulatif et permanent)."
        ]
      }
    ],
    actifs: [
      {
        name: "Mercenaire", cd: "1×/30s", req: null,
        lines: [
          "Hank double sa Force pour ses 3 prochains coups d'épée."
        ]
      }
    ]
  },
  {
    id: 40, name: "Kisame",
    effets: ["15% Résistance", "10% Vampirisme", "Depth Strider 3"],
    passifs: [
      {
        name: "Samehada", cd: null, req: null,
        lines: [
          "L'épée de Kisame mord ses adversaires tous les 13 coups d'épée.",
          "Inflige 1c de dégât magique et soigne Kisame de 2,5c."
        ]
      }
    ],
    actifs: [
      {
        name: "Peau de Requin", cd: "1×/45s", req: null,
        lines: [
          "Kisame renforce sa peau pendant 10s, doublant sa résistance.",
          "Chaque coup d'épée reçu réduit le cooldown de 1s ou allonge la durée de 1s.",
          "Le cooldown s'active après la fin du renforcement."
        ]
      }
    ]
  },
  {
    id: 41, name: "Hercules",
    effets: ["15% Speed", "−1c"],
    passifs: [
      {
        name: "Poison d'Hydre", cd: null, req: null,
        lines: [
          "Les flèches d'Hercules sont empoisonnées et infligent jusqu'à +100% de dégâts bruts supplémentaires.",
          "Hercules récupère une flèche toutes les 5s."
        ]
      }
    ],
    actifs: [
      {
        name: "Héros", cd: "1×/min", req: null,
        lines: [
          "Hercules se remplit de courage pendant 30s.",
          "Durant ce temps, il gagne 1% Force par coup d'épée, jusqu'à 20% maximum."
        ]
      }
    ]
  },
  {
    id: 42, name: "Shinra",
    effets: ["30% Speed"],
    passifs: [
      {
        name: "Vol", cd: "1×/15s", req: null,
        lines: [
          "Shinra peut voler pendant 2 secondes."
        ]
      }
    ],
    actifs: [
      {
        name: "Baston", cd: "1×/45s", req: null,
        lines: [
          "Shinra balaie une zone autour de lui, infligeant 0,5c de dégât physique.",
          "S'il touche un joueur, il rebalaie une seconde fois après 1s."
        ]
      }
    ]
  }
];

// ══════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════

function highlightKeywords(text) {
  if (!text) return text;
  return text
    .replace(/\b(\d+(?:[,.]\d+)?c)\b/g, '<span class="ability-stat">$1</span>')
    .replace(/\b(\d+(?:[,.]\d+)?%)\b/g, '<span class="ability-stat">$1</span>')
    .replace(/\b(Force)\b/gi,     '<span class="kw-force">$1</span>')
    .replace(/\b(Speed)\b/gi,     '<span class="kw-speed">$1</span>')
    .replace(/\b(R[eé]sis?tance)\b/gi, '<span class="kw-res">$1</span>')
    .replace(/\b(Vampirisme)\b/gi,'<span class="kw-vamp">$1</span>')
    .replace(/\b(T[eé]nacit[eé])\b/gi,'<span class="kw-tenacite">$1</span>')
    .replace(/\b(d[eé]g[aâ]t[s]?\s+(?:brut|physique|magique)[s]?)\b/gi, '<span class="kw-degat">$&</span>')
    .replace(/\b(soin|soigne|r[eé]g[eé]n[eé]ration)\b/gi, '<span class="kw-soin">$&</span>')
    .replace(/\b(Slow|Slowness|ralentit)\b/gi, '<span class="kw-slow">$&</span>');
}

function buildVariantList(arr) {
  const html = arr.map(item => {
    if (typeof item === 'string') {
      return `<li>${highlightKeywords(item)}</li>`;
    }
    // object with color & text
    return `<div class="variant-block"><div class="variant-name ${item.color}">${item.text.split(':')[0]}</div><div class="variant-body">${highlightKeywords(item.text.split(':').slice(1).join(':').trim())}</div></div>`;
  });

  // check if first item is object (variant-grid)
  if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && 'color' in arr[0]) {
    return `<div class="variant-grid">${html.join('')}</div>`;
  }
  return `<ul>${html.join('')}</ul>`;
}

function renderLines(lines) {
  let html = '';
  for (const line of lines) {
    if (line === null) {
      // separator / paragraph break
      html += '<hr class="ability-divider" />';
    } else if (Array.isArray(line)) {
      html += buildVariantList(line);
    } else {
      html += `<p>${highlightKeywords(line)}</p>`;
    }
  }
  return html;
}

function buildAbilityBlock(ab, type) {
  const cdHtml   = ab.cd  ? `<span class="ability-cd">${ab.cd}</span>` : '';
  const reqHtml  = ab.req ? `<span class="ability-req">⚡ ${ab.req}</span>` : '';

  return `
    <div class="ability-title">
      <span class="ability-name">${ab.name}</span>
      ${cdHtml}${reqHtml}
    </div>
    <div class="ability-body">${renderLines(ab.lines)}</div>
  `;
}

// ══════════════════════════════════════════════
// RENDU DES CARTES (GRILLE HOME)
// ══════════════════════════════════════════════

function buildCard(char) {
  const hasPassif = char.passifs && char.passifs.length > 0;
  const hasActif  = char.actifs  && char.actifs.length  > 0 && !char.actifs[0]?.isItem;
  const hasItem   = char.actifs  && char.actifs.some(a => a.isItem);
  const aucunEffet = char.effets.length === 1 && char.effets[0].toLowerCase() === 'aucun';

  const tags = [];
  if (hasPassif) tags.push(`<span class="tag tag-passif">Passif</span>`);
  if (hasActif)  tags.push(`<span class="tag tag-actif">Actif</span>`);
  if (hasItem)   tags.push(`<span class="tag tag-item">Item</span>`);
  if (aucunEffet && !hasPassif && !hasActif) tags.push(`<span class="tag tag-aucun">—</span>`);

  return `
    <button class="char-card" data-id="${char.id}" aria-label="Voir ${char.name}">
      <div class="card-num">#${String(char.id).padStart(2, '0')}</div>
      <div class="card-name">${char.name}</div>
      <div class="card-tags">${tags.join('')}</div>
    </button>
  `;
}

// ══════════════════════════════════════════════
// RENDU PAGE PERSONNAGE
// ══════════════════════════════════════════════

function buildCharPage(char, allChars) {
  const idx  = allChars.findIndex(c => c.id === char.id);
  const prev = allChars[idx - 1] || null;
  const next = allChars[idx + 1] || null;

  // Badges
  const badges = [];
  if (char.passifs?.length) badges.push(`<span class="ability-badge badge-passif">Passif</span>`);
  const normalActifs = char.actifs?.filter(a => !a.isItem) || [];
  const itemActifs   = char.actifs?.filter(a => a.isItem)  || [];
  if (normalActifs.length) badges.push(`<span class="ability-badge badge-actif">Actif</span>`);
  if (itemActifs.length)   badges.push(`<span class="ability-badge badge-item">Item</span>`);
  const nonAucun = char.effets.filter(e => e.toLowerCase() !== 'aucun');
  if (nonAucun.length) badges.push(`<span class="ability-badge badge-effets">Effets passifs</span>`);

  // Effets
  const effetsHtml = char.effets[0].toLowerCase() === 'aucun'
    ? `<ul class="effects-list"><li>Aucun effet de base — <em>Ce personnage ne possède pas d'effets passifs permanents.</em></li></ul>`
    : `<ul class="effects-list">${char.effets.map(e => `<li>${highlightKeywords(e)}</li>`).join('')}</ul>`;

  // Passifs
  let passifsSections = '';
  if (char.passifs?.length) {
    for (const p of char.passifs) {
      passifsSections += `
        <div class="char-section section-passif">
          <div class="section-header">
            <span class="section-icon">🔵</span>
            <span class="section-label">Passif <span class="section-label-en">Passive</span></span>
          </div>
          <div class="section-body">${buildAbilityBlock(p, 'passif')}</div>
        </div>
      `;
    }
  }

  // Actifs normaux
  let actifsSections = '';
  if (normalActifs.length) {
    for (const a of normalActifs) {
      actifsSections += `
        <div class="char-section section-actif">
          <div class="section-header">
            <span class="section-icon">🟡</span>
            <span class="section-label">Actif <span class="section-label-en">Active</span></span>
          </div>
          <div class="section-body">${buildAbilityBlock(a, 'actif')}</div>
        </div>
      `;
    }
  }

  // Items
  let itemSections = '';
  if (itemActifs.length) {
    for (const a of itemActifs) {
      itemSections += `
        <div class="char-section section-item">
          <div class="section-header">
            <span class="section-icon">🟣</span>
            <span class="section-label">Item <span class="section-label-en">Item</span></span>
          </div>
          <div class="section-body">${buildAbilityBlock(a, 'item')}</div>
        </div>
      `;
    }
  }

  // Nav prev/next
  const prevBtn = prev
    ? `<button class="btn-nav" data-goto="${prev.id}">← ${prev.name}</button>`
    : `<button class="btn-nav" disabled>← Précédent</button>`;
  const nextBtn = next
    ? `<button class="btn-nav" data-goto="${next.id}">${next.name} →</button>`
    : `<button class="btn-nav" disabled>Suivant →</button>`;

  return `
    <div class="char-header">
      <div class="char-header-glow"></div>
      <div class="char-header-inner">
        <div class="char-header-text">
          <div class="char-id">Personnage #${String(char.id).padStart(2, '0')}</div>
          <h1 class="char-name">${char.name}</h1>
          <div class="char-abilities-badges">${badges.join('')}</div>
        </div>
        <div class="char-nav-buttons">
          ${prevBtn}
          ${nextBtn}
        </div>
      </div>
    </div>

    <div class="char-section section-effets">
      <div class="section-header">
        <span class="section-icon">🟢</span>
        <span class="section-label">Effets de base <span class="section-label-en">Base Effects</span></span>
      </div>
      <div class="section-body">${effetsHtml}</div>
    </div>

    ${passifsSections}
    ${actifsSections}
    ${itemSections}
  `;
}

// ══════════════════════════════════════════════
// NAVIGATION + SIDEBAR
// ══════════════════════════════════════════════

const $ = id => document.getElementById(id);

let currentCharId = null;

function renderNav(filter = '') {
  const nav = $('char-nav');
  const lower = filter.toLowerCase().trim();
  const visible = RAW_CHARACTERS.filter(c =>
    c.name.toLowerCase().includes(lower) ||
    String(c.id).includes(lower)
  );

  if (!visible.length) {
    nav.innerHTML = `<div class="nav-no-result">Aucun résultat</div>`;
    return;
  }

  nav.innerHTML = visible.map(c => `
    <button class="nav-item ${c.id === currentCharId ? 'active' : ''}" data-id="${c.id}">
      <span class="nav-num">#${String(c.id).padStart(2, '0')}</span>
      <span class="nav-name">${c.name}</span>
    </button>
  `).join('');
}

function renderGrid(filter = '') {
  const grid = $('character-grid');
  const lower = filter.toLowerCase().trim();
  const visible = RAW_CHARACTERS.filter(c =>
    c.name.toLowerCase().includes(lower) ||
    String(c.id).includes(lower)
  );
  grid.innerHTML = visible.map(buildCard).join('');
}

function showHome() {
  currentCharId = null;
  $('home-page').classList.add('active');
  $('char-page').classList.remove('active');
  $('breadcrumb-section').textContent = 'Accueil';
  $('breadcrumb-char').textContent = '';
  renderNav($('search').value);
  closeSidebar();
}

function showChar(id) {
  const char = RAW_CHARACTERS.find(c => c.id === id);
  if (!char) return;

  currentCharId = id;
  $('char-detail').innerHTML = buildCharPage(char, RAW_CHARACTERS);
  $('home-page').classList.remove('active');
  $('char-page').classList.add('active');

  $('breadcrumb-section').textContent = 'Personnages';
  $('breadcrumb-char').textContent = char.name;

  // Update nav active state
  renderNav($('search').value);

  // Scroll active nav item into view
  const activeBtn = document.querySelector('.nav-item.active');
  if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  // Scroll content to top
  $('content').scrollTo({ top: 0, behavior: 'instant' });
  window.scrollTo({ top: 0, behavior: 'instant' });

  closeSidebar();
}

// ══════════════════════════════════════════════
// SIDEBAR MOBILE
// ══════════════════════════════════════════════

function openSidebar() {
  $('sidebar').classList.add('open');
  $('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════

// Nav click (sidebar)
$('char-nav').addEventListener('click', e => {
  const btn = e.target.closest('.nav-item');
  if (btn) showChar(Number(btn.dataset.id));
});

// Grid card click
$('character-grid').addEventListener('click', e => {
  const card = e.target.closest('.char-card');
  if (card) showChar(Number(card.dataset.id));
});

// Char page prev/next buttons (event delegation)
$('char-detail').addEventListener('click', e => {
  const btn = e.target.closest('[data-goto]');
  if (btn) showChar(Number(btn.dataset.goto));
});

// Logo → home
document.querySelector('#logo').addEventListener('click', showHome);
document.querySelector('#breadcrumb-section').addEventListener('click', showHome);

// Browse button
$('btn-browse').addEventListener('click', () => {
  const firstCard = document.querySelector('.char-card');
  if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Search
$('search').addEventListener('input', e => {
  const val = e.target.value;
  renderNav(val);
  renderGrid(val);
});

// Hamburger
$('hamburger').addEventListener('click', openSidebar);
$('sidebar-toggle').addEventListener('click', closeSidebar);
$('overlay').addEventListener('click', closeSidebar);

// Keyboard nav
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if ($('sidebar').classList.contains('open')) closeSidebar();
    else if (currentCharId) showHome();
  }
  if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    $('search').focus();
    openSidebar();
  }
});

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════

(function init() {
  // Update total count
  const countEl = $('total-count');
  if (countEl) countEl.textContent = RAW_CHARACTERS.length;

  // Badge in topbar
  $('char-count-badge').textContent = `${RAW_CHARACTERS.length} personnages`;

  renderNav();
  renderGrid();
})();
