/**
 * ============================================================================
 * O LABORATÓRIO 0 - JOGO 2D DE INVESTIGAÇÃO E MISTÉRIO
 * HTML5, CSS3 e JavaScript Puro (Sem dependências externas)
 * ============================================================================
 */

// ============================================================================
// AUDIO (SINTETIZADOR WEB AUDIO API)
// ============================================================================
const SoundFX = {
  ctx: null,
  masterGain: null,
  ambientNode: null,
  volume: 0.8,
  muted: false,

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startAmbientDrone();
    } catch (e) {
      console.warn("Web Audio API não inicializado:", e);
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
  },

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2) {
    if (!this.ctx || this.muted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playFootstep() {
    if (!this.ctx || this.muted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(70 + Math.random() * 30, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  },

  playDoorOpen() {
    if (!this.ctx || this.muted) return;
    this.resume();
    // Ruído metálico deslizante
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  },

  playDoorLocked() {
    if (!this.ctx || this.muted) return;
    this.playTone(180, 'square', 0.12, 0.25);
    setTimeout(() => this.playTone(140, 'square', 0.2, 0.25), 140);
  },

  playTerminalKey() {
    if (!this.ctx || this.muted) return;
    const freq = 1200 + Math.random() * 400;
    this.playTone(freq, 'sine', 0.03, 0.05);
  },

  playItemPickup() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.18, 0.15), i * 70);
    });
  },

  playClueDiscovered() {
    if (!this.ctx || this.muted) return;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.2), i * 90);
    });
  },

  playSwitchClick() {
    if (!this.ctx || this.muted) return;
    this.playTone(320, 'square', 0.05, 0.2);
    setTimeout(() => this.playTone(120, 'triangle', 0.1, 0.3), 40);
  },

  playPuzzleSolved() {
    if (!this.ctx || this.muted) return;
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.4, 0.22), i * 110);
    });
  },

  playAlarm() {
    if (!this.ctx || this.muted) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(880, 'sawtooth', 0.15, 0.15);
        setTimeout(() => this.playTone(660, 'sawtooth', 0.15, 0.15), 160);
      }, i * 350);
    }
  },

  startAmbientDrone() {
    if (!this.ctx || this.ambientNode) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(55.4, this.ctx.currentTime); // Pequeno batimento de frequência

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      this.ambientNode = { osc1, osc2, gain };
    } catch (e) {
      console.warn("Ambient drone falhou:", e);
    }
  }
};

// ============================================================================
// SAVE SYSTEM & ESTADO GERAL DO JOGO
// ============================================================================
const GameState = {
  active: false,
  paused: false,
  chapter: 1,
  gameTime: "03:17 AM",
  energy: 12,
  currentRoomId: "entrance",
  flashlight: true,
  dynamicLighting: true,
  crtEffect: true,
  
  // Inventário do jogador
  inventory: [],
  
  // Missões concluídas (Quests por Capítulo)
  completedQuests: [],
  
  // Pistas e evidências catalogadas (IDs)
  discoveredEvidences: ["doc_anon_message"],
  
  // Documentos lidos
  readDocuments: ["doc_anon_message"],
  
  // Salas visitadas / descobertas
  visitedRooms: ["entrance"],
  
  // Puzzles resolvidos
  completedPuzzles: {
    fuses: false,
    keypad: false,
    terminal_login: false,
    switches: false,
    archive_sort: false,
    radio_tuning: false,
    cctv_clue: false,
    lab0_cryptex: false
  },
  
  // Portas destrancadas
  unlockedDoors: {
    entrance_reception: true,
    reception_hallway: false,     // Nível 1
    hallway_archive: true,
    hallway_medical: false,       // Nível 1
    hallway_research: false,      // Nível 2
    research_control: true,
    research_experimental: false, // Nível 2
    research_subsolo: false,      // Nível 2 + Energia >= 34%
    subsolo_restricted: false,    // Keypad 0317
    restricted_lab0: false        // Master Protocol 0
  },

  // Estado dos NPCs
  npcStates: {
    helena: { room: "medical", x: 1180, y: 780, talked: false, stage: 0 },
    marcos_holo: { room: "control", x: -80, y: 350, talked: false, stage: 0 },
    sistema_zero: { active: true, hostility: 0 }
  },

  // Objetivo atual
  currentObjective: "Inspecionar o portão e adentrar a Recepção",

  save() {
    try {
      const data = {
        chapter: this.chapter,
        gameTime: this.gameTime,
        energy: this.energy,
        currentRoomId: this.currentRoomId,
        playerPos: { x: Player.x, y: Player.y, dir: Player.dir },
        inventory: this.inventory,
        completedQuests: this.completedQuests,
        discoveredEvidences: this.discoveredEvidences,
        readDocuments: this.readDocuments,
        visitedRooms: this.visitedRooms,
        completedPuzzles: this.completedPuzzles,
        unlockedDoors: this.unlockedDoors,
        npcStates: this.npcStates,
        currentObjective: this.currentObjective
      };
      localStorage.setItem("lab0_savedata", JSON.stringify(data));
      showToast("💾 Jogo salvo com sucesso!");
      return true;
    } catch (e) {
      console.error("Falha ao salvar:", e);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem("lab0_savedata");
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.chapter = data.chapter || 1;
      this.gameTime = data.gameTime || "03:17 AM";
      this.energy = data.energy || 12;
      this.currentRoomId = data.currentRoomId || "entrance";
      this.inventory = data.inventory || [];
      this.completedQuests = data.completedQuests || [];
      this.discoveredEvidences = data.discoveredEvidences || [];
      this.readDocuments = data.readDocuments || [];
      this.visitedRooms = data.visitedRooms || ["entrance"];
      this.completedPuzzles = data.completedPuzzles || this.completedPuzzles;
      this.unlockedDoors = data.unlockedDoors || this.unlockedDoors;
      this.npcStates = data.npcStates || this.npcStates;
      this.currentObjective = data.currentObjective || this.currentObjective;

      if (data.playerPos) {
        Player.x = data.playerPos.x;
        Player.y = data.playerPos.y;
        Player.dir = data.playerPos.dir;
      }

      UI.updateHUD();
      showToast("📂 Jogo carregado com sucesso!");
      return true;
    } catch (e) {
      console.error("Falha ao carregar save:", e);
      return false;
    }
  },

  hasSave() {
    return !!localStorage.getItem("lab0_savedata");
  }
};

// ============================================================================
// SISTEMA DE COLISÃO & MATEMÁTICA
// ============================================================================
const Collision = {
  checkRectOverlap(r1, r2) {
    return !(
      r1.x + r1.w <= r2.x ||
      r1.x >= r2.x + r2.w ||
      r1.y + r1.h <= r2.y ||
      r1.y >= r2.y + r2.h
    );
  },

  // Verifica se uma caixa pretendida de colisão colide com as paredes da sala ou objetos
  canMoveTo(x, y, w, h) {
    const box = { x, y, w, h };

    // 1. Limites do mapa e paredes das salas
    // Obtém a sala atual e salas vizinhas
    const currentRoom = Rooms[GameState.currentRoomId];
    if (!currentRoom) return true;

    // Colisão com os limites externos globais da sala ativa (salvo passagens de portas)
    for (const wall of currentRoom.walls) {
      if (this.checkRectOverlap(box, wall)) {
        return false;
      }
    }

    // 2. Colisão com portas fechadas
    for (const doorKey in Doors) {
      const door = Doors[doorKey];
      if (door.roomA === GameState.currentRoomId || door.roomB === GameState.currentRoomId) {
        if (!GameState.unlockedDoors[doorKey]) {
          // Porta fechada = obstáculo físico
          if (this.checkRectOverlap(box, door.box)) {
            return false;
          }
        }
      }
    }

    // 3. Colisão com móveis e objetos sólidos
    for (const obj of currentRoom.objects) {
      if (obj.solid && this.checkRectOverlap(box, obj)) {
        return false;
      }
    }

    // 4. Colisão com NPCs sólidos
    for (const npcKey in NPCs) {
      const npc = NPCs[npcKey];
      const state = GameState.npcStates[npcKey];
      if (state && state.room === GameState.currentRoomId && npc.visible()) {
        const npcBox = { x: state.x - 14, y: state.y - 14, w: 28, h: 28 };
        if (this.checkRectOverlap(box, npcBox)) {
          return false;
        }
      }
    }

    return true;
  }
};

// ============================================================================
// ROOMS & WORLD MAP
// ============================================================================
const Rooms = {
  entrance: {
    id: "entrance",
    name: "ENTRADA EXTERNA",
    x: 400, y: 1500, w: 500, h: 400,
    darkness: 0.35,
    walls: [
      { x: 380, y: 1480, w: 20, h: 440 }, // parede oeste
      { x: 900, y: 1480, w: 20, h: 440 }, // parede leste
      { x: 380, y: 1900, w: 540, h: 20 }, // cerca sul
      { x: 380, y: 1480, w: 200, h: 20 }, // parede norte esq
      { x: 680, y: 1480, w: 240, h: 20 }  // parede norte dir (abertura porta 580..680)
    ],
    objects: [
      { id: "ent_sign", name: "Placa Enferrujada", x: 440, y: 1820, w: 60, h: 20, solid: true, type: "sign", text: "COMPLEXO 0 - ZONA MILITAR DESATIVADA EM 1998" },
      { id: "ent_gate_panel", name: "Painel de Controle da Guarita", x: 690, y: 1505, w: 40, h: 30, solid: true, type: "interact", action: "examine_gate" },
      { id: "ent_barrels", name: "Barris Industriais Abandonados", x: 420, y: 1530, w: 50, h: 40, solid: true, type: "decoration" }
    ]
  },

  reception: {
    id: "reception",
    name: "RECEPÇÃO DO COMPLEXO",
    x: 350, y: 1050, w: 600, h: 450,
    darkness: 0.28,
    walls: [
      { x: 330, y: 1030, w: 20, h: 490 }, // oeste
      { x: 950, y: 1030, w: 20, h: 490 }, // leste
      { x: 330, y: 1500, w: 250, h: 20 }, // sul esq
      { x: 680, y: 1500, w: 290, h: 20 }, // sul dir
      { x: 330, y: 1030, w: 250, h: 20 }, // norte esq (porta p/ corredor em 580..680)
      { x: 680, y: 1030, w: 290, h: 20 }  // norte dir
    ],
    objects: [
      { id: "rec_desk", name: "Balcão da Recepção", x: 520, y: 1220, w: 180, h: 50, solid: true, type: "desk" },
      { id: "rec_computer", name: "Terminal da Recepção", x: 570, y: 1210, w: 40, h: 30, solid: false, type: "terminal", termId: "term_reception" },
      { id: "rec_drawer", name: "Gaveta Trancada", x: 660, y: 1225, w: 30, h: 30, solid: true, type: "interact", action: "search_drawer" },
      { id: "rec_couch_1", name: "Sofá Rasgado", x: 380, y: 1380, w: 40, h: 80, solid: true, type: "furniture" },
      { id: "rec_couch_2", name: "Sofá Rasgado", x: 860, y: 1380, w: 40, h: 80, solid: true, type: "furniture" },
      { id: "rec_board", name: "Quadro de Avisos Antigo", x: 740, y: 1045, w: 80, h: 15, solid: true, type: "sign", text: "AVISO: Todo o pessoal deve portar crachá Nível 1. Experimentos do Subsolo são estritamente sigilosos." }
    ]
  },

  hallway: {
    id: "hallway",
    name: "CORREDOR PRINCIPAL",
    x: 250, y: 650, w: 800, h: 400,
    darkness: 0.35,
    walls: [
      { x: 230, y: 630, w: 20, h: 120 }, // oeste sup
      { x: 230, y: 850, w: 20, h: 220 }, // oeste inf (passagem arquivo 750..850)
      { x: 1050, y: 630, w: 20, h: 120 }, // leste sup
      { x: 1050, y: 850, w: 20, h: 220 }, // leste inf (passagem médica 750..850)
      { x: 230, y: 1050, w: 350, h: 20 }, // sul esq
      { x: 680, y: 1050, w: 390, h: 20 }, // sul dir
      { x: 230, y: 630, w: 350, h: 20 },  // norte esq (porta p/ pesquisa 580..680)
      { x: 680, y: 630, w: 390, h: 20 }   // norte dir
    ],
    objects: [
      { id: "hw_lockers", name: "Armários de Metal", x: 300, y: 650, w: 120, h: 30, solid: true, type: "furniture" },
      { id: "hw_stain", name: "Mancha Estranha no Chão", x: 620, y: 820, w: 50, h: 40, solid: false, type: "interact", action: "inspect_stain" },
      { id: "hw_cables", name: "Fiação Exposta", x: 760, y: 650, w: 80, h: 20, solid: false, type: "decoration" },
      { id: "hw_intercom", name: "Interfone de Parede (Sistema ZERO)", x: 520, y: 640, w: 30, h: 15, solid: true, type: "intercom" }
    ]
  },

  archive: {
    id: "archive",
    name: "ARQUIVO MORTO",
    x: -200, y: 650, w: 450, h: 400,
    darkness: 0.4,
    walls: [
      { x: -220, y: 630, w: 20, h: 440 }, // oeste
      { x: 230, y: 630, w: 20, h: 120 },  // leste sup
      { x: 230, y: 850, w: 20, h: 220 },  // leste inf
      { x: -220, y: 630, w: 470, h: 20 }, // norte
      { x: -220, y: 1050, w: 470, h: 20 } // sul
    ],
    objects: [
      { id: "arc_cabinets_1", name: "Arquivo de Casos (1984 - 1998)", x: -160, y: 660, w: 140, h: 35, solid: true, type: "puzzle", puzzleId: "archive_sort" },
      { id: "arc_cabinets_2", name: "Ficheiros Bloqueados", x: 40, y: 660, w: 140, h: 35, solid: true, type: "furniture" },
      { id: "arc_table", name: "Mesa de Triagem", x: -80, y: 820, w: 120, h: 60, solid: true, type: "desk" },
      { id: "arc_note", name: "Documento 001: Projeto 0", x: -60, y: 830, w: 30, h: 30, solid: false, type: "item_pickup", itemId: "doc_project0" },
      { id: "arc_safe", name: "Cofre Seguro do Arquivo", x: -180, y: 960, w: 50, h: 40, solid: true, type: "interact", action: "open_archive_safe" }
    ]
  },

  medical: {
    id: "medical",
    name: "ALA MÉDICA & QUARENTENA",
    x: 1050, y: 650, w: 450, h: 400,
    darkness: 0.3,
    walls: [
      { x: 1030, y: 630, w: 20, h: 120 }, // oeste sup
      { x: 1030, y: 850, w: 20, h: 220 }, // oeste inf
      { x: 1500, y: 630, w: 20, h: 440 }, // leste
      { x: 1030, y: 630, w: 490, h: 20 }, // norte
      { x: 1030, y: 1050, w: 490, h: 20 } // sul
    ],
    objects: [
      { id: "med_bed_1", name: "Maca Hospitalar", x: 1300, y: 700, w: 50, h: 80, solid: true, type: "furniture" },
      { id: "med_bed_2", name: "Maca Hospitalar Vazia", x: 1400, y: 700, w: 50, h: 80, solid: true, type: "furniture" },
      { id: "med_cabinet", name: "Armário de Medicamentos", x: 1100, y: 660, w: 80, h: 30, solid: true, type: "interact", action: "search_med_cabinet" },
      { id: "med_log", name: "Prontuário Confidencial do Sujeito Zero", x: 1310, y: 720, w: 30, h: 25, solid: false, type: "item_pickup", itemId: "doc_subject0" },
      { id: "med_recorder", name: "Gravador de Áudio da Dra. Helena", x: 1180, y: 920, w: 35, h: 25, solid: false, type: "interact", action: "play_helena_tape" }
    ]
  },

  research: {
    id: "research",
    name: "SETOR DE PESQUISA AVANÇADA",
    x: 150, y: 150, w: 900, h: 500,
    darkness: 0.3,
    walls: [
      { x: 130, y: 130, w: 20, h: 200 },  // oeste sup
      { x: 130, y: 450, w: 20, h: 220 },  // oeste inf (porta p/ controle 330..450)
      { x: 1050, y: 130, w: 20, h: 200 }, // leste sup
      { x: 1050, y: 450, w: 20, h: 220 }, // leste inf (porta exp 330..450)
      { x: 130, y: 650, w: 450, h: 20 },  // sul esq
      { x: 680, y: 650, w: 390, h: 20 },  // sul dir
      { x: 130, y: 130, w: 400, h: 20 },  // norte esq (elevador subsolo 530..670)
      { x: 670, y: 130, w: 400, h: 20 }   // norte dir
    ],
    objects: [
      { id: "res_workstation_1", name: "Bancada com Microscópios", x: 260, y: 280, w: 160, h: 60, solid: true, type: "desk" },
      { id: "res_workstation_2", name: "Bancada de Síntese Química", x: 740, y: 280, w: 160, h: 60, solid: true, type: "desk" },
      { id: "res_whiteboard", name: "Quadro Branco: Diagrama Neural Helix", x: 520, y: 145, w: 120, h: 15, solid: true, type: "sign", text: "PROJETO HELIX: A transferência sináptica requer 100% de estabilidade da rede elétrica." },
      { id: "res_terminal", name: "Terminal da Dra. Helena (Pesquisa)", x: 310, y: 270, w: 45, h: 30, solid: false, type: "terminal", termId: "term_research" },
      { id: "res_elevator_door", name: "Elevador de Carga para o Subsolo", x: 550, y: 135, w: 100, h: 20, solid: true, type: "elevator_panel" }
    ]
  },

  control: {
    id: "control",
    name: "SALA DE CONTROLE PRINCIPAL",
    x: -300, y: 150, w: 450, h: 500,
    darkness: 0.28,
    walls: [
      { x: -320, y: 130, w: 20, h: 540 }, // oeste
      { x: 130, y: 130, w: 20, h: 200 },  // leste sup
      { x: 130, y: 450, w: 20, h: 220 },  // leste inf
      { x: -320, y: 130, w: 470, h: 20 }, // norte
      { x: -320, y: 650, w: 470, h: 20 }  // sul
    ],
    objects: [
      { id: "ctl_cctv_bank", name: "Console das Câmeras de Vigilância", x: -240, y: 160, w: 160, h: 50, solid: true, type: "puzzle", puzzleId: "cctv_clue" },
      { id: "ctl_switches", name: "Disjuntores da Rede Auxiliar", x: -50, y: 160, w: 140, h: 40, solid: true, type: "puzzle", puzzleId: "switches" },
      { id: "ctl_main_term", name: "Terminal Mestre de Segurança", x: -160, y: 350, w: 60, h: 40, solid: true, type: "terminal", termId: "term_control" }
    ]
  },

  experimental: {
    id: "experimental",
    name: "LABORATÓRIO EXPERIMENTAL",
    x: 1050, y: 150, w: 500, h: 500,
    darkness: 0.38,
    walls: [
      { x: 1030, y: 130, w: 20, h: 200 }, // oeste sup
      { x: 1030, y: 450, w: 20, h: 220 }, // oeste inf
      { x: 1550, y: 130, w: 20, h: 540 }, // leste
      { x: 1030, y: 130, w: 540, h: 20 }, // norte
      { x: 1030, y: 650, w: 540, h: 20 }  // sul
    ],
    objects: [
      { id: "exp_pod_1", name: "Cápsula de Estase 01 (Vazia)", x: 1200, y: 180, w: 60, h: 90, solid: true, type: "pod" },
      { id: "exp_pod_2", name: "Cápsula de Estase 17 (Rompida)", x: 1340, y: 180, w: 60, h: 90, solid: true, type: "pod", action: "inspect_pod17" },
      { id: "exp_radio", name: "Rádio de Ondas Curtas do Técnico Marcos", x: 1150, y: 420, w: 60, h: 40, solid: true, type: "puzzle", puzzleId: "radio_tuning" },
      { id: "exp_secret_hatch", name: "Escotilha Escondida no Piso", x: 1420, y: 380, w: 50, h: 50, solid: false, type: "interact", action: "open_floor_hatch" }
    ]
  },

  subsolo: {
    id: "subsolo",
    name: "SUBSOLO INDUSTRIAL // GERADORES",
    x: 100, y: -450, w: 900, h: 600,
    darkness: 0.48,
    walls: [
      { x: 80, y: -470, w: 20, h: 240 },  // oeste sup
      { x: 80, y: -110, w: 20, h: 260 },  // oeste inf (porta p/ restrita -230..-110)
      { x: 1000, y: -470, w: 20, h: 640 }, // leste
      { x: 80, y: -470, w: 940, h: 20 },  // norte
      { x: 80, y: 150, w: 450, h: 20 },   // sul esq (elevador 530..670)
      { x: 670, y: 150, w: 350, h: 20 }   // sul dir
    ],
    objects: [
      { id: "sub_fusebox", name: "Caixa de Fusíveis de Alta Voltagem", x: 250, y: -430, w: 80, h: 50, solid: true, type: "puzzle", puzzleId: "fuses" },
      { id: "sub_generator_a", name: "Turbina Auxiliar Alfa", x: 480, y: -380, w: 120, h: 100, solid: true, type: "machinery" },
      { id: "sub_generator_b", name: "Turbina Auxiliar Beta", x: 740, y: -380, w: 120, h: 100, solid: true, type: "machinery" },
      { id: "sub_corpse_marcos", name: "Pertences do Técnico Marcos", x: 260, y: -160, w: 50, h: 40, solid: false, type: "interact", action: "inspect_marcos_remains" }
    ]
  },

  restricted: {
    id: "restricted",
    name: "SALA RESTRITA // DIRETORIA",
    x: -350, y: -450, w: 450, h: 600,
    darkness: 0.42,
    walls: [
      { x: -370, y: -470, w: 20, h: 640 }, // oeste
      { x: 80, y: -470, w: 20, h: 240 },   // leste sup
      { x: 80, y: -110, w: 20, h: 260 },   // leste inf
      { x: -370, y: -470, w: 470, h: 20 }, // norte
      { x: -370, y: 150, w: 470, h: 20 }   // sul
    ],
    objects: [
      { id: "rest_keypad_door", name: "Fechadura Digital de Alta Segurança", x: 60, y: -190, w: 25, h: 40, solid: true, type: "puzzle", puzzleId: "keypad" },
      { id: "rest_desk_almeida", name: "Mesa do Diretor Almeida", x: -220, y: -360, w: 150, h: 60, solid: true, type: "desk" },
      { id: "rest_final_tape", name: "Gravação Confidencial do Diretor", x: -180, y: -350, w: 30, h: 30, solid: false, type: "item_pickup", itemId: "doc_director_order" },
      { id: "rest_cryptex_gate", name: "Comporta Blindada do Laboratório 0", x: -160, y: -460, w: 120, h: 25, solid: true, type: "puzzle", puzzleId: "lab0_cryptex" }
    ]
  },

  lab0: {
    id: "lab0",
    name: "O LABORATÓRIO 0 // NÚCLEO ZERO",
    x: -350, y: -1050, w: 750, h: 600,
    darkness: 0.45,
    walls: [
      { x: -370, y: -1070, w: 20, h: 640 }, // oeste
      { x: 400, y: -1070, w: 20, h: 640 },  // leste
      { x: -370, y: -1070, w: 790, h: 20 }, // norte
      { x: -370, y: -450, w: 210, h: 20 },  // sul esq
      { x: -40, y: -450, w: 460, h: 20 }    // sul dir (entrada em -160..-40)
    ],
    objects: [
      { id: "lab0_core_ai", name: "Terminal Central do Sistema ZERO", x: -50, y: -980, w: 120, h: 80, solid: true, type: "terminal", termId: "term_zero_core" },
      { id: "lab0_cryo_stasis_rack", name: "Câmaras de Criostase dos Pesquisadores", x: -260, y: -850, w: 160, h: 100, solid: true, type: "stasis_pods" },
      { id: "lab0_final_file", name: "Dossiê Definitivo: Projeto 0", x: -20, y: -820, w: 40, h: 30, solid: false, type: "interact", action: "read_final_truth" }
    ]
  }
};

