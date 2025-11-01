(() => {
  // elementos DOM
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const coinsEl = document.getElementById("coins");
  const flowersEl = document.getElementById("flowers");
  const logEl = document.getElementById("log");
  const seedBtn = document.getElementById("seedBtn");
  const minibox = document.getElementById("minigame");

  // modal de nome do jogador
  const nameModal = document.getElementById("nameModal");
  const nameInput = document.getElementById("playerNameInput");
  const confirmBtn = document.getElementById("confirmNameBtn");

  // constantes do mapa / grid
  const TILE = 32;
  const MAP_W = 20;
  const MAP_H = 15;

  // estado do jogo
  const player = { x: 10, y: 8, color: "#2b5d34", name: "Jogador", hat: 0 };
  const merchant = { x: 2, y: 2, name: "Mercador" };

  let keys = {};
  let coins = 0;
  let flowers = 0;
  let map = [];
  let flowersArr = [];

  nameModal.style.display = "flex"; // mostra o modal logo no início

  /* ---------- utilidades ---------- */
  function pushLog(text) {
    const line = document.createElement("div");
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function updateUI() {
    coinsEl.textContent = coins;
    flowersEl.textContent = flowers;
  }

  /* ---------- mapa  ----------
     NOTE: bordas devem usar MAP_H para y e MAP_W para x.
  */
  function generateMap() {
    map = [];
    for (let y = 0; y < MAP_H; y++) {
      map[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        // 🔹 1) Borda principal — floresta garantida
        if (y === 0 || x === 0 || y === MAP_H - 1 || x === MAP_W - 1) {
          map[y][x] = 1; // árvore
          continue;
        }

        // 🔹 2) Segunda camada da borda — floresta irregular
        if (y === 1 || x === 1 || y === MAP_H - 2 || x === MAP_W - 2) {
          // 35% chance de árvore, 15% moita, resto grama
          const r = Math.random();
          if (r < 0.35) {
            map[y][x] = 1; // árvore
          } else if (r < 0.5) {
            map[y][x] = 3; // moita / arbusto
          } else {
            map[y][x] = 0;
          }
          continue;
        }

        // 🔹 3) Obstáculos leves já existentes
        if (Math.random() < 0.05) {
          map[y][x] = 2; // lago / água
          continue;
        }

        if (Math.random() < 0.04) {
          map[y][x] = 3; // moita / arvore pequena
          continue;
        }

        // 🔹 4) Solo sutil para textura (novo tile 4)
        if (Math.random() < 0.03) {
          map[y][x] = 4; // solo / terra
          continue;
        }

        // 🔹 5) Grama padrão
        map[y][x] = 0;
      }
    }
    // ✅ Garantir que o mercador nunca fique preso
    clearAroundMerchant();
  }

  function placeFlowers(count = 18) {
    flowersArr = [];
    for (let n = 0; n < count; n++) {
      let fx, fy;
      do {
        fx = Math.floor(Math.random() * (MAP_W - 2)) + 1;
        fy = Math.floor(Math.random() * (MAP_H - 2)) + 1;
      } while (map[fy][fx] !== 0);
      flowersArr.push({ x: fx, y: fy, picked: false });
    }
  }

  /* ---------- desenho ---------- */
  function drawTile(x, y, t) {
    const sx = x * TILE,
      sy = y * TILE;

    // gramado
    if (t === 0) {
      ctx.fillStyle = "#c8e6b8";
      ctx.fillRect(sx, sy, TILE, TILE);
    }

    // água
    if (t === 2) {
      ctx.fillStyle = "#7ec0d4";
      ctx.fillRect(sx, sy, TILE, TILE);
    }

    // solo / trilha (novo)
    if (t === 4) {
      ctx.fillStyle = "#b59f7b";
      ctx.fillRect(sx, sy, TILE, TILE);
    }

    // árvore (novo estilo inspirado no tibia)
    if (t === 1) {
      ctx.fillStyle = "#3f8e47"; // copa
      ctx.beginPath();
      ctx.arc(sx + TILE / 2, sy + TILE / 2 - 4, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#6a4128"; // tronco
      ctx.fillRect(sx + TILE / 2 - 2, sy + TILE / 2 + 2, 4, 7);
    }

    // moita
    if (t === 3) {
      ctx.fillStyle = "#1f5d2f";
      ctx.fillRect(sx + 6, sy + 10, TILE - 12, TILE - 14);
    }
  }

  /* ---------- desenho do jogador + chapéus ---------- */

  function drawPlayer(tx, ty) {
    const sx = tx * TILE + TILE / 2,
      sy = ty * TILE + TILE / 2;

    // sombra
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // corpo
    ctx.fillStyle = player.color;
    ctx.fillRect(sx - 8, sy - 12, 16, 18);

    // rosto
    ctx.fillStyle = "#fee6c4";
    ctx.fillRect(sx - 6, sy - 24, 12, 12);

    // olhos
    ctx.fillStyle = "#222";
    ctx.fillRect(sx - 3, sy - 20, 2, 2);
    ctx.fillRect(sx + 1, sy - 20, 2, 2);

    // CHAPÉUS
    if (player.hat === 1) {
      // 🎩 Chapéu vermelho (clássico)
      ctx.fillStyle = "#d9534f";
      ctx.fillRect(sx - 7, sy - 26, 14, 4);
    } else if (player.hat === 2) {
      // 🎩 Chapéu azul (pontudo)
      ctx.fillStyle = "#3b83bd";
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy - 25);
      ctx.lineTo(sx, sy - 32);
      ctx.lineTo(sx + 8, sy - 25);
      ctx.fill();
    } else if (player.hat === 3) {
      // 🎩 Chapéu verde (novo modelo — aba curva estilo aventureiro)
      ctx.fillStyle = "#2e8b57";
      ctx.beginPath();
      ctx.moveTo(sx - 9, sy - 27);
      ctx.lineTo(sx + 9, sy - 27);
      ctx.lineTo(sx + 6, sy - 31);
      ctx.lineTo(sx - 6, sy - 31);
      ctx.closePath();
      ctx.fill();

      // pequeno detalhe dourado na lateral
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(sx + 4, sy - 30, 2, 2);
    }
  }

  function drawMerchant(tx, ty) {
    const sx = tx * TILE + TILE / 2,
      sy = ty * TILE + TILE / 2;
    ctx.fillStyle = "#c48a3f";
    ctx.fillRect(sx - 10, sy - 14, 20, 20);
    ctx.fillStyle = "#fff";
    ctx.fillRect(sx - 6, sy - 10, 12, 8);
    ctx.fillStyle = "#4b3a2b";
    ctx.fillRect(sx - 12, sy + 8, 24, 6);
  }

  function drawFlowers() {
    flowersArr.forEach((f) => {
      if (!f.picked) {
        const cx = f.x * TILE + TILE / 2,
          cy = f.y * TILE + TILE / 2;
        ctx.fillStyle = "#2b7a34";
        ctx.fillRect(cx - 1, cy, 2, 8);
        ctx.fillStyle = "#ff6fb3";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffd76b";
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
      }
    });
  }

  /* desenha nomes dos personagens */
  function drawNames() {
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    // jogador
    const px = player.x * TILE + TILE / 2;
    const py = player.y * TILE;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(player.name, px + 1, py - 9);
    ctx.fillStyle = "#fdfdfd";
    ctx.fillText(player.name, px, py - 10);

    // mercador
    const mx = merchant.x * TILE + TILE / 2;
    const my = merchant.y * TILE;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(merchant.name, mx + 1, my - 9);
    ctx.fillStyle = "#ffe7a1";
    ctx.fillText(merchant.name, mx, my - 10);

    // ladrões
    thieves.forEach((t) => {
      const tx = t.x * TILE + TILE / 2;
      const ty = t.y * TILE;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText("Ladrão", tx + 1, ty - 9);
      ctx.fillStyle = "#ff8080"; // vermelho claro para destacar
      ctx.fillText("Ladrão", tx, ty - 10);
    });
  }

  /* ---------- lógica de interação ---------- */
  function tileAt(x, y) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return 1;
    return map[y][x];
  }

  function attemptPick() {
    // colher flores no tile
    flowersArr.forEach((f) => {
      if (!f.picked && f.x === player.x && f.y === player.y) {
        f.picked = true;
        flowers++;
        updateUI();
        pushLog("Você colheu uma flor 🌸");
      }
    });

    // entregar ao mercador
    if (player.x === merchant.x && player.y === merchant.y) {
      if (flowers > 0) {
        const gained = flowers * 3;
        coins += gained;
        pushLog(`Entregou ${flowers} flor(es) e ganhou ${gained} moedas.`);
        flowers = 0;
        updateUI();
      } else {
        pushLog("Mercador: Traga flores para trocar por moedas.");
      }
    }
  }

  function tryMove(dx, dy) {
    const nx = player.x + dx,
      ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) return;
    const t = tileAt(nx, ny);
    if (t === 1 || t === 2 || t === 3 || t === 4) return;
    player.x = nx;
    player.y = ny;
    attemptPick();
  }

  /* ---------- desenho loop ---------- */
  function draw() {
    // limpar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        drawTile(x, y, map[y][x]);
      }
    }

    // coisas no mapa
    drawFlowers();
    drawMerchant(merchant.x, merchant.y);
    drawPlayer(player.x, player.y);
    drawNames();
    drawThieves();
  }

  function loop() {
    draw();
    moveThieves();
    checkThiefCollision();
    requestAnimationFrame(loop);
  }

  /* ---------- controles ---------- */
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === "w" || k === "arrowup") tryMove(0, -1);
    if (k === "s" || k === "arrowdown") tryMove(0, 1);
    if (k === "a" || k === "arrowleft") tryMove(-1, 0);
    if (k === "d" || k === "arrowright") tryMove(1, 0);
    if (k === "e") attemptPick();
  });
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

  document.querySelectorAll(".ctrl-btn").forEach((btn) => {
    btn.addEventListener(
      "touchstart",
      () => {
        const dir = btn.dataset.dir;
        if (dir === "up") tryMove(0, -1);
        if (dir === "down") tryMove(0, 1);
        if (dir === "left") tryMove(-1, 0);
        if (dir === "right") tryMove(1, 0);
      },
      { passive: true }
    );
  });

  /* ---------- minijogo (custo 10 moedas) ---------- */
  const MINI_COST = 10;
  const MINI_REWARD_COINS = 5; // moedas dadas ao completar o minijogo
  const MINI_SEQUENCE_LENGTH = 3;

  function openMiniBox() {
    // checa saldo
    if (coins < MINI_COST) {
      pushLog(`Você precisa de ${MINI_COST} moedas para jogar o minijogo!`);
      return;
    }

    // debita ao abrir (decisão de design: debitar na abertura)
    coins -= MINI_COST;
    updateUI();
    pushLog(`Você pagou ${MINI_COST} moedas para jogar o minijogo 🎮`);

    // mostra UI do minijogo com botões reajustados
    showMiniStart();
    minibox.style.display = "block";
  }

  function showMiniStart() {
    minibox.innerHTML = `
      <div id="mini-msg">Sequência: memorize e repita</div>
      <div id="seq" style="margin-top:8px"></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button id="startMini">Iniciar</button>
        <button id="closeMini">Fechar</button>
      </div>
    `;

    // re-bind buttons
    const startBtn = document.getElementById("startMini");
    const closeBtn = document.getElementById("closeMini");
    if (startBtn) startBtn.addEventListener("click", startMiniGame);
    if (closeBtn)
      closeBtn.addEventListener(
        "click",
        () => (minibox.style.display = "none")
      );
  }

  function startMiniGame() {
    // cria sequência e a mostra por curto tempo
    const pool = ["Plantar", "Regar", "Colher"];
    const seq = [];
    for (let i = 0; i < MINI_SEQUENCE_LENGTH; i++)
      seq.push(pool[Math.floor(Math.random() * pool.length)]);

    const seqDiv = document.getElementById("seq");
    if (!seqDiv) return;
    seqDiv.textContent = seq.join(" → ");
    pushLog("Minijogo iniciado: memorize a sequência.");

    // após mostrar, transforma em botões para o jogador repetir
    setTimeout(() => {
      seqDiv.innerHTML = "";
      pool.forEach((p) => {
        const b = document.createElement("button");
        b.textContent = p;
        b.style.marginRight = "6px";
        seqDiv.appendChild(b);
        b.addEventListener("click", () => handleMiniClick(p, seq));
      });
    }, 1400);
  }

  function handleMiniClick(choice, seq) {
    if (!document._mini_state) document._mini_state = { pos: 0, seq };
    const st = document._mini_state;
    if (choice === st.seq[st.pos]) {
      st.pos++;
      pushLog(`Você acertou: ${choice}`);
      if (st.pos >= st.seq.length) {
        // vitória: recompensas
        pushLog(
          `Minijogo completo! Ganhou um chapéu 🎩 e ${MINI_REWARD_COINS} moedas 💰.`
        );
        coins += MINI_REWARD_COINS;
        updateUI();
        giveCosmetic();
        generateFlowersOnWin(3);
        document._mini_state = null;
        minibox.style.display = "none";
        // restaura HTML inicial do minigame para próxima vez
        restoreMiniHTML();
      }
    } else {
      pushLog("Errou a sequência. Tente de novo.");
      document._mini_state = null;
      restoreMiniHTML();
    }
  }

  function restoreMiniHTML() {
    // garante que os botões Start/Close existam e estejam ligados
    minibox.innerHTML =
      '<div id="mini-msg">Clique na sequência correta para plantar e regar.</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px"><button id="startMini">Iniciar</button><button id="closeMini">Fechar</button></div>';
    const newStart = document.getElementById("startMini");
    const newClose = document.getElementById("closeMini");
    if (newStart) newStart.addEventListener("click", () => startMiniGame());
    if (newClose)
      newClose.addEventListener(
        "click",
        () => (minibox.style.display = "none")
      );
  }

  /**
   * Gera N flores no mapa quando o jogador vence um minijogo.
   * - count: número de flores a gerar (padrão 3)
   * - respeita limite máximo total de flores no mapa (MAX_FLOWERS = 18)
   * - evita tiles ocupados por obstáculos, bordas, jogador e mercador
   */
  function generateFlowersOnWin(count = 3) {
    const MAX_FLOWERS = 18; // 🌸 novo limite máximo global
    // conta quantas flores ativas existem (não colhidas)
    const activeFlowers = flowersArr.filter((f) => !f.picked).length;

    // se já estamos no limite, não gera novas flores
    if (activeFlowers >= MAX_FLOWERS) {
      pushLog(`O jardim já está cheio com ${activeFlowers} flores 🌸`);
      return;
    }

    // quantas podemos realmente adicionar sem ultrapassar o limite
    const canAdd = Math.min(count, MAX_FLOWERS - activeFlowers);
    let added = 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 200; // evita loop infinito em mapas cheios

    while (added < canAdd && attempts < MAX_ATTEMPTS) {
      attempts++;

      // gera coordenadas válidas dentro do mapa (sem bordas)
      const fx = Math.floor(Math.random() * (MAP_W - 2)) + 1;
      const fy = Math.floor(Math.random() * (MAP_H - 2)) + 1;

      // apenas em tiles de chão (0)
      if (map[fy][fx] !== 0) continue;

      // evita sobrepor jogador ou mercador
      if (
        (fx === player.x && fy === player.y) ||
        (fx === merchant.x && fy === merchant.y)
      )
        continue;

      // evita duplicar flores
      const already = flowersArr.some(
        (f) => !f.picked && f.x === fx && f.y === fy
      );
      if (already) continue;

      // adiciona nova flor válida
      flowersArr.push({ x: fx, y: fy, picked: false });
      added++;
    }

    if (added > 0) {
      pushLog(`🌼 ${added} nova(s) flor(es) brotaram no jardim!`);
    } else {
      pushLog("Nenhum espaço disponível para novas flores.");
    }

    // atualiza a interface (HUD)
    if (typeof updateUI === "function") updateUI();
  }

  /* ---------- inventário / chapéus colecionáveis ---------- */
  function giveCosmetic() {
    // encontra o primeiro slot vazio
    let found = null;
    for (let i = 0; i < 3; i++) {
      const el = document.getElementById("slot-" + i);
      if (el && el.textContent.trim() === "—") {
        found = el;
        break;
      }
    }

    if (!found) {
      pushLog("Inventário cheio.");
      return;
    }

    // determina qual chapéu ainda não foi ganho
    const ownedHats = Array.from({ length: 3 }, (_, i) => {
      const el = document.getElementById("slot-" + i);
      return el ? el.dataset.hatType : null;
    });

    let hatType = 1;
    if (!ownedHats.includes("1")) hatType = 1;
    else if (!ownedHats.includes("2")) hatType = 2;
    else if (!ownedHats.includes("3")) hatType = 3;

    // define nome e estilo conforme o tipo
    let hatName = "";
    switch (hatType) {
      case 1:
        hatName = "Chapéu vermelho";
        break;
      case 2:
        hatName = "Chapéu azul";
        break;
      case 3:
        hatName = "Chapéu verde";
        break;
    }

    // adiciona ao inventário
    found.textContent = hatName;
    found.dataset.hatType = hatType;

    // define ação de clique para equipar
    found.onclick = () => {
      player.hat = hatType;
      pushLog(`Equipou ${hatName}.`);
    };

    pushLog(`${hatName} adicionado ao inventário!`);
  }

  function clearAroundMerchant() {
    const mx = merchant.x;
    const my = merchant.y;

    const tiles = [
      [mx, my], // posição do mercador
      [mx + 1, my],
      [mx - 1, my],
      [mx, my + 1],
      [mx, my - 1],
    ];

    for (const [x, y] of tiles) {
      if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) {
        map[y][x] = 0; // garante chão livre
      }
    }
  }

  /* ======== SISTEMA DE LADRÕES - MOVIMENTO PAC-MAN ======== */

  let thieves = [];
  const MAX_THIEVES = 5;
  const THIEF_SPAWN_INTERVAL = 90 * 1000; // 1.5 min
  const THIEF_MOVE_INTERVAL = 40; // frames entre movimentos (~10x/s)
  const THIEF_TUNNEL_DELAY = 50; // se estiver "preso", move mais devagar
  const THIEF_LIFETIME = 30 * 1000; // 30 segundos de duração

  /**
   * Cria de 1 a 5 ladrões em posições aleatórias válidas.
   */
  /**
   * Cria de 1 até MAX_THIEVES ladrões em posições aleatórias válidas.
   */
  function spawnThieves() {
    // garante que nunca existam mais que o limite simultaneamente
    if (thieves.length >= MAX_THIEVES) return;

    // número aleatório, mas limitado ao máximo permitido
    const num = Math.min(
      Math.floor(Math.random() * MAX_THIEVES) + 1,
      MAX_THIEVES - thieves.length
    );

    pushLog(`⚠️ ${num} ladrão(ões) apareceram no jardim! Evite-os por 30s!`);

    for (let i = 0; i < num; i++) {
      let tx, ty;
      let attempts = 0;
      do {
        tx = Math.floor(Math.random() * (MAP_W - 2)) + 1;
        ty = Math.floor(Math.random() * (MAP_H - 2)) + 1;
        attempts++;
        if (attempts > 200) break;
      } while (
        map[ty][tx] !== 0 ||
        (tx === player.x && ty === player.y) ||
        (tx === merchant.x && ty === merchant.y)
      );

      thieves.push({
        x: tx,
        y: ty,
        moveTimer: 0,
        mode: "chase", // "chase" ou "tunnel"
        spawnTime: Date.now(),
      });
    }

    // programar remoção automática após 30 segundos
    setTimeout(() => {
      const elapsed = Date.now() - (thieves[0]?.spawnTime || 0);
      if (elapsed >= THIEF_LIFETIME) {
        thieves = [];
        pushLog("💨 Os ladrões fugiram do jardim!");
      }
    }, THIEF_LIFETIME);
  }

  /**
   * Movimenta ladrões inspirados nos fantasmas de Pac-Man.
   */
  function moveThieves() {
    thieves.forEach((t) => {
      t.moveTimer++;
      const delay =
        t.mode === "tunnel" ? THIEF_TUNNEL_DELAY : THIEF_MOVE_INTERVAL;

      if (t.moveTimer < delay) return;
      t.moveTimer = 0;

      const dx = player.x - t.x;
      const dy = player.y - t.y;

      // comportamento: perseguição direta
      let nx = t.x;
      let ny = t.y;

      // 75% das vezes ele tenta seguir o eixo maior (inteligência leve)
      if (Math.random() < 0.75) {
        if (Math.abs(dx) > Math.abs(dy)) nx += Math.sign(dx);
        else ny += Math.sign(dy);
      } else {
        // 25% aleatório (simula erro de caminho)
        if (Math.random() < 0.5) nx += Math.sign(dx);
        else ny += Math.sign(dy);
      }

      // colisão com obstáculo
      if (map[ny]?.[nx] === 0) {
        t.x = nx;
        t.y = ny;
        t.mode = "chase"; // livre
      } else {
        // tenta eixo alternativo
        if (map[t.y + Math.sign(dy)]?.[t.x] === 0) {
          t.y += Math.sign(dy);
        } else if (map[t.y]?.[t.x + Math.sign(dx)] === 0) {
          t.x += Math.sign(dx);
        } else {
          // está preso → modo túnel
          t.mode = "tunnel";
        }
      }
    });
  }

  /**
   * Verifica se o jogador foi pego.
   */
  function checkThiefCollision() {
    for (const t of thieves) {
      if (t.x === player.x && t.y === player.y) {
        handlePlayerCaught();
        break;
      }
    }
  }

  /** Quando o jogador é pego. */
  function handlePlayerCaught() {
    coins = 0;
    flowers = 0;
    player.hat = 0;

    // limpa completamente os slots de inventário
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById("slot-" + i);
      if (slot) {
        slot.textContent = "—"; // remove o texto
        delete slot.dataset.hatType; // remove referência de tipo
        slot.onclick = null; // remove ação de clique
      }
    }

    thieves = [];
    updateUI();
    pushLog("💀 Um ladrão te pegou! Você perdeu tudo!");
  }

  /**
   * Desenha ladrões (fantasma-style)
   */
  function drawThieves() {
    thieves.forEach((t) => {
      const sx = t.x * TILE + TILE / 2;
      const sy = t.y * TILE + TILE / 2;

      // corpo arredondado tipo fantasma
      ctx.fillStyle = t.mode === "tunnel" ? "#5a3c3c" : "#4a1d1d";
      ctx.beginPath();
      ctx.arc(sx, sy, 10, Math.PI, 0);
      ctx.lineTo(sx + 10, sy + 10);
      ctx.lineTo(sx - 10, sy + 10);
      ctx.closePath();
      ctx.fill();

      // olhos
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx - 4, sy - 5, 3, 3);
      ctx.fillRect(sx + 1, sy - 5, 3, 3);
      ctx.fillStyle = "#222";
      ctx.fillRect(sx - 3, sy - 4, 1, 1);
      ctx.fillRect(sx + 2, sy - 4, 1, 1);
    });
  }

  /**
   * Inicializa o sistema dos ladrões.
   */
  function initThieves() {
    spawnThieves();
    setInterval(spawnThieves, THIEF_SPAWN_INTERVAL);
  }

  /* ---------- modais / settings ---------- */
  const settingsModal = document.getElementById("settingsModal");
  const commentModal = document.getElementById("commentModal");
  const manualModal = document.getElementById("manualModal");

  document.getElementById("settingsBtn").onclick = () =>
    (settingsModal.style.display = "flex");
  document.getElementById("closeSettings").onclick = () =>
    (settingsModal.style.display = "none");
  document.getElementById("openComment").onclick = () => {
    settingsModal.style.display = "none";
    commentModal.style.display = "flex";
  };
  document.getElementById("closeComment").onclick = () =>
    (commentModal.style.display = "none");
  document.getElementById("openManual").onclick = () => {
    settingsModal.style.display = "none";
    manualModal.style.display = "flex";
  };
  document.getElementById("openTechnicalManual").onclick = () =>
    window.open("http://localhost:3000/doc");
  document.getElementById("closeManual").onclick = () =>
    (manualModal.style.display = "none");

  window.onclick = (e) => {
    if (e.target.classList && e.target.classList.contains("modal"))
      e.target.style.display = "none";
  };

  /* ---------- inicialização ---------- */
  function init() {
    // dimensionamento do canvas (coincide com TILE * MAP)
    canvas.width = TILE * MAP_W;
    canvas.height = TILE * MAP_H;

    generateMap();
    placeFlowers(18);
    updateUI();
    restoreMiniHTML(); // prepara os botões do minigame
    loop();
    initThieves();

    /* ========= CRESCIMENTO CONTÍNUO DE FLORES ========= */
    function spawnFlowersPeriodic() {
      // Conta flores existentes no mapa (não coletadas)
      const activeFlowers = flowersArr.filter((f) => !f.picked).length;

      // Limite máximo
      if (activeFlowers >= 18) return;

      // Quantas flores queremos gerar agora
      let flowersToSpawn = Math.min(5, 18 - activeFlowers);

      for (let i = 0; i < flowersToSpawn; i++) {
        let fx, fy;
        let tries = 0;

        // Procura posição válida
        do {
          fx = Math.floor(Math.random() * (MAP_W - 2)) + 1;
          fy = Math.floor(Math.random() * (MAP_H - 2)) + 1;
          tries++;
        } while (
          tries < 30 && // evita travar em mapas densos
          (map[fy][fx] !== 0 || // precisa ser grama
            flowersArr.some((f) => !f.picked && f.x === fx && f.y === fy)) // já tem flor ali
        );

        // Se encontrou tile de grama livre
        if (map[fy][fx] === 0) {
          flowersArr.push({ x: fx, y: fy, picked: false });
        }
      }

      pushLog(`🌱 Novas flores nasceram no jardim! (+${flowersToSpawn})`);
    }

    // Executa automaticamente a cada 3 minutos (180000 ms)
    setInterval(spawnFlowersPeriodic, 180000);

    pushLog("Jogo iniciado — explore, colete flores e jogue minijogos!");
  }

  // ligado ao botão plantar/minijogo
  seedBtn.addEventListener("click", openMiniBox);

  confirmBtn.addEventListener("click", () => {
    const name = nameInput.value.trim() || "char";
    player.name = name;
    nameModal.style.display = "none";
    pushLog(`Bem-vindo, ${name}! 🌸`);
  });

  // inicia
  init();
})();
