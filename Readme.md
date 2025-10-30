# 🌿 Bloomholm

**Bloomholm** é um web game leve e relaxante feito em **HTML, CSS e JavaScript puro**, inspirado visualmente em *MMORPG* e *PACMAN*.  
Você joga como um jardineiro que deve **plantar, colher e entregar flores** ao mercador para ganhar moedas — enquanto evita os **ladrões** que vagam pelo mapa!

---

## 🪴 Enredo

Em **Bloomholm**, um pequeno lar onde tudo floresce, o equilíbrio do jardim depende de você.  
Explore o campo, colha flores, participe de minijogos e ajude o mercador local a manter o vilarejo em harmonia.  
Mas cuidado — ladrões surgem do nada e tentarão roubar tudo o que você conquistou!

---

## 🎮 Funcionalidades

- 🌸 **Coleta e entrega de flores**: mova-se pelo mapa, colha flores e troque com o mercador por moedas.  
- 💰 **Sistema de moedas**: use suas moedas para jogar o minijogo e ganhar recompensas.  
- 🎩 **Minijogo de memória**: acerte a sequência de ações e ganhe chapéus e bônus.  
- 👒 **Personalização de personagem**: troque de chapéus e mostre seu estilo no campo.  
- ⚙️ **Painel de configurações**: acesse comentários e o manual do jogo via modais elegantes.  
- 🌼 **Flores infinitas**: a cada 3 minutos, novas flores nascem automaticamente até o limite máximo de 18.  
- 💀 **Ladrões (vilões)**: de 1 a 5 ladrões surgem aleatoriamente a cada 1,5 minutos e perseguem o jogador — se te tocarem, você perde tudo!  
- 🕓 **Ladrões temporários**: desaparecem automaticamente após 30 segundos, mantendo o jogo dinâmico.  
- 🌲 **Mapa procedural**: gerado a cada partida, com árvores, moitas e solo inspirados no estilo clássico de RPG 2D.  
- 📱 **Totalmente responsivo**: controles touch aparecem automaticamente em dispositivos móveis.

---

## 🕹️ Controles

| Ação | Tecla / Botão |
|------|----------------|
| Mover para cima | `W` ou `↑` |
| Mover para baixo | `S` ou `↓` |
| Mover para esquerda | `A` ou `←` |
| Mover para direita | `D` ou `→` |
| Colher / Interagir | `BOTÕES DE MOVIMENTO` |
| Jogar minijogo | Botão **“Plantar / Minijogo”** |
| Abrir configurações | ⚙️ ícone no topo direito |

---

## 🧩 Estrutura do Projeto


---

## ⚙️ Principais Sistemas

- **Geração Procedural:** cria o mapa com bordas florestadas, moitas, solo e lagos.  
- **Spawn de Flores:** flores surgem em posições aleatórias até o limite definido.  
- **Spawn de Ladrões:** ladrões aparecem aleatoriamente, perseguem o jogador e somem após 30s.  
- **Minijogo de Sequência:** sistema de Simon-like integrado ao loop principal.  
- **Sistema de Log:** todas as ações são registradas em tempo real no painel inferior.

---

## 🧠 Conceito do Nome

> **Bloomholm** = *Bloom* (florescer) + *Holm* (ilha / lar pequeno em nórdico antigo).  
> 🌿 Significa poeticamente: **“Pequeno lar onde tudo floresce.”**

Essa ideia guia o visual, o ritmo e a atmosfera tranquila do jogo.

---

## 🚀 Como Jogar

```bash
git clone https://github.com/LeonardoSousa89/Bloomholm.git
```
```bash
cd Bloomholm
```
```bash
npx serve .
```
```bash
localhost:3000
```
- Passos do jogo:  
    - Escolha o nome do seu personagem.  
    - Mova-se pelo campo, colha flores e entregue-as ao mercador.  
    - Jogue o minijogo para ganhar chapéus e moedas extras.  
    - Evite os ladrões e continue florescendo seu jardim!
---

## 🧑‍💻 Tecnologias Usadas

- **HTML5 Canvas** — para renderizar o mapa e personagens  
- **CSS3** — para responsividade e interface moderna  
- **JavaScript (ES6+)** — lógica do jogo, geração procedural e IA simples  

---

## 🔮 Próximas Atualizações

- Sistema de **XP / Níveis**
- Eventos climáticos (chuva e dia/noite)
- Ladrões com **personalidades diferentes**
- **Mercador aprimorado** com loja de upgrades
- Sons e trilhas leves de ambiente

---

## Licença
Este projeto está licenciado sob a Licença MIT [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


---

> **“Bloomholm — um pequeno lar onde tudo floresce e uma pequena aventura para se viver.”**