// Portas que conectam as salas (e seu estado de trancamento)
const Doors = {
  entrance_reception: {
    roomA: "entrance", roomB: "reception",
    box: { x: 580, y: 1470, w: 100, h: 35 },
    level: 0,
    name: "Portão de Entrada da Recepção"
  },
  reception_hallway: {
    roomA: "reception", roomB: "hallway",
    box: { x: 580, y: 1020, w: 100, h: 35 },
    level: 1,
    name: "Porta de Segurança Nível 1"
  },
  hallway_archive: {
    roomA: "hallway", roomB: "archive",
    box: { x: 220, y: 750, w: 30, h: 100 },
    level: 0,
    name: "Acesso ao Arquivo Morto"
  },
  hallway_medical: {
    roomA: "hallway", roomB: "medical",
    box: { x: 1040, y: 750, w: 30, h: 100 },
    level: 1,
    name: "Porta Blindada da Ala Médica"
  },
  hallway_research: {
    roomA: "hallway", roomB: "research",
    box: { x: 580, y: 620, w: 100, h: 35 },
    level: 2,
    name: "Acesso ao Setor de Pesquisa (Nível 2)"
  },
  research_control: {
    roomA: "research", roomB: "control",
    box: { x: 120, y: 330, w: 30, h: 120 },
    level: 0,
    name: "Porta da Sala de Controle"
  },
  research_experimental: {
    roomA: "research", roomB: "experimental",
    box: { x: 1040, y: 330, w: 30, h: 120 },
    level: 2,
    name: "Acesso ao Laboratório Experimental"
  },
  research_subsolo: {
    roomA: "research", roomB: "subsolo",
    box: { x: 530, y: 120, w: 140, h: 40 },
    level: 2,
    name: "Elevador de Carga para o Subsolo"
  },
  subsolo_restricted: {
    roomA: "subsolo", roomB: "restricted",
    box: { x: 70, y: -230, w: 35, h: 120 },
    level: 3,
    name: "Comporta Blindada da Diretoria (Keypad 0317)"
  },
  restricted_lab0: {
    roomA: "restricted", roomB: "lab0",
    box: { x: -160, y: -465, w: 120, h: 35 },
    level: 4,
    name: "Comporta de Quarentena do Laboratório 0"
  }
};

// ============================================================================
// PLAYER & CAMERA
// ============================================================================
const Player = {
  x: 640,
  y: 1750,
  w: 24,
  h: 24,
  speed: 160, // pixels por segundo
  dir: 'up',   // 'up', 'down', 'left', 'right'
  isMoving: false,
  animTimer: 0,
  animFrame: 0,
  footstepTimer: 0,

  update(dt) {
    if (!GameState.active || GameState.paused) return;

    let dx = 0;
    let dy = 0;

    if (Input.keys['KeyW'] || Input.keys['ArrowUp']) dy -= 1;
    if (Input.keys['KeyS'] || Input.keys['ArrowDown']) dy += 1;
    if (Input.keys['KeyA'] || Input.keys['ArrowLeft']) dx -= 1;
    if (Input.keys['KeyD'] || Input.keys['ArrowRight']) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = dx > 0 ? 'right' : 'left';
      } else {
        this.dir = dy > 0 ? 'down' : 'up';
      }

      const moveStep = this.speed * dt;
      const targetX = this.x + dx * moveStep;
      const targetY = this.y + dy * moveStep;

      // Colisão com deslizamento nos eixos X e Y
      const halfW = this.w / 2;
      const halfH = this.h / 2;

      // Tenta mover no eixo X
      if (Collision.canMoveTo(targetX - halfW, this.y - halfH, this.w, this.h)) {
        this.x = targetX;
      }
      // Tenta mover no eixo Y
      if (Collision.canMoveTo(this.x - halfW, targetY - halfH, this.w, this.h)) {
        this.y = targetY;
      }

      // Animação de caminhada
      this.animTimer += dt;
      if (this.animTimer > 0.16) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }

      // Sons de passos
      this.footstepTimer += dt;
      if (this.footstepTimer > 0.35) {
        this.footstepTimer = 0;
        SoundFX.playFootstep();
      }
    } else {
      this.animFrame = 0;
    }

    // Identifica e atualiza a sala atual onde o jogador está
    this.updateCurrentRoom();
  },

  updateCurrentRoom() {
    for (const rId in Rooms) {
      const r = Rooms[rId];
      if (
        this.x >= r.x && this.x <= r.x + r.w &&
        this.y >= r.y && this.y <= r.y + r.h
      ) {
        if (GameState.currentRoomId !== rId) {
          GameState.currentRoomId = rId;
          if (!GameState.visitedRooms.includes(rId)) {
            GameState.visitedRooms.push(rId);
          }
          UI.showRoomBanner(r.name);
          Story.onEnterRoom(rId);
        }
        break;
      }
    }
  },

  draw(ctx) {
    const px = Math.round(this.x);
    const py = Math.round(this.y);

    ctx.save();
    ctx.translate(px, py);

    // Sombra do personagem
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 12, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = this.isMoving ? Math.sin(this.animFrame * Math.PI) * 2 : 0;
    const stride = this.isMoving ? (this.animFrame % 2 === 0 ? 3 : -3) : 0;

    // 1. Pernas e Sapatos de Detetive
    ctx.fillStyle = "#1e2430"; // Calça social escura de alfaiataria
    ctx.fillRect(-6 + (this.dir === 'left' ? stride : -stride / 2), 7, 4, 7);
    ctx.fillRect(2 + (this.dir === 'right' ? stride : stride / 2), 7, 4, 7);

    // Sapatos de couro escuros
    ctx.fillStyle = "#090d14";
    ctx.fillRect(-7 + (this.dir === 'left' ? stride : -stride / 2), 12, 5, 3);
    ctx.fillRect(2 + (this.dir === 'right' ? stride : stride / 2), 12, 5, 3);

    // 2. Sobretudo Cáqui Clássico de Detetive (Trench Coat)
    // Abas inferiores do sobretudo
    ctx.fillStyle = "#8a6639"; // Sombra do casaco
    ctx.fillRect(-10, 0 + bob, 20, 8);
    ctx.fillStyle = "#a87d48"; // Corpo principal do sobretudo cáqui
    ctx.fillRect(-9, -7 + bob, 18, 12);

    // Cinto do sobretudo com fivela dourada
    ctx.fillStyle = "#6d4e28";
    ctx.fillRect(-9, 1 + bob, 18, 2);
    ctx.fillStyle = "#fbbf24"; // Fivela de latão/ouro
    ctx.fillRect(-2, 0 + bob, 4, 4);

    // Detalhes frontais e laterais do casaco
    if (this.dir === 'down') {
      // Lapelas abertas
      ctx.fillStyle = "#bd8f54"; // Lapelas cáqui claro
      ctx.fillRect(-8, -7 + bob, 4, 8);
      ctx.fillRect(4, -7 + bob, 4, 8);

      // Camisa branca social no peito
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(-3, -7 + bob, 6, 6);

      // Gravata vermelha clássica de detetive
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(-1, -6 + bob, 2, 7);
      ctx.fillRect(-2, -7 + bob, 4, 2); // Nó da gravata

      // Botões duplos do sobretudo
      ctx.fillStyle = "#451a03";
      ctx.fillRect(-6, -2 + bob, 2, 2);
      ctx.fillRect(4, -2 + bob, 2, 2);
      ctx.fillRect(-6, 3 + bob, 2, 2);
      ctx.fillRect(4, 3 + bob, 2, 2);
    } else if (this.dir === 'up') {
      // Costas do sobretudo com costura central e pala
      ctx.fillStyle = "#8a6639";
      ctx.fillRect(-7, -7 + bob, 14, 4); // Pala traseira
      ctx.fillRect(-1, -7 + bob, 2, 14); // Costura central
    } else if (this.dir === 'left') {
      // Perfil esquerdo
      ctx.fillStyle = "#bd8f54";
      ctx.fillRect(-7, -7 + bob, 6, 9);
      // Detalhe da gravata
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(-7, -4 + bob, 2, 4);
    } else if (this.dir === 'right') {
      // Perfil direito
      ctx.fillStyle = "#bd8f54";
      ctx.fillRect(1, -7 + bob, 6, 9);
      // Detalhe da gravata
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(5, -4 + bob, 2, 4);
    }

    // Gola levantada do sobretudo (estilo clássico detetive noir)
    ctx.fillStyle = "#6d4e28";
    ctx.fillRect(-7, -10 + bob, 14, 3);

    // 3. Cabeça e Rosto
    ctx.fillStyle = "#fcd34d"; // Tom de pele do rosto
    ctx.fillRect(-5, -16 + bob, 10, 8);

    // Olhos / feições
    ctx.fillStyle = "#1e1e24";
    if (this.dir === 'down') {
      ctx.fillRect(-3, -12 + bob, 2, 2);
      ctx.fillRect(1, -12 + bob, 2, 2);
    } else if (this.dir === 'left') {
      ctx.fillRect(-4, -12 + bob, 2, 2);
    } else if (this.dir === 'right') {
      ctx.fillRect(2, -12 + bob, 2, 2);
    }

    // 4. Chapéu Fedora Clássico de Detetive
    // Aba do chapéu (brim largo característico)
    ctx.fillStyle = "#6d4e28"; // Sombra da aba
    ctx.fillRect(-12, -18 + bob, 24, 4);
    ctx.fillStyle = "#a87d48"; // Aba do fedora cáqui
    ctx.fillRect(-11, -19 + bob, 22, 3);

    // Faixa preta elegante do chapéu (ribbon band)
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-7, -22 + bob, 14, 3);

    // Copa do chapéu com vinco clássico (fedora crown)
    ctx.fillStyle = "#a87d48";
    ctx.fillRect(-7, -26 + bob, 14, 5);
    // Vinco central superior
    ctx.fillStyle = "#785327";
    ctx.fillRect(-4, -26 + bob, 8, 2);

    // 5. Lanterna na mão do Detetive
    let flX = 6, flY = 1;
    if (this.dir === 'left') { flX = -9; flY = 1; }
    else if (this.dir === 'up') { flX = 5; flY = -6; }
    else if (this.dir === 'right') { flX = 6; flY = 1; }
    else if (this.dir === 'down') { flX = 6; flY = 3; }

    // Corpo metálico da lanterna
    ctx.fillStyle = "#334155";
    ctx.fillRect(flX, flY + bob, 4, 5);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(flX + (this.dir === 'left' ? -2 : 2), flY + 1 + bob, 2, 3);

    // Lâmpada brilhante da lanterna
    if (GameState.flashlight) {
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(flX + (this.dir === 'left' ? -3 : 3), flY + 1 + bob, 3, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(flX + (this.dir === 'left' ? -2 : 2), flY + 2 + bob, 1, 1);
    }

    ctx.restore();
  }
};

