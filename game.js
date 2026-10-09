// PokéSpawner Game Logic

const POKEMON_DATA = {
  // Base Pokémon with their stats
  bulbasaur: { name: "Bulbasaur", type: ["Grass", "Poison"], baseStats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 } },
  ivysaur: { name: "Ivysaur", type: ["Grass", "Poison"], baseStats: { hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 } },
  Venusaur: { name: "Venusaur", type: ["Grass", "Poison"], baseStats: { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 } },
  charmander: { name: "Charmander", type: ["Fire"], baseStats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 } },
  charmeleon: { name: "Charmeleon", type: ["Fire"], baseStats: { hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 } },
  charizard: { name: "Charizard", type: ["Fire", "Flying"], baseStats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 } },
  squirtle: { name: "Squirtle", type: ["Water"], baseStats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 } },
  wartortle: { name: "Wartortle", type: ["Water"], baseStats: { hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 } },
  blastoise: { name: "Blastoise", type: ["Water"], baseStats: { hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 } },
  caterpie: { name: "Caterpie", type: ["Bug"], baseStats: { hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 } },
  metapod: { name: "Metapod", type: ["Bug"], baseStats: { hp: 50, attack: 20, defense: 55, spAttack: 25, spDefense: 25, speed: 30 } },
  butterfree: { name: "Butterfree", type: ["Bug", "Flying"], baseStats: { hp: 60, attack: 45, defense: 50, spAttack: 90, spDefense: 80, speed: 70 } },
  weedle: { name: "Weedle", type: ["Bug", "Poison"], baseStats: { hp: 40, attack: 35, defense: 30, spAttack: 25, spDefense: 25, speed: 50 } },
  kakuna: { name: "Kakuna", type: ["Bug", "Poison"], baseStats: { hp: 45, attack: 25, defense: 50, spAttack: 30, spDefense: 30, speed: 35 } },
  beedrill: { name: "Beedrill", type: ["Bug", "Poison"], baseStats: { hp: 65, attack: 75, defense: 40, spAttack: 45, spDefense: 80, speed: 75 } }
};

// Pokémon spawn pool (randomly weighted)
const SPAWN_POOL = [
  { id: "bulbasaur", weight: 10 },
  { id: "ivysaur", weight: 8 },
  { id: "venusaur", weight: 5 },
  { id: "charmander", weight: 10 },
  { id: "charmeleon", weight: 8 },
  { id: "charizard", weight: 5 },
  { id: "squirtle", weight: 10 },
  { id: "wartortle", weight: 8 },
  { id: "blastoise", weight: 5 },
  { id: "caterpie", weight: 10 },
  { id: "metapod", weight: 8 },
  { id: "butterfree", weight: 5 },
  { id: "weedle", weight: 10 },
  { id: "kakuna", weight: 8 },
  { id: "beedrill", weight: 5 }
];

// Player state
const player = {
  name: "Amish",
  pokemon: [],
  tokens: 100
};

// Admin command secret
const ADMIN_SECRET = "PokeSpawnerAdmin";

// DOM elements
const pokemonDisplay = document.getElementById("pokemon-display");
const pokemonListContainer = document.getElementById("pokemon-list-container");
const spawnBtn = document.getElementById("spawn-btn");
const catchBtn = document.getElementById("catch-btn");
const manageBtn = document.getElementById("manage-btn");
const adminModal = document.getElementById("admin-modal");
const adminCommand = document.getElementById("admin-command");
const adminSubmit = document.getElementById("admin-submit");
const adminHint = document.getElementById("admin-hint");
const adminOutput = document.getElementById("admin-output");
const tradeBtn = document.getElementById("trade-btn");
const discordBtn = document.getElementById("discord-btn");

// Initialize
function init() {
  adminHint.textContent = ADMIN_SECRET;
  renderPokemonList();
  addEventListeners();
}

// Generate a random Pokémon
function spawnRandomPokemon() {
  // Weighted random selection
  const totalWeight = SPAWN_POOL.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  let selected = SPAWN_POOL[0];

  for (const p of SPAWN_POOL) {
    random -= p.weight;
    if (random <= 0) {
      selected = p;
      break;
    }
  }

  const data = POKEMON_DATA[selected.id];
  if (!data) return;

  // Add some random variation (10-15% variance)
  const statVariance = 0.10 + Math.random() * 0.05;
  const paddedStats = {
    hp: Math.round(data.baseStats.hp * (1 + (Math.random() - 0.5) * statVariance)),
    attack: Math.round(data.baseStats.attack * (1 + (Math.random() - 0.5) * statVariance)),
    defense: Math.round(data.baseStats.defense * (1 + (Math.random() - 0.5) * statVariance)),
    spAttack: Math.round(data.baseStats.spAttack * (1 + (Math.random() - 0.5) * statVariance)),
    spDefense: Math.round(data.baseStats.spDefense * (1 + (Math.random() - 0.5) * statVariance)),
    speed: Math.round(data.baseStats.speed * (1 + (Math.random() - 0.5) * statVariance))
  };

  // Ensure stats are at least 10
  Object.values(paddedStats).forEach(s => { if (s < 10) s = 10; });

  const pokemon = {
    id: selected.id,
    name: data.name,
    type: data.type,
    stats: paddedStats,
    level: 5 + Math.floor(Math.random() * 15),
    caught: false,
    rarity: Math.random() < 0.1 ? "Legendary" : "Common"
  };

  player.pokemon.push(pokemon);
  renderPokemonDisplay(pokemon);
  renderPokemonList();
  return pokemon;
}