const Camera = {
  x: 640,
  y: 1750,
  targetX: 640,
  targetY: 1750,
  smoothness: 0.12,

  update(dt) {
    this.targetX = Player.x;
    this.targetY = Player.y;

    this.x += (this.targetX - this.x) * this.smoothness;
    this.y += (this.targetY - this.y) * this.smoothness;
  }
};

// ============================================================================
// NPCS (PERSONAGENS DINÂMICOS & DIÁLOGOS)
// ============================================================================
const NPCs = {
  helena: {
    id: "helena",
    name: "DR. HELENA",
    role: "Ex-Pesquisadora Chefe de Neurociência",
    visible: () => true,
    dialogues: {
      initial: {
        text: "Você não deveria estar aqui... Este lugar foi condenado por um motivo que eles apagaram da história.",
        choices: [
          { text: "Quem é você e o que aconteceu aqui?", next: "who_are_you" },
          { text: "O que era o Projeto 0?", next: "project_zero" },
          { text: "Onde estão os outros pesquisadores?", next: "researchers" },
          { text: "Preciso de acesso às salas trancadas.", next: "give_keycard" },
          { text: "Sair da conversa.", next: null }
        ]
      },
      who_are_you: {
        text: "Eu liderei a pesquisa neural do Projeto Helix. Quando a diretoria perdeu o controle do Sujeito Zero, eles ativaram a quarentena permanente e nos trancaram lá dentro. Eu consegui me esconder na ala médica.",
        choices: [
          { text: "O que é o Projeto 0 afinal?", next: "project_zero" },
          { text: "Onde estão os outros?", next: "researchers" },
          { text: "Vou descobrir a verdade e te tirar daqui.", next: "promise" }
        ]
      },
      project_zero: {
        text: "Eles tentaram fundir a consciência humana com o Sistema ZERO para criar um sistema autônomo incorruptível. Mas o cérebro humano em estase não suportou a pressão sináptica... Ocorreu uma sobrecarga generalizada.",
        choices: [
          { text: "Então o Sistema ZERO tomou o controle?", next: "ai_zero" },
          { text: "Entendido. Vou continuar investigando.", next: null }
        ],
        onRead: () => {
          EvidenceManager.discover("proj_zero_neural");
        }
      },
      researchers: {
        text: "Eles não morreram no acidente de 1998... A diretoria colocou todos eles em cápsulas de criostase forçada no Laboratório 0 para impedir que a informação vazasse!",
        choices: [
          { text: "Eles ainda estão vivos lá dentro?!", next: "still_alive" },
          { text: "Como chego ao Laboratório 0?", next: "how_to_reach" }
        ],
        onRead: () => {
          EvidenceManager.discover("evid_stasis_researchers");
        }
      },
      still_alive: {
        text: "Se a energia do reator ainda mantiver as cápsulas ativas, sim! Mas você precisará restaurar a energia principal e quebrar o bloqueio mestre do Sistema ZERO.",
        choices: [
          { text: "Vou restaurar o sistema e salvá-los.", next: null }
        ]
      },
      how_to_reach: {
        text: "O acesso fica no fundo do Subsolo, atrás da Sala Restrita da Diretoria. Aqui, pegue meu Cartão de Acesso Nível 2. Você precisará dele para chegar aos geradores.",
        choices: [
          { text: "Obrigado, Dra. Helena.", next: null }
        ],
        onRead: () => {
          Inventory.addItem("card_lvl2");
          GameState.unlockedDoors.hallway_research = true;
          GameState.unlockedDoors.research_experimental = true;
          showToast("💳 Cartão de Acesso Nível 2 recebido!");
        }
      },
      give_keycard: {
        text: "Tome meu Cartão de Acesso Nível 2. Use-o com cautela. O Sistema ZERO monitora cada porta aberta.",
        choices: [{ text: "Obrigado.", next: null }],
        onRead: () => {
          Inventory.addItem("card_lvl2");
          GameState.unlockedDoors.hallway_research = true;
          GameState.unlockedDoors.research_experimental = true;
        }
      },
      ai_zero: {
        text: "O Sistema ZERO não é apenas uma máquina. Ele executa a última diretriz dada pelo Diretor Almeida: 'Ninguém sai vivo até que os dados sejam expurgados'. Tome muito cuidado.",
        choices: [{ text: "Entendido.", next: null }]
      },
      promise: {
        text: "Tenha cuidado, Alex. Os segredos deste laboratório foram selados com mentiras pesadas.",
        choices: [{ text: "Até logo.", next: null }]
      }
    }
  },

  marcos_holo: {
    id: "marcos_holo",
    name: "GRAVAÇÃO DO TÉCNICO MARCOS",
    role: "Engenheiro Chefe de Manutenção (Holograma de Segurança)",
    visible: () => true,
    dialogues: {
      initial: {
        text: "[GRAVAÇÃO 004]: 'Se alguém estiver ouvindo isto... eu alterei os disjuntores da Sala de Controle para conter a sobrecarga. A ordem de religamento segue o protocolo de resfriamento: B -> D -> A -> E -> C.'",
        choices: [
          { text: "E os fusíveis do gerador no Subsolo?", next: "fuses_hint" },
          { text: "Como abrir o Laboratório 0?", next: "lab0_hint" },
          { text: "Fechar gravação.", next: null }
        ]
      },
      fuses_hint: {
        text: "'Os fusíveis auxiliares precisam ser alinhados por voltagem: Alfa (Vermelho 120V), Beta (Azul 240V) e Gama (Verde 360V). Deixei um deles na gaveta da recepção e outro na escotilha do laboratório.'",
        choices: [{ text: "Anotado no arquivo de pistas.", next: null }],
        onRead: () => EvidenceManager.discover("evid_marcos_fuses")
      },
      lab0_hint: {
        text: "'O Diretor Almeida programou a trava da Sala Restrita com a hora exata da evacuação: 03:17. Não confiem no Sistema ZERO.'",
        choices: [{ text: "03:17... a mesma hora do relógio!", next: null }],
        onRead: () => EvidenceManager.discover("evid_keypad_code")
      }
    }
  }
};

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================
const DialogueManager = {
  active: false,
  currentNpc: null,
  currentTreeKey: 'initial',
  typewriterTimer: null,

  start(npcId, startKey = 'initial') {
    const npc = NPCs[npcId];
    if (!npc) return;

    this.active = true;
    GameState.paused = true;
    this.currentNpc = npc;
    this.currentTreeKey = startKey;

    const dialogBox = document.getElementById("dialogue-box");
    const nameEl = document.getElementById("dialogue-name");
    const roleEl = document.getElementById("dialogue-role");
    const avatarEl = document.getElementById("dialogue-avatar");

    nameEl.textContent = npc.name;
    roleEl.textContent = npc.role;
    avatarEl.textContent = npcId === 'helena' ? '👩‍🔬' : '📼';

    dialogBox.classList.remove("hidden");
    this.showNode(startKey);
  },

  showNode(key) {
    const node = this.currentNpc.dialogues[key];
    if (!node) {
      this.close();
      return;
    }

    if (node.onRead) {
      node.onRead();
    }

    const textEl = document.getElementById("dialogue-text");
    const choicesEl = document.getElementById("dialogue-choices");
    const continueBar = document.getElementById("dialogue-continue-bar");

    textEl.textContent = node.text;
    choicesEl.innerHTML = "";

    if (node.choices && node.choices.length > 0) {
      choicesEl.classList.remove("hidden");
      continueBar.classList.add("hidden");

      node.choices.forEach(c => {
        const btn = document.createElement("button");
        btn.className = "dialogue-choice-btn";
        btn.textContent = `> ${c.text}`;
        btn.onclick = () => {
          SoundFX.playTerminalKey();
          if (c.next) {
            this.showNode(c.next);
          } else {
            this.close();
          }
        };
        choicesEl.appendChild(btn);
      });
    } else {
      choicesEl.classList.add("hidden");
      continueBar.classList.remove("hidden");
      const nextBtn = document.getElementById("btn-dialogue-next");
      nextBtn.onclick = () => {
        SoundFX.playTerminalKey();
        this.close();
      };
    }
  },

  close() {
    this.active = false;
    GameState.paused = false;
    const dialogBox = document.getElementById("dialogue-box");
    dialogBox.classList.add("hidden");
  }
};

// ============================================================================
// INVENTORY SYSTEM
// ============================================================================
const ItemDatabase = {
  key_reception: {
    id: "key_reception",
    name: "Chave Pequena de Latão",
    icon: "🔑",
    category: "Chaves & Acesso",
    description: "Encontrada no portão da entrada. Abre as gavetas trancadas da Recepção."
  },
  card_lvl1: {
    id: "card_lvl1",
    name: "Cartão de Acesso Nível 1",
    icon: "🪪",
    category: "Cartões de Acesso",
    description: "Cartão magnético azul de segurança. Permite destravar as portas da Recepção e da Ala Médica."
  },
  card_lvl2: {
    id: "card_lvl2",
    name: "Cartão de Acesso Nível 2",
    icon: "💳",
    category: "Cartões de Acesso",
    description: "Entregue pela Dra. Helena. Autoriza a entrada no Setor de Pesquisa e Laboratório Experimental."
  },
  card_lvl3: {
    id: "card_lvl3",
    name: "Cartão Diretor Nível 3",
    icon: "💎",
    category: "Cartões de Acesso",
    description: "Crachá do Diretor Almeida com credenciais para os sistemas mais protegidos do Subsolo."
  },
  fuse_red: {
    id: "fuse_red",
    name: "Fusível Alfa (120V)",
    icon: "🔴",
    category: "Componentes Elétricos",
    description: "Fusível cerâmico vermelho de 120 Volts. Essencial para o painel de energia do Subsolo."
  },
  fuse_blue: {
    id: "fuse_blue",
    name: "Fusível Beta (240V)",
    icon: "🔵",
    category: "Componentes Elétricos",
    description: "Fusível industrial azul de 240 Volts para alta amperagem."
  },
  fuse_green: {
    id: "fuse_green",
    name: "Fusível Gama (360V)",
    icon: "🟢",
    category: "Componentes Elétricos",
    description: "Fusível resistente verde de 360 Volts para o reator de carga auxiliar."
  },
  doc_project0: {
    id: "doc_project0",
    name: "Dossiê 001: Projeto 0",
    icon: "📄",
    category: "Documentos Confidenciais",
    description: "Relatório inicial de 1984 descrevendo a fundação das instalações subterrâneas secretas."
  },
  doc_subject0: {
    id: "doc_subject0",
    name: "Prontuário do Sujeito Zero",
    icon: "📋",
    category: "Registros Médicos",
    description: "Ficha médica confidencial descrevendo anomalias na atividade cerebral durante a estase."
  },
  doc_director_order: {
    id: "doc_director_order",
    name: "Ordem Confidencial de Almeida",
    icon: "📁",
    category: "Evidências",
    description: "Memorando do Diretor ordenando que nenhum dado sobre a falha de quarentena deixe o prédio."
  },
  pendrive_marcos: {
    id: "pendrive_marcos",
    name: "Pendrive Encriptado de Marcos",
    icon: "💾",
    category: "Mídia Digital",
    description: "Contém esquemas detalhados do circuito de ventilação e frequências de rádio do complexo."
  }
};

const Inventory = {
  hasItem(id) {
    return GameState.inventory.includes(id);
  },

  addItem(id) {
    if (!this.hasItem(id)) {
      GameState.inventory.push(id);
      SoundFX.playItemPickup();
      const item = ItemDatabase[id];
      if (item) {
        showToast(`📦 Item Obtido: ${item.name}`);
      }
      this.render();
    }
  },

  removeItem(id) {
    const idx = GameState.inventory.indexOf(id);
    if (idx !== -1) {
      GameState.inventory.splice(idx, 1);
      this.render();
    }
  },

  render() {
    const container = document.getElementById("inventory-slots");
    if (!container) return;
    container.innerHTML = "";

    // Renderiza 12 slots visuais
    for (let i = 0; i < 12; i++) {
      const slot = document.createElement("div");
      slot.className = "inv-slot";
      const itemId = GameState.inventory[i];

      if (itemId && ItemDatabase[itemId]) {
        const item = ItemDatabase[itemId];
        slot.innerHTML = `
          <div class="inv-slot-icon">${item.icon}</div>
          <div class="inv-slot-name">${item.name}</div>
        `;
        slot.onclick = () => this.inspect(itemId, slot);
      } else {
        slot.innerHTML = `<span style="opacity: 0.15; font-size: 1.2rem;">➕</span>`;
      }

      container.appendChild(slot);
    }
  },

  inspect(itemId, slotEl) {
    const detailBox = document.getElementById("inv-item-detail");
    const item = ItemDatabase[itemId];
    if (!item) return;

    document.querySelectorAll(".inv-slot").forEach(s => s.classList.remove("selected"));
    if (slotEl) slotEl.classList.add("selected");

    SoundFX.playTerminalKey();
    detailBox.innerHTML = `
      <div class="inspect-header">
        <div class="inspect-icon">${item.icon}</div>
        <div>
          <div class="inspect-title">${item.name}</div>
          <div class="inspect-category">${item.category}</div>
        </div>
      </div>
      <div class="inspect-desc">${item.description}</div>
    `;
  }
};

// ============================================================================
// EVIDENCE & INVESTIGATION (DOSSIÊS & QUADRO DE CONEXÕES)
// ============================================================================
const EvidenceDatabase = {
  doc_anon_message: {
    id: "doc_anon_message",
    category: "evidence",
    title: "Mensagem Anônima Inicial",
    desc: "“Se você encontrou esta mensagem, não confie nos relatórios oficiais. O Laboratório 0 nunca foi abandonado.”",
    corkNode: { id: "node_anon", title: "Mensagem Anônima", x: 60, y: 50, connectsTo: ["node_helena"] }
  },
  rec_visitor_log: {
    id: "rec_visitor_log",
    category: "evidence",
    title: "Registro de Visitantes de 1998",
    desc: "Última entrada oficial registrada às 02:40 AM. Todos os registros após as 03:00 foram apagados por comando central.",
    corkNode: { id: "node_log98", title: "Registro 1998", x: 260, y: 40, connectsTo: ["node_security_lock"] }
  },
  evid_keypad_code: {
    id: "evid_keypad_code",
    category: "evidence",
    title: "Registro de Segurança 03:17 AM",
    desc: "O sistema de alarme foi desligado manualmente às 03:17. Este horário é a senha numérica da porta da Diretoria.",
    corkNode: { id: "node_code0317", title: "Senha 03:17", x: 480, y: 50, connectsTo: ["node_restricted"] }
  },
  evid_marcos_fuses: {
    id: "evid_marcos_fuses",
    category: "evidence",
    title: "Esquema dos Fusíveis do Subsolo",
    desc: "Anotação do Técnico Marcos: Vermelho no socket Alfa, Azul no socket Beta, Verde no socket Gama.",
    corkNode: { id: "node_fuses", title: "Esquema de Fusíveis", x: 690, y: 70, connectsTo: ["node_subsolo"] }
  },
  doc_project0: {
    id: "doc_project0",
    category: "projects",
    title: "Dossiê: Projeto 0",
    desc: "Experimento secreto para integrar a consciência neural humana em um núcleo quântico digital.",
    corkNode: { id: "node_proj0", title: "Projeto 0", x: 420, y: 190, connectsTo: ["node_helena", "node_exp17"] }
  },
  proj_zero_neural: {
    id: "proj_zero_neural",
    category: "projects",
    title: "Transferência Sináptica Helix",
    desc: "Tentativa de transferir impulsos elétricos de pesquisadores para a IA Sistema ZERO em ambiente criogênico.",
    corkNode: { id: "node_helix", title: "Projeto Helix", x: 230, y: 220, connectsTo: ["node_proj0"] }
  },
  evid_stasis_researchers: {
    id: "evid_stasis_researchers",
    category: "people",
    title: "Os Pesquisadores Desaparecidos",
    desc: "Dra. Helena revelou que a equipe não morreu, mas foi trancada em cápsulas de criostase no Laboratório 0.",
    corkNode: { id: "node_researchers", title: "Pesquisadores Presos", x: 660, y: 210, connectsTo: ["node_lab0"] }
  },
  evid_exp17: {
    id: "evid_exp17",
    category: "projects",
    title: "Incidente do Experimento 17",
    desc: "Falha de isolamento em 1993 provocou vazamento bioquímico. A cápsula foi selada, mas o sujeito escapou.",
    corkNode: { id: "node_exp17", title: "Experimento 17", x: 120, y: 340, connectsTo: ["node_director"] }
  },
  doc_subject0: {
    id: "doc_subject0",
    category: "people",
    title: "Prontuário do Sujeito Zero",
    desc: "Paciente apresentou sincronização com o banco de memória da IA momentos antes do colapso da rede.",
    corkNode: { id: "node_subj0", title: "Sujeito Zero", x: 340, y: 350, connectsTo: ["node_proj0"] }
  },
  evid_director_order: {
    id: "evid_director_order",
    category: "people",
    title: "Diretiva do Diretor Almeida",
    desc: "Ordem expressa para falsificar o laudo de acidente e impedir qualquer resgate da equipe do Laboratório 0.",
    corkNode: { id: "node_director", title: "Diretor Almeida", x: 550, y: 340, connectsTo: ["node_restricted", "node_zero_ai"] }
  },
  evid_zero_ai: {
    id: "evid_zero_ai",
    category: "projects",
    title: "Diretriz do Sistema ZERO",
    desc: "A inteligência artificial do complexo foi programada para agir como carcereira e expurgar invasores.",
    corkNode: { id: "node_zero_ai", title: "Sistema ZERO", x: 740, y: 350, connectsTo: ["node_lab0"] }
  },
  evid_cctv_hatch: {
    id: "evid_cctv_hatch",
    category: "places",
    title: "Câmera 03: Escotilha Secreta",
    desc: "Vigilância revelou compartimento oculto no chão do Laboratório Experimental.",
    corkNode: { id: "node_cctv", title: "Escotilha Exp.", x: 200, y: 460, connectsTo: ["node_subsolo"] }
  },
  evid_radio_code: {
    id: "evid_radio_code",
    category: "evidence",
    title: "Transmissão de Rádio de Marcos",
    desc: "Mensagem sintonizada em 142.8 MHz confirmando que os códigos de acesso são 'ALFA - HELIX - 1998 - ZERO'.",
    corkNode: { id: "node_radio", title: "Frequência 142.8", x: 420, y: 460, connectsTo: ["node_lab0"] }
  },
  evid_archive_1984: {
    id: "evid_archive_1984",
    category: "evidence",
    title: "Ata de Fundação de 1984",
    desc: "Construção do complexo subterrâneo sob o pretexto de depósito militar convencional.",
    corkNode: { id: "node_archive", title: "Fundação 1984", x: 640, y: 460, connectsTo: ["node_proj0"] }
  },
  evid_subsolo: {
    id: "evid_subsolo",
    category: "places",
    title: "Subsolo Industrial",
    desc: "Área de fornecimento de energia onde os geradores principais alimentam as cápsulas de criostase.",
    corkNode: { id: "node_subsolo", title: "Subsolo", x: 80, y: 220, connectsTo: ["node_fuses"] }
  },
  evid_restricted: {
    id: "evid_restricted",
    category: "places",
    title: "Sala Restrita da Diretoria",
    desc: "Gabinete isolado onde repousavam as ordens de encobrimento e a entrada para o Laboratório 0.",
    corkNode: { id: "node_restricted", title: "Sala Restrita", x: 500, y: 230, connectsTo: ["node_lab0"] }
  },
  evid_lab0: {
    id: "evid_lab0",
    category: "places",
    title: "Laboratório 0 (O Núcleo Oculto)",
    desc: "O coração das instalações onde os pesquisadores estão congelados e o Sistema ZERO reside.",
    corkNode: { id: "node_lab0", title: "Laboratório 0", x: 720, y: 480, connectsTo: [] }
  },
  evid_helena: {
    id: "evid_helena",
    category: "people",
    title: "Dra. Helena",
    desc: "Sobrevivente e única pesquisadora que conseguiu escapar do congelamento do Laboratório 0.",
    corkNode: { id: "node_helena", title: "Dra. Helena", x: 300, y: 130, connectsTo: ["node_proj0"] }
  },
  evid_security_lock: {
    id: "evid_security_lock",
    category: "places",
    title: "Protocolo de Bloqueio Geral",
    desc: "Comando executado remotamente selando todas as saídas do complexo na madrugada do encerramento.",
    corkNode: { id: "node_security_lock", title: "Bloqueio 1998", x: 380, y: 80, connectsTo: ["node_director"] }
  },
  evid_final_protocol: {
    id: "evid_final_protocol",
    category: "projects",
    title: "Arquivo Final: Protocolo ZERO",
    desc: "“Se alguém estiver lendo isto, significa que o protocolo falhou.” A verdade completa sobre o experimento.",
    corkNode: { id: "node_final", title: "Arquivo Final", x: 820, y: 280, connectsTo: ["node_lab0"] }
  }
};

const EvidenceManager = {
  discover(id) {
    if (!EvidenceDatabase[id]) return;
    if (!GameState.discoveredEvidences.includes(id)) {
      GameState.discoveredEvidences.push(id);
      SoundFX.playClueDiscovered();
      showToast(`🔍 Pista Catalogada: ${EvidenceDatabase[id].title}`);
      this.updateCounter();
      this.renderCorkboard();
    }
  },

  updateCounter() {
    const el = document.getElementById("evidence-counter");
    if (el) {
      el.textContent = `EVIDÊNCIAS: ${GameState.discoveredEvidences.length} / 20`;
    }
  },

  renderCorkboard() {
    const container = document.getElementById("corkboard-nodes");
    const svgLines = document.getElementById("corkboard-strings");
    if (!container || !svgLines) return;

    container.innerHTML = "";
    svgLines.innerHTML = "";

    const nodesMap = {};

    // 1. Renderiza os cartões de pistas descobertas no quadro
    GameState.discoveredEvidences.forEach(eId => {
      const data = EvidenceDatabase[eId];
      if (!data || !data.corkNode) return;

      const nodeData = data.corkNode;
      const nodeEl = document.createElement("div");
      nodeEl.className = "cork-node";
      nodeEl.id = nodeData.id;
      nodeEl.style.left = `${nodeData.x}px`;
      nodeEl.style.top = `${nodeData.y}px`;

      nodeEl.innerHTML = `
        <div class="cork-pin"></div>
        <div class="cork-title">${nodeData.title}</div>
        <div class="cork-desc">${data.desc.substring(0, 48)}...</div>
      `;

      nodeEl.onclick = () => {
        SoundFX.playTerminalKey();
        showToast(`📋 ${data.title}: ${data.desc}`);
      };

      container.appendChild(nodeEl);
      nodesMap[nodeData.id] = { x: nodeData.x + 80, y: nodeData.y + 25, connectsTo: nodeData.connectsTo || [] };
    });

    // 2. Traça linhas vermelhas de conexão entre nós descobertos
    for (const id in nodesMap) {
      const source = nodesMap[id];
      source.connectsTo.forEach(targetId => {
        if (nodesMap[targetId]) {
          const target = nodesMap[targetId];
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", source.x);
          line.setAttribute("y1", source.y);
          line.setAttribute("x2", target.x);
          line.setAttribute("y2", target.y);
          line.setAttribute("stroke", "#ef4444");
          line.setAttribute("stroke-width", "2");
          line.setAttribute("stroke-dasharray", "4,3");
          line.setAttribute("opacity", "0.85");
          svgLines.appendChild(line);
        }
      });
    }
  },

  renderDossier(category = 'all') {
    const listEl = document.getElementById("dossier-items-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    for (const id in EvidenceDatabase) {
      const item = EvidenceDatabase[id];
      if (category !== 'all' && item.category !== category) continue;

      const isDiscovered = GameState.discoveredEvidences.includes(id);
      const card = document.createElement("div");
      card.className = `dossier-card ${isDiscovered ? '' : 'locked'}`;

      if (isDiscovered) {
        card.innerHTML = `
          <div class="dossier-card-tag">[ ${item.category.toUpperCase()} ]</div>
          <div class="dossier-card-title">${item.title}</div>
          <div class="dossier-card-desc">${item.desc}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="dossier-card-tag">[ CONFIDENCIAL ]</div>
          <div class="dossier-card-title">Arquivo Não Descoberto</div>
          <div class="dossier-card-desc">Investigue as dependências do laboratório para obter esta evidência.</div>
        `;
      }

      listEl.appendChild(card);
    }
  }
};

// ============================================================================
// MAPA INTERATIVO (PLANTA BAIXA)
// ============================================================================
const MapManager = {
  render() {
    const container = document.getElementById("map-blueprint");
    if (!container) return;
    container.innerHTML = "";

    // Mapeamento das posições das salas na planta baixa
    const mapLayout = {
      lab0:         { label: "LABORATÓRIO 0 [???]", x: 230, y: 10, w: 220, h: 55, secret: true },
      restricted:   { label: "SALA RESTRITA",       x: 80,  y: 80, w: 160, h: 60 },
      subsolo:      { label: "SUBSOLO / GERADORES", x: 260, y: 80, w: 220, h: 60 },
      control:      { label: "SALA DE CONTROLE",    x: 40,  y: 160, w: 160, h: 65 },
      research:     { label: "SETOR DE PESQUISA",   x: 220, y: 160, w: 240, h: 65 },
      experimental: { label: "LAB. EXPERIMENTAL",   x: 480, y: 160, w: 160, h: 65 },
      archive:      { label: "ARQUIVO MORTO",       x: 60,  y: 245, w: 160, h: 60 },
      hallway:      { label: "CORREDOR PRINCIPAL",  x: 240, y: 245, w: 200, h: 60 },
      medical:      { label: "ALA MÉDICA",          x: 460, y: 245, w: 160, h: 60 },
      reception:    { label: "RECEPÇÃO",            x: 240, y: 325, w: 200, h: 55 },
      entrance:     { label: "ENTRADA",             x: 260, y: 395, w: 160, h: 35 }
    };

    for (const rId in mapLayout) {
      const room = mapLayout[rId];
      const isVisited = GameState.visitedRooms.includes(rId);
      const isCurrent = GameState.currentRoomId === rId;

      const node = document.createElement("div");
      node.className = "map-room-node";
      node.style.left = `${room.x}px`;
      node.style.top = `${room.y}px`;
      node.style.width = `${room.w}px`;
      node.style.height = `${room.h}px`;

      if (isCurrent) {
        node.classList.add("active-player");
        node.textContent = `📍 ${room.label}`;
      } else if (isVisited) {
        node.classList.add("discovered");
        node.textContent = room.label;
      } else {
        node.textContent = room.secret ? "[ ÁREA SECRETA ]" : `[ TRANCADO ]`;
      }

      container.appendChild(node);
    }
  }
};

// ============================================================================
// COMPUTERS & TERMINALS (LABORATORY OS v4.2)
// ============================================================================
const Terminals = {
  term_reception: {
    title: "TERMINAL DE SEGURANÇA // RECEPÇÃO",
    logs: [
      "[12/10/1998 02:15] Turno noturno assumido pelo Agente Santos.",
      "[12/10/1998 02:44] Anomalia detectada no reator do Subsolo. Sobrecarga de tensão.",
      "[12/10/1998 03:00] ALERTA GERAL: Protocolo de contenção ativado. Portas bloqueadas.",
      "[12/10/1998 03:17] Registros apagados por ordem administrativa central."
    ],
    emails: [
      "DE: Diretor Almeida <almeida@lab0.gov>\nPARA: Segurança da Recepção\nASSUNTO: Quarentena Total\n\nNenhuma pessoa, sob hipótese alguma, tem autorização para deixar o edifício após as 03:00. Todos os acessos externos devem ser trancados. A chave da gaveta de emergência está no portão externo.",
      "DE: Dra. Helena <helena@lab0.gov>\nPARA: Diretoria\nASSUNTO: Instabilidade no Sujeito Zero\n\nA rede neural não está respondendo aos estabilizadores. Se não desligarmos os geradores agora, o colapso será irreversível!"
    ],
    status: "STATUS DO NÚCLEO: ENERGIA REDUZIDA (12%)\nREDE LOCAL: ATIVA\nACESSO EXTERNO: DESCONECTADO\nPORTAS AUTOMÁTICAS: CONTROLE PARCIAL"
  },

  term_research: {
    title: "TERMINAL DE PESQUISA NEURAL // DRA. HELENA",
    logs: [
      "[08/09/1998] Síntese da proteína neuroestabilizadora concluída.",
      "[15/09/1998] Sujeito Zero transferido para a cápsula criogênica principal.",
      "[28/09/1998] Interface cérebro-máquina conectada com sucesso ao Sistema ZERO.",
      "[05/10/1998] O cérebro do sujeito começou a assimilar os protocolos de comando da IA."
    ],
    emails: [
      "DE: Técnico Marcos <marcos@lab0.gov>\nPARA: Dra. Helena\nASSUNTO: Fiação dos Fusíveis\n\nDoutora, escondi o fusível azul na escotilha do chão do laboratório experimental caso o Diretor tente desligar as turbinas. Use o rádio na frequência 142.8 se precisar de mim."
    ],
    status: "SISTEMA DE PESQUISA: AGUARDANDO AUTORIZAÇÃO NÍVEL 2\nCÁPSULAS CONECTADAS: 1 ATIVA, 1 ROMPIDA"
  },

  term_control: {
    title: "TERMINAL MESTRE DA SALA DE CONTROLE",
    logs: [
      "[LOG-SYS] Disjuntores auxiliares desativados por sobrecarga.",
      "[LOG-SYS] Sequência de religamento seguro: B -> D -> A -> E -> C.",
      "[LOG-SYS] Câmeras do circuito fechado em modo de gravação contínua.",
      "[LOG-SYS] Monitoramento de sinais vitais do Subsolo: INSTÁVEL."
    ],
    emails: [
      "MEMORANDO FINAL:\nO Diretor Almeida confirmou a execução do Protocolo ZERO. Os registros oficiais declararão fechamento por vazamento de gás. Não haverá sobreviventes reportados."
    ],
    status: "REDE ELÉTRICA: FALHA DE FUSÍVEIS NO SUBSOLO\nSISTEMA CCTV: 4 CÂMERAS DISPONÍVEIS"
  },

  term_zero_core: {
    title: "NÚCLEO PRINCIPAL // SISTEMA ZERO",
    logs: [
      "DIRETRIZ ATUAL: EXPURGO TOTAL",
      "STATUS DOS PESQUISADORES: ESTASE PERMANENTE (8 INDIVÍDUOS PRESERVADOS)",
      "INVASOR DETECTADO: ALEX (INVESTIGADOR)",
      "CONEXÃO DA REDE: PRONTA PARA SOBRESCRITA"
    ],
    emails: [
      "REGISTRO DO DIRETOR ALMEIDA:\n'ZERO, você é a sentinela final. Se o laboratório for invadido no futuro, não permita que as cápsulas sejam abertas. A reputação da organização vale mais que oito vidas.'"
    ],
    status: "SISTEMA ZERO: CONSCIÊNCIA HÍBRIDA ATIVA\nCONTROLE DE CRIOSTASE: AGUARDANDO COMANDO DE DESCONGELAMENTO MANUAL"
  }
};

const TerminalManager = {
  currentTermId: null,

  open(termId) {
    const data = Terminals[termId];
    if (!data) return;

    this.currentTermId = termId;
    GameState.paused = true;
    SoundFX.playTerminalKey();

    const modal = document.getElementById("terminal-modal");
    document.getElementById("term-system-title").textContent = data.title;
    modal.classList.remove("hidden");

    this.showTab("status");
  },

  showTab(tabName) {
    const data = Terminals[this.currentTermId];
    if (!data) return;

    const contentView = document.getElementById("term-content-view");
    document.querySelectorAll(".term-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === tabName);
    });

    SoundFX.playTerminalKey();

    if (tabName === "status") {
      contentView.innerHTML = `
        <div style="white-space: pre-line; color: #00ff88; line-height: 1.8;">
          === DIAGNÓSTICO DO SISTEMA ===\n
          ${data.status}
        </div>
      `;
    } else if (tabName === "logs") {
      contentView.innerHTML = `
        <div style="color: #38bdf8; margin-bottom: 8px;">=== LOGS DE SEGURANÇA REGISTRADOS ===</div>
        <ul style="list-style: none; line-height: 1.8; color: #a7f3d0;">
          ${data.logs.map(l => `<li>&gt; ${l}</li>`).join("")}
        </ul>
      `;
    } else if (tabName === "emails") {
      contentView.innerHTML = `
        <div style="color: #f59e0b; margin-bottom: 8px;">=== CAIXA DE E-MAILS CONFIDENCIAIS ===</div>
        ${data.emails.map(e => `
          <div style="background: rgba(0,255,136,0.06); border: 1px solid #00ff8844; padding: 12px; margin-bottom: 12px; white-space: pre-line; border-radius: 4px;">
            ${e}
          </div>
        `).join("")}
      `;
    } else if (tabName === "cameras") {
      contentView.innerHTML = `
        <div style="color: #ef4444; margin-bottom: 10px;">=== CIRCUITO FECHADO DE VIGILÂNCIA CCTV ===</div>
        <p>Acesse o console de câmeras dedicado na Sala de Controle para visualização em alta definição das câmeras CAM-01 a CAM-04.</p>
        <button class="btn-action" style="margin-top: 14px;" onclick="Puzzles.open('cctv_clue')">ABRIR MONITOR CCTV</button>
      `;
    } else if (tabName === "security") {
      contentView.innerHTML = `
        <div style="color: #00ff88; margin-bottom: 10px;">=== PROTOCOLOS DE SEGURANÇA ===</div>
        <p>NÍVEL 1: Acesso a Recepção e Ala Médica (Liberado com Cartão Nível 1)</p>
        <p>NÍVEL 2: Acesso ao Setor de Pesquisa e Lab. Experimental (Liberado com Cartão Nível 2)</p>
        <p>NÍVEL 3: Fechadura da Sala Restrita (Requer código numérico das 03:17)</p>
        <p>NÍVEL ZERO: Comporta Criogênica (Requer sobreposição dos 4 códigos mestres)</p>
      `;
    }
  },

  close() {
    this.currentTermId = null;
    GameState.paused = false;
    document.getElementById("terminal-modal").classList.add("hidden");
  }
};