// Render a single pokemon card
function renderPokemonDisplay(pokemon) {
  const container = document.getElementById("pokemon-display");
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.id = `pokemon-${pokemon.id}`;

  const typeColors = {
    "Grass": "#77dd77",
    "Fire": "#ff6600",
    "Water": "#3399ff",
    "Bug": "#aaffaa",
    "Poison": "#aa88ff",
    "Flying": "#aaccff"
  };

  const typeColor = typeColors[pokemon.type[0]] || "#888";
  card.style.borderColor = typeColor;

  card.innerHTML = `
    <div style="color:${typeColor};font-size:2em;margin-bottom:10px;">
      ${getPokemonIcon(pokemon.id)}
    </div>
    <div class="name">${pokemon.name}</div>
    <div class="stats">
      HP: <strong>${pokemon.stats.hp}</strong> | ATK: <strong>${pokemon.stats.attack}</strong> | DEF: <strong>${pokemon.stats.defense}</strong><br>
      SpATK: <strong>${pokemon.stats.spAttack}</strong> | SpDEF: <strong>${pokemon.stats.spDefense}</strong> | SPEED: <strong>${pokemon.stats.speed}</strong>
    </div>
    <div style="margin-top:10px;font-size:0.8em;">
      Level ${pokemon.level} • ${pokemon.rarity}
    </div>
  `;

  container.appendChild(card);
}

// Get a simple emoji icon for each pokemon
function getPokemonIcon(id) {
  const icons = {
    bulbasaur: "🌱", ivysaur: "🌱", Venusaur: "🌱",
    charmander: "🔥", charmeleon: "🔥", charizard: "🔥",
    squirtle: "💧", wartortle: "💧", blastoise: "💧",
    caterpie: "🐛", metapod: "🐛", butterfly: "🦋",
    weedle: "🐛", kakuna: "🐛", beedrill: "🜁"
  };
  return icons[id] || "🦄";
}

// Render the player's pokemon list
function renderPokemonList() {
  const list = player.pokemon;
  pokemonListContainer.innerHTML = "";

  if (list.length === 0) {
    pokemonListContainer.innerHTML = "<li>No Pokémon yet. Click 'Spawn Random Pokémon'!</li>";
    return;
  }

  list.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="pokemon-name">${p.name}</span>
      <span class="pokemon-level">Lv ${p.level} • ${p.stats.hp}/${p.stats.attack}/${p.stats.defense}</span>
      <button onclick="catchPokemon('${p.id}')">${p.caught ? "Released" : "Catch"}</button>
    `;
    pokemonListContainer.appendChild(li);
  });
}

// Catch a pokemon
function catchPokemon(id) {
  const pokemon = player.pokemon.find(p => p.id === id);
  if (!pokemon) return;

  if (pokemon.caught) {
    // Release
    player.pokemon = player.pokemon.filter(p => p.id !== id);
    renderPokemonList();
    alert(`Released ${pokemon.name}!`);
  } else {
    // Catch - simulate catching
    alert(`Caught ${pokemon.name}!`);
    pokemon.caught = true;
    renderPokemonList();
  }
}

// Admin command
function execAdminCommand(command) {
  const parts = command.toLowerCase().split(" ");
  if (parts[0] === "spawn" && parts[1]) {
    const pokemonId = parts[1];
    const data = POKEMON_DATA[pokemonId];

    if (!data) {
      showAdminOutput(`Unknown Pokémon: ${pokemonId}`, "error");
      return;
    }

    // Perfect stats (base stats + 50%)
    const perfectStats = {
      hp: Math.round(data.baseStats.hp * 1.5),
      attack: Math.round(data.baseStats.attack * 1.5),
      defense: Math.round(data.baseStats.defense * 1.5),
      spAttack: Math.round(data.baseStats.spAttack * 1.5),
      spDefense: Math.round(data.baseStats.spDefense * 1.5),
      speed: Math.round(data.baseStats.speed * 1.5)
    };

    const pokemon = {
      id: pokemonId,
      name: data.name,
      type: data.type,
      stats: perfectStats,
      level: 100,
      caught: false,
      rarity: "Legendary"
    };

    player.pokemon.push(pokemon);
    renderPokemonDisplay(pokemon);
    renderPokemonList();
    showAdminOutput(`✨ Spawned ${data.name} with PERFECT stats! (Level 100, +50% stats)`, "success");
    return pokemon;
  }

  showAdminOutput(`Unknown command: ${command}`, "error");
}

function showAdminOutput(message, type) {
  adminOutput.innerHTML = `<div class="${type}">${message}</div>`;
}

// Event listeners
function addEventListeners() {
  spawnBtn.addEventListener("click", () => {
    spawnRandomPokemon();
  });

  catchBtn.addEventListener("click", () => {
    if (player.pokemon.length === 0) {
      alert("No Pokémon to catch! Spawn one first.");
      return;
    }
    // Catch the last spawned pokemon
    catchPokemon(player.pokemon[player.pokemon.length - 1].id);
  });

  manageBtn.addEventListener("click", () => {
    adminModal.style.display = "flex";
  });

  adminSubmit.addEventListener("click", () => {
    const command = adminCommand.value.trim();
    if (!command) return;
    execAdminCommand(command);
    adminCommand.value = "";
  });

  adminCommand.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      adminSubmit.click();
    }
  });

  tradeBtn.addEventListener("click", () => {
    alert("Trade feature coming soon!");
  });

  discordBtn.addEventListener("click", () => {
    window.open("https://discord.gg/poketwo", "_blank");
  });

  // Close modal on click outside
  window.addEventListener("click", (e) => {
    if (e.target === adminModal) {
      adminModal.style.display = "none";
    }
  });
}

// Start the game
init();