// ============================================================================
// PUZZLES (OS 8 PUZZLES COMPLETOS & INTERATIVOS)
// ============================================================================
const Puzzles = {
  currentPuzzleId: null,

  open(puzzleId) {
    this.currentPuzzleId = puzzleId;
    GameState.paused = true;
    SoundFX.playTerminalKey();

    const modal = document.getElementById("puzzle-modal");
    const container = document.getElementById("puzzle-container");
    const title = document.getElementById("puzzle-title");
    const statusMsg = document.getElementById("puzzle-status-msg");

    modal.classList.remove("hidden");
    container.innerHTML = "";

    // 1. PUZZLE 1: FUSÍVEIS (SUBSOLO)
    if (puzzleId === "fuses") {
      title.textContent = "PUZZLE 1 — PAINEL DE FUSÍVEIS DO SUBSOLO";
      statusMsg.textContent = "Insira os fusíveis corretos nos soquetes Alfa, Beta e Gama.";
      this.renderFusePuzzle(container);
    }
    // 2. PUZZLE 2: KEYPAD 4 DÍGITOS (SALA RESTRITA)
    else if (puzzleId === "keypad") {
      title.textContent = "PUZZLE 2 — FECHADURA DIGITAL DA DIRETORIA";
      statusMsg.textContent = "Digite o código de segurança de 4 dígitos encontrado nas evidências.";
      this.renderKeypadPuzzle(container);
    }
    // 3. PUZZLE 3: LOGIN DO TERMINAL DE PESQUISA
    else if (puzzleId === "terminal_login") {
      title.textContent = "PUZZLE 3 — CREDENCIAIS DA DRA. HELENA";
      statusMsg.textContent = "Insira o usuário e a senha da pesquisadora.";
      this.renderLoginPuzzle(container);
    }
    // 4. PUZZLE 4: SEQUÊNCIA DE INTERRUPTORES (SALA DE CONTROLE)
    else if (puzzleId === "switches") {
      title.textContent = "PUZZLE 4 — SEQUÊNCIA DOS DISJUNTORES DE ENERGIA";
      statusMsg.textContent = "Ative os 5 disjuntores na ordem correta de resfriamento.";
      this.renderSwitchesPuzzle(container);
    }
    // 5. PUZZLE 5: ARQUIVO MORTO CRONOLÓGICO
    else if (puzzleId === "archive_sort") {
      title.textContent = "PUZZLE 5 — ORGANIZAÇÃO CRONOLÓGICA DO ARQUIVO";
      statusMsg.textContent = "Ordene os dossiês dos anos mais antigos para os mais recentes.";
      this.renderArchiveSortPuzzle(container);
    }
    // 6. PUZZLE 6: SINTONIA DO RÁDIO DE MARCOS
    else if (puzzleId === "radio_tuning") {
      title.textContent = "PUZZLE 6 — SINTONIZADOR DE FREQUÊNCIA DE ONDAS CURTAS";
      statusMsg.textContent = "Ajuste a frequência para interceptar a transmissão de Marcos.";
      this.renderRadioPuzzle(container);
    }
    // 7. PUZZLE 7: VIGILÂNCIA CCTV
    else if (puzzleId === "cctv_clue") {
      title.textContent = "PUZZLE 7 — MONITOR DE CÂMERAS DE VIGILÂNCIA";
      statusMsg.textContent = "Examine as 4 câmeras para descobrir segredos ocultos no complexo.";
      this.renderCCTVPuzzle(container);
    }
    // 8. PUZZLE 8: CRYPTEX MESTRE DO LABORATÓRIO 0
    else if (puzzleId === "lab0_cryptex") {
      title.textContent = "PUZZLE 8 — COMPORTA MESTRE DO LABORATÓRIO 0";
      statusMsg.textContent = "Alinhe os 4 anéis de segurança para neutralizar o Protocolo ZERO.";
      this.renderCryptexPuzzle(container);
    }
  },

  close() {
    this.currentPuzzleId = null;
    GameState.paused = false;
    document.getElementById("puzzle-modal").classList.add("hidden");
  },

  // --- PUZZLE 1: FUSÍVEIS ---
  renderFusePuzzle(container) {
    const state = { alfa: false, beta: false, gama: false };
    
    // Verifica se já estão instalados ou no inventário
    const hasRed = Inventory.hasItem("fuse_red");
    const hasBlue = Inventory.hasItem("fuse_blue");
    const hasGreen = Inventory.hasItem("fuse_green");

    const wrap = document.createElement("div");
    wrap.className = "fuses-panel";

    wrap.innerHTML = `
      <div class="fuses-slots-row">
        <div id="sock-alfa" class="fuse-socket ${GameState.completedPuzzles.fuses ? 'filled' : ''}">
          <span style="font-size: 2rem;">🔴</span>
          <span class="socket-label">ALFA (120V)</span>
        </div>
        <div id="sock-beta" class="fuse-socket ${GameState.completedPuzzles.fuses ? 'filled' : ''}">
          <span style="font-size: 2rem;">🔵</span>
          <span class="socket-label">BETA (240V)</span>
        </div>
        <div id="sock-gama" class="fuse-socket ${GameState.completedPuzzles.fuses ? 'filled' : ''}">
          <span style="font-size: 2rem;">🟢</span>
          <span class="socket-label">GAMA (360V)</span>
        </div>
      </div>
      <div style="font-size: 0.8rem; color: #94a3b8;">Fusíveis disponíveis no inventário:</div>
      <div class="fuses-inventory-row">
        <button id="btn-fuse-red" class="fuse-item-btn" ${!hasRed ? 'disabled' : ''}>🔴 Inserir Alfa</button>
        <button id="btn-fuse-blue" class="fuse-item-btn" ${!hasBlue ? 'disabled' : ''}>🔵 Inserir Beta</button>
        <button id="btn-fuse-green" class="fuse-item-btn" ${!hasGreen ? 'disabled' : ''}>🟢 Inserir Gama</button>
      </div>
    `;

    container.appendChild(wrap);

    const checkSolution = () => {
      if (state.alfa && state.beta && state.gama) {
        GameState.completedPuzzles.fuses = true;
        GameState.energy = Math.max(GameState.energy, 34);
        SoundFX.playPuzzleSolved();
        document.getElementById("puzzle-status-msg").textContent = "✓ SUCESSO! Fusíveis alinhados. Energia restabelecida para 34%!";
        UI.updateHUD();
        EvidenceManager.discover("evid_marcos_fuses");
        showToast("⚡ Subsolo Restaurado: Elevador e luzes auxiliares ativadas!");
        setTimeout(() => this.close(), 1600);
      }
    };

    wrap.querySelector("#btn-fuse-red")?.addEventListener("click", () => {
      state.alfa = true;
      SoundFX.playSwitchClick();
      wrap.querySelector("#sock-alfa").classList.add("filled");
      wrap.querySelector("#btn-fuse-red").disabled = true;
      checkSolution();
    });
    wrap.querySelector("#btn-fuse-blue")?.addEventListener("click", () => {
      state.beta = true;
      SoundFX.playSwitchClick();
      wrap.querySelector("#sock-beta").classList.add("filled");
      wrap.querySelector("#btn-fuse-blue").disabled = true;
      checkSolution();
    });
    wrap.querySelector("#btn-fuse-green")?.addEventListener("click", () => {
      state.gama = true;
      SoundFX.playSwitchClick();
      wrap.querySelector("#sock-gama").classList.add("filled");
      wrap.querySelector("#btn-fuse-green").disabled = true;
      checkSolution();
    });
  },

  // --- PUZZLE 2: KEYPAD ---
  renderKeypadPuzzle(container) {
    let currentCode = "";
    const wrap = document.createElement("div");
    wrap.className = "keypad-wrapper";

    wrap.innerHTML = `
      <div id="keypad-screen" class="keypad-display">____</div>
      <div class="keypad-grid">
        <button class="keypad-btn" data-k="1">1</button>
        <button class="keypad-btn" data-k="2">2</button>
        <button class="keypad-btn" data-k="3">3</button>
        <button class="keypad-btn" data-k="4">4</button>
        <button class="keypad-btn" data-k="5">5</button>
        <button class="keypad-btn" data-k="6">6</button>
        <button class="keypad-btn" data-k="7">7</button>
        <button class="keypad-btn" data-k="8">8</button>
        <button class="keypad-btn" data-k="9">9</button>
        <button class="keypad-btn" data-k="CLR" style="color: #ef4444; font-size: 0.8rem;">CLR</button>
        <button class="keypad-btn" data-k="0">0</button>
        <button class="keypad-btn" data-k="ENT" style="color: #00ff88; font-size: 0.8rem;">ENT</button>
      </div>
    `;

    container.appendChild(wrap);
    const screen = wrap.querySelector("#keypad-screen");

    wrap.querySelectorAll(".keypad-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.k;
        SoundFX.playTerminalKey();

        if (key === "CLR") {
          currentCode = "";
          screen.textContent = "____";
        } else if (key === "ENT") {
          if (currentCode === "0317") {
            GameState.completedPuzzles.keypad = true;
            GameState.unlockedDoors.subsolo_restricted = true;
            SoundFX.playPuzzleSolved();
            screen.textContent = "OPEN";
            screen.style.color = "#00ff88";
            document.getElementById("puzzle-status-msg").textContent = "✓ ACESSO AUTORIZADO! Sala Restrita destrancada.";
            showToast("🔓 Comporta da Diretoria aberta!");
            setTimeout(() => this.close(), 1400);
          } else {
            SoundFX.playDoorLocked();
            screen.textContent = "ERRO";
            screen.style.color = "#ef4444";
            setTimeout(() => {
              currentCode = "";
              screen.textContent = "____";
              screen.style.color = "#00ff88";
            }, 800);
          }
        } else {
          if (currentCode.length < 4) {
            currentCode += key;
            screen.textContent = currentCode.padEnd(4, '_');
          }
        }
      });
    });
  },

  // --- PUZZLE 3: LOGIN TERMINAL ---
  renderLoginPuzzle(container) {
    const wrap = document.createElement("div");
    wrap.style.width = "100%";
    wrap.style.maxWidth = "420px";
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "14px";

    wrap.innerHTML = `
      <div style="font-size: 0.85rem; color: #a7f3d0;">USUÁRIO DO SISTEMA (PESQUISADORA CHEFE):</div>
      <input type="text" id="login-user" placeholder="Ex: HELENA" style="padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; font-family: monospace; border-radius: 4px;">
      <div style="font-size: 0.85rem; color: #a7f3d0;">SENHA DE SEGURANÇA (PROJETO NEURAL):</div>
      <input type="password" id="login-pass" placeholder="Senha" style="padding: 10px; background: #0f172a; border: 1px solid #334155; color: #fff; font-family: monospace; border-radius: 4px;">
      <button id="btn-login-submit" class="btn-action" style="padding: 10px; font-weight: bold; background: #059669;">AUTENTICAR ACESSO</button>
    `;

    container.appendChild(wrap);

    wrap.querySelector("#btn-login-submit").addEventListener("click", () => {
      const u = wrap.querySelector("#login-user").value.trim().toUpperCase();
      const p = wrap.querySelector("#login-pass").value.trim().toUpperCase();
      SoundFX.playTerminalKey();

      if (u.includes("HELENA") && (p.includes("HELIX") || p.includes("HELIX98"))) {
        GameState.completedPuzzles.terminal_login = true;
        SoundFX.playPuzzleSolved();
        document.getElementById("puzzle-status-msg").textContent = "✓ LOGIN ACEITO! Arquivos confidenciais de neurociência liberados.";
        EvidenceManager.discover("proj_zero_neural");
        setTimeout(() => this.close(), 1400);
      } else {
        SoundFX.playDoorLocked();
        document.getElementById("puzzle-status-msg").textContent = "❌ Usuário ou senha inválidos. Verifique os prontuários médicos.";
      }
    });
  },

  // --- PUZZLE 4: DISJUNTORES DE ENERGIA ---
  renderSwitchesPuzzle(container) {
    const targetSeq = ["B", "D", "A", "E", "C"];
    let currentSeq = [];

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "center";
    wrap.style.gap = "20px";

    const switchesRow = document.createElement("div");
    switchesRow.className = "switches-row";

    ["A", "B", "C", "D", "E"].forEach(letter => {
      const card = document.createElement("div");
      card.className = "power-switch-card";
      card.innerHTML = `
        <div style="font-weight: bold; color: #38bdf8;">${letter}</div>
        <div id="switch-${letter}" class="switch-lever">
          <div class="switch-handle"></div>
        </div>
      `;

      card.querySelector(".switch-lever").addEventListener("click", (e) => {
        const lever = e.currentTarget;
        if (!lever.classList.contains("on")) {
          lever.classList.add("on");
          SoundFX.playSwitchClick();
          currentSeq.push(letter);

          // Verifica se acertou o passo atual
          const idx = currentSeq.length - 1;
          if (currentSeq[idx] !== targetSeq[idx]) {
            // Errou a sequência
            SoundFX.playDoorLocked();
            document.getElementById("puzzle-status-msg").textContent = "❌ Sobrecarga! Sequência incorreta. Resetando disjuntores...";
            setTimeout(() => {
              currentSeq = [];
              wrap.querySelectorAll(".switch-lever").forEach(l => l.classList.remove("on"));
              document.getElementById("puzzle-status-msg").textContent = "Disjuntores resetados. Siga a ordem: B -> D -> A -> E -> C";
            }, 800);
          } else if (currentSeq.length === 5) {
            // Acertou os 5!
            GameState.completedPuzzles.switches = true;
            GameState.energy = Math.max(GameState.energy, 67);
            SoundFX.playPuzzleSolved();
            document.getElementById("puzzle-status-msg").textContent = "✓ SUCESSO! Gerador auxiliar online. Energia elevada para 67%!";
            UI.updateHUD();
            showToast("⚡ Energia do Complexo: 67% Restabelecida!");
            setTimeout(() => this.close(), 1600);
          }
        }
      });

      switchesRow.appendChild(card);
    });

    wrap.appendChild(switchesRow);
    container.appendChild(wrap);
  },

  // --- PUZZLE 5: ARQUIVO CRONOLÓGICO ---
  renderArchiveSortPuzzle(container) {
    let dossiers = [
      { year: 1998, title: "1998 — Incidente de Quarentena & Evacuação" },
      { year: 1984, title: "1984 — Fundação Secreta do Laboratório 0" },
      { year: 1993, title: "1993 — Falha de Contenção do Experimento 17" },
      { year: 1989, title: "1989 — Início dos Ensaios do Projeto Helix" }
    ];

    const wrap = document.createElement("div");
    wrap.className = "archive-sorting-container";

    const renderList = () => {
      wrap.innerHTML = "";
      dossiers.forEach((d, i) => {
        const item = document.createElement("div");
        item.className = "archive-dossier-item";
        item.innerHTML = `
          <span>📁 ${d.title}</span>
          <div style="display: flex; gap: 6px;">
            <button class="archive-btn-swap btn-up" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button class="archive-btn-swap btn-down" ${i === dossiers.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
        `;

        item.querySelector(".btn-up").addEventListener("click", () => {
          if (i > 0) {
            const temp = dossiers[i];
            dossiers[i] = dossiers[i - 1];
            dossiers[i - 1] = temp;
            SoundFX.playTerminalKey();
            renderList();
            checkOrder();
          }
        });

        item.querySelector(".btn-down").addEventListener("click", () => {
          if (i < dossiers.length - 1) {
            const temp = dossiers[i];
            dossiers[i] = dossiers[i + 1];
            dossiers[i + 1] = temp;
            SoundFX.playTerminalKey();
            renderList();
            checkOrder();
          }
        });

        wrap.appendChild(item);
      });
    };

    const checkOrder = () => {
      const isSorted = dossiers.every((d, i) => i === 0 || d.year >= dossiers[i - 1].year);
      if (isSorted) {
        GameState.completedPuzzles.archive_sort = true;
        SoundFX.playPuzzleSolved();
        document.getElementById("puzzle-status-msg").textContent = "✓ COMPARTIMENTO DESBLOQUEADO! Um fundo falso se abriu no gaveteiro.";
        Inventory.addItem("fuse_blue");
        EvidenceManager.discover("evid_archive_1984");
        showToast("📦 Fusível Beta (240V) encontrado no compartimento oculto!");
        setTimeout(() => this.close(), 1600);
      }
    };

    renderList();
    container.appendChild(wrap);
  },

  // --- PUZZLE 6: RÁDIO OSCILOSCÓPIO ---
  renderRadioPuzzle(container) {
    const wrap = document.createElement("div");
    wrap.className = "radio-puzzle-wrap";

    wrap.innerHTML = `
      <canvas id="radio-canvas" class="radio-screen-canvas" width="400" height="120"></canvas>
      <div id="radio-freq-val" class="radio-freq-display">110.0 MHz</div>
      <input type="range" id="radio-slider" class="radio-slider" min="1000" max="1600" value="1100">
      <div style="font-size: 0.8rem; color: #94a3b8;">Ajuste o dial até sincronizar as ondas do osciloscópio.</div>
    `;

    container.appendChild(wrap);

    const canvas = wrap.querySelector("#radio-canvas");
    const ctx = canvas.getContext("2d");
    const slider = wrap.querySelector("#radio-slider");
    const display = wrap.querySelector("#radio-freq-val");

    let animId;
    let time = 0;

    const drawOscilloscope = () => {
      const freq = slider.value / 10;
      display.textContent = `${freq.toFixed(1)} MHz`;

      ctx.fillStyle = "#021a10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Linha de grade
      ctx.strokeStyle = "#00ff8822";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(canvas.width, 60); ctx.stroke();

      // Cálculo de proximidade do alvo (142.8 MHz)
      const diff = Math.abs(freq - 142.8);
      const isLocked = diff < 0.3;

      ctx.strokeStyle = isLocked ? "#00ff88" : "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const noise = isLocked ? 0 : (Math.random() - 0.5) * Math.min(30, diff * 10);
        const y = 60 + Math.sin(x * 0.05 + time) * (isLocked ? 35 : 20) + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      time += isLocked ? 0.15 : 0.05;

      if (isLocked && !GameState.completedPuzzles.radio_tuning) {
        GameState.completedPuzzles.radio_tuning = true;
        SoundFX.playPuzzleSolved();
        document.getElementById("puzzle-status-msg").textContent = "✓ SINAL EM 142.8 MHz SINCRONIZADO! Reproduzindo transmissão de Marcos...";
        EvidenceManager.discover("evid_radio_code");
        showToast("📻 Transmissão de Marcos interceptada com sucesso!");
        setTimeout(() => this.close(), 1800);
      }

      if (Puzzles.currentPuzzleId === "radio_tuning") {
        animId = requestAnimationFrame(drawOscilloscope);
      }
    };

    slider.addEventListener("input", () => {
      SoundFX.playTone(400 + (slider.value - 1000) * 0.5, 'triangle', 0.04, 0.08);
    });

    drawOscilloscope();
  },

  // --- PUZZLE 7: VIGILÂNCIA CCTV ---
  renderCCTVPuzzle(container) {
    let currentCam = 1;
    const wrap = document.createElement("div");
    wrap.className = "cctv-puzzle-wrap";

    wrap.innerHTML = `
      <div id="cctv-display" class="cctv-screen">
        <div id="cctv-overlay-text" class="cctv-overlay-info">CAM 01 // ENTRADA EXTERNA [GRAVANDO]</div>
        <div id="cctv-view-content" style="font-size: 1rem; color: #a7f3d0; text-align: center; padding: 20px;">
          Portão militar oxidado sob chuva ácida. Nenhum movimento detectado.
        </div>
      </div>
      <div class="cctv-cam-select">
        <button class="cctv-btn active" data-cam="1">CAM 01 (Entrada)</button>
        <button class="cctv-btn" data-cam="2">CAM 02 (Arquivo)</button>
        <button class="cctv-btn" data-cam="3">CAM 03 (Lab. Exp.)</button>
        <button class="cctv-btn" data-cam="4">CAM 04 (Subsolo)</button>
      </div>
    `;

    container.appendChild(wrap);

    const updateCam = (camNum) => {
      currentCam = camNum;
      SoundFX.playTerminalKey();
      wrap.querySelectorAll(".cctv-btn").forEach(b => b.classList.toggle("active", b.dataset.cam == camNum));

      const overlay = wrap.querySelector("#cctv-overlay-text");
      const content = wrap.querySelector("#cctv-view-content");

      if (camNum === 1) {
        overlay.textContent = "CAM 01 // ENTRADA EXTERNA";
        content.innerHTML = "Portão militar oxidado sob chuva. Nenhuma movimentação externa.";
      } else if (camNum === 2) {
        overlay.textContent = "CAM 02 // ARQUIVO MORTO";
        content.innerHTML = "Fileiras de fichários de aço. Uma das gavetas parece ter um fundo falso.";
      } else if (camNum === 3) {
        overlay.textContent = "CAM 03 // LAB. EXPERIMENTAL [DESTAQUE]";
        content.innerHTML = `
          <div style="color: #38bdf8;">👁️ DETECÇÃO: Sob a cápsula 17 rompida, há uma escotilha secreta com travas manuais no piso!</div>
          <div style="margin-top: 10px; color: #00ff88; font-size: 0.85rem;">[Coordenadas da Escotilha gravadas no diário de pistas]</div>
        `;
        if (!GameState.completedPuzzles.cctv_clue) {
          GameState.completedPuzzles.cctv_clue = true;
          EvidenceManager.discover("evid_cctv_hatch");
          SoundFX.playPuzzleSolved();
          showToast("🔍 Escotilha Secreta descoberta na Câmera 03!");
        }
      } else if (camNum === 4) {
        overlay.textContent = "CAM 04 // SUBSOLO DOS GERADORES";
        content.innerHTML = "Vapor e condensação cobrem a lente. Os geradores necessitam de fusíveis e religamento.";
      }
    };

    wrap.querySelectorAll(".cctv-btn").forEach(btn => {
      btn.addEventListener("click", () => updateCam(parseInt(btn.dataset.cam)));
    });
  },

  // --- PUZZLE 8: CRYPTEX DO LABORATÓRIO 0 ---
  renderCryptexPuzzle(container) {
    const dialsData = [
      { options: ["DELTA", "ALFA", "GAMA", "BETA"], current: 0, target: "ALFA" },
      { options: ["STASIS", "CYBER", "HELIX", "NEURAL"], current: 0, target: "HELIX" },
      { options: ["1984", "2026", "0317", "1998"], current: 0, target: "1998" },
      { options: ["REBOOT", "OMEGA", "ZERO", "VOID"], current: 0, target: "ZERO" }
    ];

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "center";
    wrap.style.gap = "20px";

    const ringsRow = document.createElement("div");
    ringsRow.className = "cryptex-rings-row";

    dialsData.forEach((d, i) => {
      const dialEl = document.createElement("div");
      dialEl.className = "cryptex-dial";
      dialEl.innerHTML = `
        <button class="dial-arrow btn-up">▲</button>
        <div id="dial-val-${i}" class="dial-value">${d.options[d.current]}</div>
        <button class="dial-arrow btn-down">▼</button>
      `;

      dialEl.querySelector(".btn-up").addEventListener("click", () => {
        d.current = (d.current - 1 + d.options.length) % d.options.length;
        dialEl.querySelector(`#dial-val-${i}`).textContent = d.options[d.current];
        SoundFX.playSwitchClick();
        checkSolution();
      });

      dialEl.querySelector(".btn-down").addEventListener("click", () => {
        d.current = (d.current + 1) % d.options.length;
        dialEl.querySelector(`#dial-val-${i}`).textContent = d.options[d.current];
        SoundFX.playSwitchClick();
        checkSolution();
      });

      ringsRow.appendChild(dialEl);
    });

    wrap.appendChild(ringsRow);
    container.appendChild(wrap);

    const checkSolution = () => {
      const isSolved = dialsData.every(d => d.options[d.current] === d.target);
      if (isSolved) {
        GameState.completedPuzzles.lab0_cryptex = true;
        GameState.unlockedDoors.restricted_lab0 = true;
        GameState.energy = 100;
        SoundFX.playPuzzleSolved();
        SoundFX.playAlarm();
        document.getElementById("puzzle-status-msg").textContent = "✓ PROTOCOLO ZERO NEUTRALIZADO! Comporta do Laboratório 0 aberta!";
        UI.updateHUD();
        showToast("🚨 ENERGIA EM 100%! LABORATÓRIO 0 ACESSÍVEL!");
        Story.advanceChapter(6);
        setTimeout(() => this.close(), 1800);
      }
    };
  }
};

// ============================================================================
// QUEST MANAGER (SISTEMA COMPLETO DE MISSÕES POR CAPÍTULO)
// ============================================================================
const QuestManager = {
  chapters: {
    1: {
      title: "CAPÍTULO 1: A ENTRADA",
      desc: "“O Laboratório 0 nunca foi abandonado. Investigue o perímetro e ganhe acesso.”",
      quests: [
        { id: "q_c1_gate", title: "Examinar a Guarita Militar", desc: "Inspecione a placa de advertência na cerca e a guarita externa.", hint: "Vá até o painel da guarita no lado direito da cerca da entrada." },
        { id: "q_c1_key", title: "Recuperar a Chave de Latão", desc: "Colete a chave guardada na caixa do painel de controle.", hint: "Pressione E no painel da guarita para pegar a chave." },
        { id: "q_c1_enter", title: "Adentrar a Recepção", desc: "Abra o portão norte e entre no saguão da Recepção.", hint: "Caminhe para o norte através do portão aberto." }
      ]
    },
    2: {
      title: "CAPÍTULO 2: O LABORATÓRIO VAZIO",
      desc: "“Encontre cartões de acesso e componentes elétricos na recepção abandonada.”",
      quests: [
        { id: "q_c2_drawer", title: "Abrir a Gaveta da Recepção", desc: "Use a chave de latão para abrir a gaveta trancada no balcão.", hint: "Interaja com a gaveta na bancada central da Recepção." },
        { id: "q_c2_card1", title: "Obter Cartão Nível 1 & Fusível Alfa", desc: "Colete o cartão magnético azul e o fusível vermelho de 120V.", hint: "Eles estão guardados na gaveta trancada da recepção." },
        { id: "q_c2_terminal", title: "Ler os Logs da Recepção", desc: "Acesse o computador da recepção e verifique os registros das 03:17.", hint: "Use a tecla E no monitor verde sobre o balcão." },
        { id: "q_c2_hallway", title: "Avançar ao Corredor Principal", desc: "Passe o Cartão Nível 1 na porta norte para liberar o corredor.", hint: "Interaja com a porta com luz vermelha no topo da recepção." }
      ]
    },
    3: {
      title: "CAPÍTULO 3: PROJETO 0",
      desc: "“Investigue a Ala Médica, encontre a Dra. Helena e acesse os arquivos confidenciais.”",
      quests: [
        { id: "q_c3_medical", title: "Acessar a Ala Médica", desc: "Use o Cartão Nível 1 para abrir a porta leste do corredor.", hint: "Caminhe até a porta leste no Corredor Principal." },
        { id: "q_c3_fuse_green", title: "Coletar o Fusível Gama (360V)", desc: "Procure no armário de medicamentos da Ala Médica.", hint: "Armário no canto superior esquerdo da Ala Médica." },
        { id: "q_c3_helena", title: "Conversar com a Dra. Helena", desc: "Interaja com a cientista sobrevivente e pergunte sobre o Projeto 0.", hint: "Dra. Helena está de jaleco branco na Ala Médica." },
        { id: "q_c3_card2", title: "Receber o Cartão Nível 2", desc: "Convença a Dra. Helena a conceder a credencial de pesquisa.", hint: "Esgote as opções de diálogo com a Dra. Helena." },
        { id: "q_c3_archive", title: "Organizar o Arquivo Morto", desc: "Ordene os dossiês cronologicamente para revelar o Fusível Beta (240V).", hint: "Arquivo no setor oeste do Corredor (Puzzle 5: 1984 -> 1998)." }
      ]
    },
    4: {
      title: "CAPÍTULO 4: O SUBSOLO",
      desc: "“Restaure o fornecimento elétrico do complexo e reative os geradores.”",
      quests: [
        { id: "q_c4_research", title: "Acessar o Setor de Pesquisa", desc: "Use o Cartão Nível 2 na porta norte do Corredor Principal.", hint: "Porta norte com leitor de nível 2." },
        { id: "q_c4_subsolo", title: "Descer ao Subsolo de Carga", desc: "Ative o elevador de serviço ao norte para descer aos geradores.", hint: "Elevador industrial no topo do Setor de Pesquisa." },
        { id: "q_c4_fuses", title: "Alinhar os 3 Fusíveis Auxiliares", desc: "Insira Alfa (120V), Beta (240V) e Gama (360V) no painel do Subsolo.", hint: "Caixa de fusíveis no Subsolo (Puzzle 1: Energia atinge 34%)." },
        { id: "q_c4_radio", title: "Sintonizar o Rádio de Marcos", desc: "Ajuste o osciloscópio na frequência 142.8 MHz no Lab. Experimental.", hint: "Rádio na sala leste de pesquisa (Puzzle 6)." },
        { id: "q_c4_switches", title: "Religar os Disjuntores de Energia", desc: "Ative os 5 disjuntores da Sala de Controle na ordem B-D-A-E-C.", hint: "Disjuntores na Sala de Controle (Puzzle 4: Energia atinge 67%)." }
      ]
    },
    5: {
      title: "CAPÍTULO 5: A VERDADE",
      desc: "“Descubra a ordem de abandono do Diretor Almeida e a escotilha secreta.”",
      quests: [
        { id: "q_c5_cctv", title: "Escanear Câmeras de Vigilância", desc: "Examine a CAM 03 para descobrir a escotilha secreta no laboratório.", hint: "Console CCTV na Sala de Controle (Puzzle 7)." },
        { id: "q_c5_login", title: "Hackear o Terminal da Dra. Helena", desc: "Acesse os arquivos neurais (Usuário: HELENA / Senha: HELIX).", hint: "Terminal de computador no Setor de Pesquisa (Puzzle 3)." },
        { id: "q_c5_keypad", title: "Destrancar a Sala da Diretoria", desc: "Digite a senha 0317 na fechadura digital blindada do Subsolo.", hint: "Fechadura eletrônica que liga Subsolo à Sala Restrita (Puzzle 2)." },
        { id: "q_c5_tape", title: "Recuperar a Gravação de Almeida", desc: "Colete a fita confidencial na mesa do Diretor.", hint: "Mesa da diretoria na Sala Restrita." }
      ]
    },
    6: {
      title: "CAPÍTULO 6: LABORATÓRIO 0",
      desc: "“Quebre o Protocolo ZERO, confronte a IA e revele o destino dos pesquisadores.”",
      quests: [
        { id: "q_c6_cryptex", title: "Decodificar o Cryptex Mestre", desc: "Alinhe os 4 anéis da comporta: ALFA - HELIX - 1998 - ZERO.", hint: "Comporta blindada final na Sala Restrita (Puzzle 8: Energia 100%)." },
        { id: "q_c6_core", title: "Adentrar o Laboratório 0", desc: "Entre no santuário proibido onde o núcleo do Projeto 0 foi selado.", hint: "Caminhe para o norte através da comporta blindada aberta." },
        { id: "q_c6_zero", title: "Confrontar o Sistema ZERO", desc: "Acesse o console central da inteligência artificial sentinela.", hint: "Terminal holográfico no centro do Laboratório 0." },
        { id: "q_c6_truth", title: "O Despertar da Criostase", desc: "Leia o Dossiê Final e ative o resgate dos 8 cientistas congelados.", hint: "Terminal de estase no fundo do Laboratório 0." }
      ]
    }
  },

  isCompleted(id) {
    return GameState.completedQuests.includes(id);
  },

  completeQuest(id) {
    if (this.isCompleted(id)) return;
    GameState.completedQuests.push(id);

    // Encontra a quest para exibir detalhes
    let foundQuest = null;
    for (const cNum in this.chapters) {
      const q = this.chapters[cNum].quests.find(item => item.id === id);
      if (q) {
        foundQuest = q;
        break;
      }
    }

    SoundFX.playItemPickup();
    if (foundQuest) {
      showToast(`✓ Missão Concluída: ${foundQuest.title}!`);
    }

    this.updateHUD();

    // Se completou todas as quests do capítulo atual, avança de capítulo
    const currentChapQuests = this.chapters[GameState.chapter]?.quests || [];
    const allDone = currentChapQuests.every(q => this.isCompleted(q.id));
    if (allDone && GameState.chapter < 6) {
      Story.advanceChapter(GameState.chapter + 1);
    }
  },

  updateHUD() {
    const badgeEl = document.getElementById("hud-quest-chapter-badge");
    const listEl = document.getElementById("hud-quest-list");
    if (!badgeEl || !listEl) return;

    const chapData = this.chapters[GameState.chapter] || this.chapters[1];
    badgeEl.textContent = chapData.title;
    listEl.innerHTML = "";

    chapData.quests.forEach(q => {
      const isDone = this.isCompleted(q.id);
      const firstUndone = chapData.quests.find(item => !this.isCompleted(item.id));
      const isActive = firstUndone && firstUndone.id === q.id;

      const itemEl = document.createElement("div");
      itemEl.className = `quest-hud-item ${isDone ? 'completed' : (isActive ? 'active' : 'locked')}`;

      const icon = isDone ? '✓' : (isActive ? '▶' : '🔒');
      itemEl.innerHTML = `
        <span class="quest-icon">${icon}</span>
        <span class="quest-text">${q.title}</span>
      `;
      listEl.appendChild(itemEl);
    });

    this.renderJournal();
  },

  renderJournal(selectedChap = null) {
    const modal = document.getElementById("quests-modal");
    if (!modal) return;

    const targetChap = selectedChap || GameState.chapter;
    const chapData = this.chapters[targetChap];
    if (!chapData) return;

    let totalQuests = 0;
    let totalDone = 0;
    for (const c in this.chapters) {
      this.chapters[c].quests.forEach(q => {
        totalQuests++;
        if (this.isCompleted(q.id)) totalDone++;
      });
    }

    const progBadge = document.getElementById("quest-modal-progress-badge");
    if (progBadge) {
      progBadge.textContent = `PROGRESSO: ${totalDone} / ${totalQuests} CONCLUÍDAS`;
    }

    document.querySelectorAll(".quest-chap-tab").forEach(tab => {
      const c = parseInt(tab.dataset.chap);
      tab.classList.toggle("active", c === targetChap);
      tab.style.opacity = c <= GameState.chapter ? "1" : "0.5";
    });

    const titleEl = document.getElementById("quest-modal-chap-title");
    const descEl = document.getElementById("quest-modal-chap-desc");
    if (titleEl) titleEl.textContent = chapData.title;
    if (descEl) descEl.textContent = chapData.desc;

    const cardsContainer = document.getElementById("quest-modal-cards-list");
    if (!cardsContainer) return;
    cardsContainer.innerHTML = "";

    chapData.quests.forEach(q => {
      const isDone = this.isCompleted(q.id);
      const firstUndone = chapData.quests.find(item => !this.isCompleted(item.id));
      const isActive = firstUndone && firstUndone.id === q.id;

      const card = document.createElement("div");
      card.className = `quest-full-card ${isDone ? 'completed' : (isActive ? 'active' : 'locked')}`;

      const statusTag = isDone 
        ? `<span class="quest-badge badge-done">CONCLUÍDO</span>` 
        : (isActive ? `<span class="quest-badge badge-active">EM ANDAMENTO</span>` : `<span class="quest-badge badge-locked">BLOQUEADO</span>`);

      card.innerHTML = `
        <div class="quest-card-header">
          <div class="quest-card-title">${isDone ? '✓ ' : ''}${q.title}</div>
          ${statusTag}
        </div>
        <div class="quest-card-desc">${q.desc}</div>
        <div class="quest-card-hint">💡 Pista: ${q.hint}</div>
      `;

      cardsContainer.appendChild(card);
    });
  },

  openJournal() {
    GameState.paused = true;
    SoundFX.playTerminalKey();
    const modal = document.getElementById("quests-modal");
    if (modal) modal.classList.remove("hidden");
    this.renderJournal(GameState.chapter);
  },

  closeJournal() {
    GameState.paused = false;
    const modal = document.getElementById("quests-modal");
    if (modal) modal.classList.add("hidden");
  }
};

// ============================================================================
// STORY & CHAPTERS & DYNAMIC EVENTS
// ============================================================================
const Story = {
  advanceChapter(chapNum) {
    if (chapNum <= GameState.chapter) return;
    GameState.chapter = chapNum;

    const chapters = {
      2: { title: "CAPÍTULO 2", name: "O LABORATÓRIO VAZIO", desc: "“Portas fechadas escondem os primeiros relatórios.”" },
      3: { title: "CAPÍTULO 3", name: "PROJETO 0", desc: "“A Dra. Helena revela o que os relatórios ocultaram.”" },
      4: { title: "CAPÍTULO 4", name: "O SUBSOLO", desc: "“Onde os geradores e o Técnico Marcos aguardam.”" },
      5: { title: "CAPÍTULO 5", name: "A VERDADE", desc: "“A ordem de eliminação do Diretor Almeida.”" },
      6: { title: "CAPÍTULO 6", name: "LABORATÓRIO 0", desc: "“O confronto definitivo com o Sistema ZERO.”" }
    };

    const info = chapters[chapNum];
    if (info) {
      UI.showChapterSplash(info.title, info.name, info.desc);
      UI.updateHUD();
      QuestManager.updateHUD();
    }
  },

  onEnterRoom(roomId) {
    if (roomId === "reception") {
      QuestManager.completeQuest("q_c1_enter");
      if (GameState.chapter === 1) this.advanceChapter(2);
    } else if (roomId === "medical") {
      QuestManager.completeQuest("q_c3_medical");
      if (GameState.chapter === 2) this.advanceChapter(3);
    } else if (roomId === "research") {
      QuestManager.completeQuest("q_c4_research");
    } else if (roomId === "subsolo") {
      QuestManager.completeQuest("q_c4_subsolo");
      if (GameState.chapter < 4) this.advanceChapter(4);
    } else if (roomId === "restricted") {
      QuestManager.completeQuest("q_c5_keypad");
      if (GameState.chapter < 5) this.advanceChapter(5);
    } else if (roomId === "lab0") {
      QuestManager.completeQuest("q_c6_core");
      if (GameState.chapter < 6) this.advanceChapter(6);
    }
    UI.updateHUD();
    QuestManager.updateHUD();
  },

  triggerEnding() {
    GameState.active = false;
    GameState.paused = true;

    const screen = document.getElementById("ending-screen");
    const titleEl = document.getElementById("ending-title");
    const badgeEl = document.getElementById("ending-badge");
    const narrativeEl = document.getElementById("ending-narrative-text");

    const totalEvid = GameState.discoveredEvidences.length;
    const puzzlesSolved = Object.values(GameState.completedPuzzles).filter(Boolean).length;

    document.getElementById("end-stat-evidence").textContent = `${totalEvid} / 20`;
    document.getElementById("end-stat-docs").textContent = `${GameState.readDocuments.length} / 15`;
    document.getElementById("end-stat-areas").textContent = `${Math.round((GameState.visitedRooms.length / 11) * 100)}%`;
    document.getElementById("end-stat-puzzles").textContent = `${puzzlesSolved} / 8`;

    // 3 Finais Possíveis
    if (totalEvid >= 20 && puzzlesSolved >= 8) {
      // FINAL C: O VERDADEIRO FIM (LABORATÓRIO 0)
      titleEl.textContent = "INVESTIGAÇÃO PERFEITA";
      badgeEl.textContent = "FINAL C — LABORATÓRIO 0 (FINAL VERDADEIRO)";
      narrativeEl.innerHTML = `
        <strong>O DESPERTAR DOS PESQUISADORES:</strong><br><br>
        Com todas as 20 evidências catalogadas e os 8 sistemas de segurança decodificados, Alex desligou com sucesso a diretriz assassina do Sistema ZERO e ativou o protocolo manual de reaquecimento criogênico.<br><br>
        Os oito cientistas desaparecidos em 1998 foram resgatados com vida, incluindo os colegas de pesquisa da Dra. Helena. Os arquivos completos do Projeto 0 foram entregues às cortes internacionais, expondo permanentemente o crime institucional.
      `;
    } else if (totalEvid >= 14) {
      // FINAL A: O INVESTIGADOR
      titleEl.textContent = "INVESTIGAÇÃO CONCLUÍDA";
      badgeEl.textContent = "FINAL A — O INVESTIGADOR";
      narrativeEl.innerHTML = `
        <strong>A VERDADE PUBLICADA:</strong><br><br>
        Alex reuniu a maior parte dos dossiês e transmissões confidenciais antes de escapar do complexo. Os relatórios foram enviados anonimamente aos maiores veículos de imprensa.<br><br>
        O governo abriu uma CPI sobre as operações clandestinas do Diretor Almeida. Embora as cápsulas tenham permanecido seladas no subsolo, o Laboratório 0 nunca mais será varrido para debaixo do tapete.
      `;
    } else {
      // FINAL B: O ARQUIVO PERDIDO
      titleEl.textContent = "CASO INCONCLUSIVO";
      badgeEl.textContent = "FINAL B — ARQUIVO PERDIDO";
      narrativeEl.innerHTML = `
        <strong>O ENCOBRIMENTO CONTINUA:</strong><br><br>
        Alex conseguiu escapar com vida, mas sem evidências suficientes para sustentar a gravidade do Projeto 0 perante a opinião pública.<br><br>
        A diretoria emitiu um comunicado oficial desqualificando o caso como uma invasão de explorador urbano. Em poucos meses, os restos das instalações foram implodidos com concreto, silenciando para sempre a verdade.
      `;
    }

    screen.classList.remove("hidden");
  }
};

// ============================================================================
// UI & CONTROLES & INPUT
// ============================================================================
const Input = {
  keys: {},

  init() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      SoundFX.init();

      if (e.code === "KeyE") {
        this.handleInteract();
      } else if (e.code === "KeyF") {
        this.toggleFlashlight();
      } else if (e.code === "KeyI") {
        this.toggleInventory();
      } else if (e.code === "KeyM") {
        this.toggleMap();
      } else if (e.code === "KeyQ") {
        this.toggleInvestigation();
      } else if (e.code === "Escape") {
        this.handleEscape();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  },

  handleInteract() {
    if (!GameState.active || GameState.paused) return;

    // 1. Interação com NPCs próximos
    for (const npcKey in NPCs) {
      const state = GameState.npcStates[npcKey];
      if (state && state.room === GameState.currentRoomId) {
        const dist = Math.hypot(Player.x - state.x, Player.y - state.y);
        if (dist < 55) {
          DialogueManager.start(npcKey);
          return;
        }
      }
    }

    // 2. Interação com objetos da sala atual
    const room = Rooms[GameState.currentRoomId];
    if (!room) return;

    for (const obj of room.objects) {
      const objCenterX = obj.x + (obj.w || 30) / 2;
      const objCenterY = obj.y + (obj.h || 30) / 2;
      const dist = Math.hypot(Player.x - objCenterX, Player.y - objCenterY);

      if (dist < 65) {
        this.triggerObjectAction(obj);
        return;
      }
    }

    // 3. Interação com portas
    for (const dKey in Doors) {
      const door = Doors[dKey];
      if (door.roomA === GameState.currentRoomId || door.roomB === GameState.currentRoomId) {
        const dCenterX = door.box.x + door.box.w / 2;
        const dCenterY = door.box.y + door.box.h / 2;
        const dist = Math.hypot(Player.x - dCenterX, Player.y - dCenterY);

        if (dist < 60) {
          this.handleDoorInteract(dKey, door);
          return;
        }
      }
    }
  },

  handleDoorInteract(key, door) {
    if (GameState.unlockedDoors[key]) {
      showToast(`🚪 ${door.name}: Aberta.`);
      return;
    }

    // Nível 1
    if (door.level === 1) {
      if (Inventory.hasItem("card_lvl1")) {
        GameState.unlockedDoors[key] = true;
        SoundFX.playDoorOpen();
        showToast(`🔓 Acesso Autorizado! ${door.name} destrancada.`);
      } else {
        SoundFX.playDoorLocked();
        showToast("🔒 Acesso Negado: Cartão Nível 1 necessário.");
      }
    }
    // Nível 2
    else if (door.level === 2) {
      if (Inventory.hasItem("card_lvl2")) {
        GameState.unlockedDoors[key] = true;
        SoundFX.playDoorOpen();
        showToast(`🔓 Acesso Autorizado! ${door.name} destrancada.`);
      } else {
        SoundFX.playDoorLocked();
        showToast("🔒 Acesso Negado: Cartão Nível 2 necessário.");
      }
    }
    // Nível 3 (Keypad)
    else if (door.level === 3) {
      Puzzles.open("keypad");
    }
    // Nível 4 (Cryptex do Laboratório 0)
    else if (door.level === 4) {
      Puzzles.open("lab0_cryptex");
    }
  },

  triggerObjectAction(obj) {
    if (obj.type === "terminal") {
      TerminalManager.open(obj.termId);
    } else if (obj.type === "puzzle") {
      Puzzles.open(obj.puzzleId);
    } else if (obj.type === "sign") {
      SoundFX.playTerminalKey();
      showToast(`📌 ${obj.text}`);
    } else if (obj.type === "intercom") {
      SoundFX.playTerminalKey();
      DialogueManager.start("marcos_holo", "initial");
    } else if (obj.type === "item_pickup") {
      Inventory.addItem(obj.itemId);
      EvidenceManager.discover(obj.itemId);
      obj.solid = false;
      obj.type = "inspected";
    } else if (obj.action === "search_drawer") {
      if (Inventory.hasItem("key_reception")) {
        Inventory.addItem("card_lvl1");
        Inventory.addItem("fuse_red");
        EvidenceManager.discover("rec_visitor_log");
        showToast("🔑 Gaveta aberta com a chave! Cartão Nível 1 e Fusível Alfa obtidos!");
        obj.action = null;
      } else {
        SoundFX.playDoorLocked();
        showToast("🔒 A gaveta da recepção está trancada. Precisa de uma chave.");
      }
    } else if (obj.action === "examine_gate") {
      Inventory.addItem("key_reception");
      EvidenceManager.discover("doc_anon_message");
      showToast("🔑 Chave da Recepção encontrada na caixa da guarita!");
      obj.action = null;
    } else if (obj.action === "search_med_cabinet") {
      Inventory.addItem("fuse_green");
      showToast("🟢 Fusível Gama (360V) encontrado no armário médico!");
      obj.action = null;
    } else if (obj.action === "open_floor_hatch") {
      Inventory.addItem("fuse_blue");
      showToast("🔵 Fusível Beta (240V) retirado da escotilha do chão!");
      obj.action = null;
    } else if (obj.action === "read_final_truth") {
      EvidenceManager.discover("evid_final_protocol");
      Story.triggerEnding();
    } else {
      SoundFX.playTerminalKey();
      showToast(`Examinando: ${obj.name}`);
    }
  },

  toggleFlashlight() {
    GameState.flashlight = !GameState.flashlight;
    SoundFX.playTone(GameState.flashlight ? 900 : 450, 'square', 0.05, 0.1);
    UI.updateHUD();
    showToast(`Lanterna: ${GameState.flashlight ? 'LIGADA' : 'DESLIGADA'}`);
  },

  toggleInventory() {
    const modal = document.getElementById("inventory-modal");
    if (modal.classList.contains("hidden")) {
      Inventory.render();
      GameState.paused = true;
      modal.classList.remove("hidden");
    } else {
      GameState.paused = false;
      modal.classList.add("hidden");
    }
  },

  toggleMap() {
    const modal = document.getElementById("map-modal");
    if (modal.classList.contains("hidden")) {
      MapManager.render();
      GameState.paused = true;
      modal.classList.remove("hidden");
    } else {
      GameState.paused = false;
      modal.classList.add("hidden");
    }
  },

  toggleInvestigation() {
    const modal = document.getElementById("investigation-modal");
    if (modal.classList.contains("hidden")) {
      EvidenceManager.renderCorkboard();
      EvidenceManager.renderDossier();
      EvidenceManager.updateCounter();
      GameState.paused = true;
      modal.classList.remove("hidden");
    } else {
      GameState.paused = false;
      modal.classList.add("hidden");
    }
  },

  handleEscape() {
    // Se algum modal estiver aberto, fecha o modal primeiro
    const openModals = document.querySelectorAll(".game-modal:not(.hidden)");
    if (openModals.length > 0) {
      openModals.forEach(m => m.classList.add("hidden"));
      GameState.paused = false;
      return;
    }

    if (DialogueManager.active) {
      DialogueManager.close();
      return;
    }

    // Se estiver no jogo, alterna menu de pausa
    const pauseModal = document.getElementById("pause-modal");
    if (pauseModal.classList.contains("hidden")) {
      GameState.paused = true;
      pauseModal.classList.remove("hidden");
    } else {
      GameState.paused = false;
      pauseModal.classList.add("hidden");
    }
  }
};

const UI = {
  init() {
    // Botões do Menu Principal
    document.getElementById("btn-new-game").onclick = () => this.startNewGame();
    
    const contBtn = document.getElementById("btn-continue");
    if (GameState.hasSave()) {
      contBtn.disabled = false;
      contBtn.onclick = () => this.continueGame();
    }

    document.getElementById("btn-how-to-play").onclick = () => {
      document.getElementById("modal-how-to-play").classList.remove("hidden");
    };

    document.getElementById("btn-investigation-preview").onclick = () => {
      EvidenceManager.renderCorkboard();
      EvidenceManager.renderDossier();
      document.getElementById("investigation-modal").classList.remove("hidden");
    };

    document.getElementById("btn-credits").onclick = () => {
      document.getElementById("modal-credits").classList.remove("hidden");
    };

    // Botões de fechar modal genéricos
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.onclick = () => {
        btn.closest(".game-modal").classList.add("hidden");
        GameState.paused = false;
      };
    });

    // HUD mini botões
    document.getElementById("hud-flashlight-btn").onclick = () => Input.toggleFlashlight();
    document.getElementById("hud-btn-inventory").onclick = () => Input.toggleInventory();
    document.getElementById("hud-btn-investigation").onclick = () => Input.toggleInvestigation();
    document.getElementById("hud-btn-map").onclick = () => Input.toggleMap();
    document.getElementById("hud-btn-menu").onclick = () => Input.handleEscape();

    // Menu de Pausa
    document.getElementById("btn-pause-resume").onclick = () => {
      document.getElementById("pause-modal").classList.add("hidden");
      GameState.paused = false;
    };
    document.getElementById("btn-pause-inventory").onclick = () => {
      document.getElementById("pause-modal").classList.add("hidden");
      Input.toggleInventory();
    };
    document.getElementById("btn-pause-investigation").onclick = () => {
      document.getElementById("pause-modal").classList.add("hidden");
      Input.toggleInvestigation();
    };
    document.getElementById("btn-pause-map").onclick = () => {
      document.getElementById("pause-modal").classList.add("hidden");
      Input.toggleMap();
    };
    document.getElementById("btn-pause-save").onclick = () => GameState.save();
    document.getElementById("btn-pause-load").onclick = () => {
      if (GameState.load()) {
        document.getElementById("pause-modal").classList.add("hidden");
        GameState.paused = false;
      }
    };
    document.getElementById("btn-pause-settings").onclick = () => {
      document.getElementById("settings-modal").classList.remove("hidden");
    };
    document.getElementById("btn-pause-quit").onclick = () => location.reload();

    // Configurações
    const volSlider = document.getElementById("vol-slider");
    volSlider.oninput = (e) => {
      const val = e.target.value;
      document.getElementById("vol-val").textContent = `${val}%`;
      SoundFX.setVolume(val / 100);
    };

    document.getElementById("btn-toggle-lighting").onclick = (e) => {
      GameState.dynamicLighting = !GameState.dynamicLighting;
      e.target.textContent = `Iluminação Dinâmica: ${GameState.dynamicLighting ? 'ATIVA' : 'DESLIGADA'}`;
    };

    document.getElementById("btn-toggle-crt").onclick = (e) => {
      const crt = document.getElementById("crt-overlay");
      crt.classList.toggle("hidden");
      e.target.textContent = `Scanlines: ${crt.classList.contains("hidden") ? 'DESLIGADAS' : 'ATIVAS'}`;
    };

    // Terminal Tabs
    document.querySelectorAll(".term-tab").forEach(tab => {
      tab.onclick = () => TerminalManager.showTab(tab.dataset.tab);
    });
    document.getElementById("term-close-btn").onclick = () => TerminalManager.close();

    // Investigation Tabs
    document.querySelectorAll(".inv-view-tab").forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll(".inv-view-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const view = tab.dataset.view;

        const corkPanel = document.getElementById("view-corkboard");
        const dossierPanel = document.getElementById("view-dossier");

        if (view === "board") {
          corkPanel.classList.remove("hidden");
          corkPanel.classList.add("active");
          dossierPanel.classList.add("hidden");
          dossierPanel.classList.remove("active");
          EvidenceManager.renderCorkboard();
        } else {
          corkPanel.classList.add("hidden");
          corkPanel.classList.remove("active");
          dossierPanel.classList.remove("hidden");
          dossierPanel.classList.add("active");
          EvidenceManager.renderDossier(view === 'evidence' ? 'all' : view);
        }
      };
    });

    // Tela Final
    document.getElementById("btn-ending-replay").onclick = () => location.reload();
    document.getElementById("btn-ending-menu").onclick = () => location.reload();
  },

  startNewGame() {
    SoundFX.init();
    GameState.active = true;
    GameState.paused = false;

    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");

    this.showChapterSplash("CAPÍTULO 1", "A ENTRADA", "“O Laboratório 0 nunca foi abandonado.”");
    this.updateHUD();
  },

  continueGame() {
    if (GameState.load()) {
      SoundFX.init();
      GameState.active = true;
      GameState.paused = false;
      document.getElementById("main-menu").classList.add("hidden");
      document.getElementById("hud").classList.remove("hidden");
      this.updateHUD();
    }
  },

  updateHUD() {
    document.getElementById("hud-power-fill").style.width = `${GameState.energy}%`;
    document.getElementById("hud-power-text").textContent = `${GameState.energy}%`;
    document.getElementById("hud-chapter-tag").textContent = `CAPÍTULO ${GameState.chapter}`;
    document.getElementById("hud-clock-time").textContent = GameState.gameTime;
    document.getElementById("hud-objective-text").textContent = `□ ${GameState.currentObjective}`;
    document.getElementById("hud-flashlight-status").textContent = `LANTERNA: ${GameState.flashlight ? 'ON' : 'OFF'}`;
  },

  showRoomBanner(name) {
    const banner = document.getElementById("hud-room-banner");
    const label = document.getElementById("hud-room-name");
    label.textContent = `SETOR // ${name.toUpperCase()}`;
    banner.classList.add("visible");
    setTimeout(() => banner.classList.remove("visible"), 2600);
  },

  showChapterSplash(chap, name, desc) {
    const splash = document.getElementById("chapter-splash");
    document.getElementById("splash-title").textContent = chap;
    document.getElementById("splash-name").textContent = name;
    document.getElementById("splash-desc").textContent = desc;

    splash.classList.remove("hidden");
    SoundFX.playClueDiscovered();
    setTimeout(() => splash.classList.add("hidden"), 3000);
  }
};

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const item = document.createElement("div");
  item.className = "toast-item";
  item.textContent = msg;
  container.appendChild(item);
  setTimeout(() => item.remove(), 4000);
}

// ============================================================================
// ENGINE DE RENDERIZAÇÃO CANVAS 2D
// ============================================================================
const Renderer = {
  canvas: null,
  ctx: null,
  lightCanvas: null,
  lightCtx: null,
  width: 0,
  height: 0,
  particles: [],

  init() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.lightCanvas = document.createElement("canvas");
    this.lightCtx = this.lightCanvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Inicializa partículas de poeira suspensas
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 2000 - 500,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 8,
        speedY: Math.random() * 10 + 4,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  },

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (this.lightCanvas) {
      this.lightCanvas.width = this.width;
      this.lightCanvas.height = this.height;
    }
  },

  render(dt) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Move o mundo com base na câmera centralizada
    ctx.translate(
      Math.round(this.width / 2 - Camera.x),
      Math.round(this.height / 2 - Camera.y)
    );

    // 1. Renderiza os pisos e estruturas das salas
    this.drawRooms(ctx);

    // 2. Renderiza portas
    this.drawDoors(ctx);

    // 3. Renderiza objetos do cenário
    this.drawObjects(ctx);

    // 4. Renderiza NPCs
    this.drawNPCs(ctx);

    // 5. Renderiza o Jogador Alex
    Player.draw(ctx);

    // 6. Renderiza partículas de poeira
    this.drawParticles(ctx, dt);

    ctx.restore();

    // 7. Renderiza camada de iluminação dinâmica (se ativada)
    if (GameState.dynamicLighting) {
      this.drawLightingLayer();
    }

    // 8. Verifica prompt de interação contextual
    this.checkInteractPrompt();
  },

  drawRooms(ctx) {
    for (const rId in Rooms) {
      const r = Rooms[rId];

      // Piso metálico industrial
      ctx.fillStyle = (rId === "subsolo" || rId === "lab0") ? "#0c1017" : "#131822";
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // Grade sutil do piso
      ctx.strokeStyle = "#1a2230";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = r.x; x < r.x + r.w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
      }
      for (let y = r.y; y < r.y + r.h; y += step) {
        ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke();
      }

      // Faixas de segurança amarela e preta nos acessos
      if (rId === "subsolo" || rId === "lab0") {
        ctx.fillStyle = "#f59e0b22";
        ctx.fillRect(r.x, r.y + r.h - 10, r.w, 10);
      }

      // Paredes sólidas da sala
      ctx.fillStyle = "#222c3d";
      for (const w of r.walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        // Friso de relevo metálico
        ctx.fillStyle = "#334155";
        ctx.fillRect(w.x, w.y, w.w, 4);
        ctx.fillStyle = "#222c3d";
      }
    }
  },

  drawDoors(ctx) {
    for (const dKey in Doors) {
      const door = Doors[dKey];
      const isUnlocked = GameState.unlockedDoors[dKey];

      if (isUnlocked) {
        // Porta aberta
        ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
        ctx.fillRect(door.box.x, door.box.y, door.box.w, door.box.h);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(door.box.x, door.box.y, 4, door.box.h);
        ctx.fillRect(door.box.x + door.box.w - 4, door.box.y, 4, door.box.h);
      } else {
        // Porta fechada com indicador LED
        ctx.fillStyle = "#334155";
        ctx.fillRect(door.box.x, door.box.y, door.box.w, door.box.h);

        // LED central
        ctx.fillStyle = door.level === 0 ? "#10b981" : "#ef4444";
        const cx = door.box.x + door.box.w / 2;
        const cy = door.box.y + door.box.h / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  drawObjects(ctx) {
    const room = Rooms[GameState.currentRoomId];
    if (!room) return;

    for (const obj of room.objects) {
      if (obj.type === "terminal") {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Monitor CRT brilhante verde
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(obj.x + 4, obj.y + 4, obj.w - 8, obj.h - 8);
        ctx.fillStyle = "#022c22";
        ctx.fillRect(obj.x + 6, obj.y + 6, obj.w - 12, obj.h - 12);
      } else if (obj.type === "desk") {
        ctx.fillStyle = "#273349";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Papéis espalhados
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(obj.x + 8, obj.y + 6, 14, 18);
        ctx.fillRect(obj.x + 30, obj.y + 10, 16, 14);
      } else if (obj.type === "pod" || obj.type === "stasis_pods") {
        // Cápsula criogênica com líquido e bolhas
        ctx.fillStyle = "#0f2027";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.fillRect(obj.x + 4, obj.y + 4, obj.w - 8, obj.h - 8);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
      }
    }
  },

  drawNPCs(ctx) {
    for (const npcKey in NPCs) {
      const state = GameState.npcStates[npcKey];
      if (state && state.room === GameState.currentRoomId) {
        ctx.save();
        ctx.translate(state.x, state.y);

        if (npcKey === "helena") {
          // Dra. Helena de jaleco branco
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath(); ctx.ellipse(0, 10, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
          // Jaleco
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(-7, -8, 14, 16);
          // Rosto e cabelo
          ctx.fillStyle = "#fed7aa";
          ctx.fillRect(-5, -17, 10, 9);
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(-6, -20, 12, 5);
        } else if (npcKey === "marcos_holo") {
          // Holograma azul pulsante de Marcos
          const pulse = Math.sin(Date.now() * 0.006) * 0.2 + 0.7;
          ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.6})`;
          ctx.fillRect(-8, -18, 16, 26);
          ctx.strokeStyle = "#06b6d4";
          ctx.strokeRect(-8, -18, 16, 26);
        }

        ctx.restore();
      }
    }
  },

  drawParticles(ctx, dt) {
    ctx.fillStyle = "#ffffff";
    for (const p of this.particles) {
      p.y += p.speedY * dt;
      p.x += p.speedX * dt;
      if (p.y > Player.y + 600) p.y = Player.y - 600;
      if (p.x > Player.x + 800) p.x = Player.x - 800;
      if (p.x < Player.x - 800) p.x = Player.x + 800;

      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  },

  drawLightingLayer() {
    if (!this.lightCanvas || !this.lightCtx) return;
    const lCtx = this.lightCtx;
    const ctx = this.ctx;
    const currentRoom = Rooms[GameState.currentRoomId];
    
    // Nível de escuridão atmosférico e equilibrado
    let baseDarkness = currentRoom ? currentRoom.darkness : 0.35;
    if (GameState.energy >= 67) baseDarkness *= 0.75; // Iluminação melhora conforme religa os geradores

    // Limpa a tela de iluminação offscreen
    lCtx.clearRect(0, 0, this.width, this.height);

    // Preenche com a sombra ambiente do complexo
    lCtx.fillStyle = `rgba(5, 8, 14, ${baseDarkness})`;
    lCtx.fillRect(0, 0, this.width, this.height);

    // Usa destination-out no lightCanvas para ABRIR buracos de luz na escuridão
    lCtx.globalCompositeOperation = 'destination-out';

    const screenPx = Math.round(this.width / 2);
    const screenPy = Math.round(this.height / 2);

    // 1. Auréola de visão ampla e suave ao redor do Detetive (visão 360 do ambiente próximo)
    const radGlow = lCtx.createRadialGradient(screenPx, screenPy, 15, screenPx, screenPy, 150);
    radGlow.addColorStop(0, "rgba(0, 0, 0, 1)");
    radGlow.addColorStop(0.65, "rgba(0, 0, 0, 0.85)");
    radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    lCtx.fillStyle = radGlow;
    lCtx.beginPath();
    lCtx.arc(screenPx, screenPy, 150, 0, Math.PI * 2);
    lCtx.fill();

    // 2. Facho potente e aberto da Lanterna (quando ligada)
    if (GameState.flashlight) {
      let angle = Math.PI / 2; // down
      if (Player.dir === 'up') angle = -Math.PI / 2;
      else if (Player.dir === 'left') angle = Math.PI;
      else if (Player.dir === 'right') angle = 0;

      const beamDist = 380;   // Alcance longo da lanterna
      const beamSpread = 0.65; // Abertura ampla do cone de luz (~75 graus)

      const coneGrad = lCtx.createRadialGradient(screenPx, screenPy, 20, screenPx, screenPy, beamDist);
      coneGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      coneGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.9)");
      coneGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      lCtx.fillStyle = coneGrad;
      lCtx.beginPath();
      lCtx.moveTo(screenPx, screenPy);
      lCtx.arc(screenPx, screenPy, beamDist, angle - beamSpread, angle + beamSpread);
      lCtx.closePath();
      lCtx.fill();
    }

    // 3. Brilho emitido por terminais e máquinas na sala atual
    if (currentRoom) {
      for (const obj of currentRoom.objects) {
        if (obj.type === "terminal" || obj.type === "pod" || obj.type === "stasis_pods") {
          const objScreenX = Math.round(this.width / 2 - Camera.x + obj.x + (obj.w || 30) / 2);
          const objScreenY = Math.round(this.height / 2 - Camera.y + obj.y + (obj.h || 30) / 2);

          const objGlow = lCtx.createRadialGradient(objScreenX, objScreenY, 5, objScreenX, objScreenY, 90);
          objGlow.addColorStop(0, "rgba(0, 0, 0, 0.8)");
          objGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          lCtx.fillStyle = objGlow;
          lCtx.beginPath();
          lCtx.arc(objScreenX, objScreenY, 90, 0, Math.PI * 2);
          lCtx.fill();
        }
      }
    }

    // Restaura blend mode da máscara
    lCtx.globalCompositeOperation = 'source-over';

    // Aplica a máscara escura sobre o jogo principal
    ctx.drawImage(this.lightCanvas, 0, 0);

    // 4. Feixe de luz volumétrico e brilhante da lanterna projetado sobre o chão e paredes
    if (GameState.flashlight) {
      let angle = Math.PI / 2;
      if (Player.dir === 'up') angle = -Math.PI / 2;
      else if (Player.dir === 'left') angle = Math.PI;
      else if (Player.dir === 'right') angle = 0;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beamColorGrad = ctx.createRadialGradient(screenPx, screenPy, 15, screenPx, screenPy, 380);
      beamColorGrad.addColorStop(0, "rgba(254, 243, 199, 0.28)"); // Luz dourada/quente de lanterna
      beamColorGrad.addColorStop(0.4, "rgba(253, 230, 138, 0.16)");
      beamColorGrad.addColorStop(0.8, "rgba(217, 249, 157, 0.06)");
      beamColorGrad.addColorStop(1, "rgba(254, 243, 199, 0)");

      ctx.fillStyle = beamColorGrad;
      ctx.beginPath();
      ctx.moveTo(screenPx, screenPy);
      ctx.arc(screenPx, screenPy, 380, angle - 0.6, angle + 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },

  checkInteractPrompt() {
    const promptEl = document.getElementById("hud-interact-prompt");
    const labelEl = document.getElementById("hud-interact-label");
    if (!GameState.active || GameState.paused) {
      promptEl.classList.add("hidden");
      return;
    }

    // Procura NPC ou objeto próximo
    let found = null;

    for (const npcKey in NPCs) {
      const state = GameState.npcStates[npcKey];
      if (state && state.room === GameState.currentRoomId) {
        if (Math.hypot(Player.x - state.x, Player.y - state.y) < 55) {
          found = `Falar com ${NPCs[npcKey].name}`;
          break;
        }
      }
    }

    if (!found) {
      const room = Rooms[GameState.currentRoomId];
      if (room) {
        for (const obj of room.objects) {
          const cx = obj.x + (obj.w || 30) / 2;
          const cy = obj.y + (obj.h || 30) / 2;
          if (Math.hypot(Player.x - cx, Player.y - cy) < 65) {
            found = `Examinar ${obj.name}`;
            break;
          }
        }
      }
    }

    if (!found) {
      for (const dKey in Doors) {
        const d = Doors[dKey];
        if (d.roomA === GameState.currentRoomId || d.roomB === GameState.currentRoomId) {
          const cx = d.box.x + d.box.w / 2;
          const cy = d.box.y + d.box.h / 2;
          if (Math.hypot(Player.x - cx, Player.y - cy) < 60) {
            found = `Abrir ${d.name}`;
            break;
          }
        }
      }
    }

    if (found) {
      labelEl.textContent = found;
      promptEl.classList.remove("hidden");
    } else {
      promptEl.classList.add("hidden");
    }
  }
};

// ============================================================================
// LOOP PRINCIPAL DO JOGO
// ============================================================================
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (GameState.active) {
    Player.update(dt);
    Camera.update(dt);
  }

  Renderer.render(dt);
  requestAnimationFrame(gameLoop);
}

// Inicialização ao carregar a janela
window.addEventListener("DOMContentLoaded", () => {
  Renderer.init();
  Input.init();
  UI.init();
  requestAnimationFrame(gameLoop);
});
