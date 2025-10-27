// Tab switching
function switchTab(tab) {
  const tabs = ["bukkit", "spigot", "server", "paper", "purpur"];
  tabs.forEach((t) => {
    document.getElementById(`content-${t}`).classList.add("hidden");
    document.getElementById(`tab-${t}`).classList.remove("tab-active");
    document.getElementById(`tab-${t}`).classList.add("tab-inactive");
  });

  document.getElementById(`content-${tab}`).classList.remove("hidden");
  document.getElementById(`tab-${tab}`).classList.add("tab-active");
  document.getElementById(`tab-${tab}`).classList.remove("tab-inactive");

  updatePreview(tab);
}

// Update slider values
function setupSliders() {
  const sliders = [
    { id: "spawn-monsters", display: "monsters-val" },
    { id: "spawn-animals", display: "animals-val" },
    { id: "spawn-water-animals", display: "water-animals-val" },
    { id: "spawn-water-ambient", display: "water-ambient-val" },
    { id: "spawn-water-underground", display: "water-underground-val" },
    { id: "spawn-axolotls", display: "axolotls-val" },
    { id: "spawn-ambient", display: "ambient-val" },
    { id: "tick-monster-spawns", display: "tick-monsters-val" },
    { id: "tick-animal-spawns", display: "tick-animals-val" },
    { id: "tick-water-spawns", display: "tick-water-val" },
    { id: "tick-water-ambient-spawns", display: "tick-water-ambient-val" },
    {
      id: "tick-water-underground-spawns",
      display: "tick-water-underground-val",
    },
    { id: "tick-axolotl-spawns", display: "tick-axolotls-val" },
    { id: "tick-ambient-spawns", display: "tick-ambient-val" },
    { id: "tick-autosave", display: "autosave-val" },
    { id: "ear-animals", display: "ear-animals-val" },
    { id: "ear-monsters", display: "ear-monsters-val" },
    { id: "ear-villagers", display: "ear-villagers-val" },
    { id: "hopper-transfer", display: "hopper-transfer-val" },
    { id: "hopper-check", display: "hopper-check-val" },
    { id: "mob-spawn-range", display: "mob-spawn-range-val" },
    { id: "server-view-distance", display: "server-view-val" },
    { id: "server-sim-distance", display: "server-sim-val" },
    { id: "max-players", display: "max-players-val" },
    { id: "network-compression-threshold", display: "network-compression-val" },
    { id: "delay-chunk-unloads", display: "delay-unload-val" },
    { id: "max-auto-save", display: "max-save-val" },
    { id: "despawn-soft", display: "despawn-soft-val" },
    { id: "despawn-hard", display: "despawn-hard-val" },
    { id: "non-player-arrow-despawn", display: "non-player-arrow-val" },
    { id: "creative-arrow-despawn", display: "creative-arrow-val" },
    { id: "despawn-cobblestone", display: "despawn-cobblestone-val" },
    { id: "despawn-netherrack", display: "despawn-netherrack-val" },
    { id: "despawn-sand", display: "despawn-sand-val" },
    { id: "xray-height", display: "xray-height-val" },
  ];

  sliders.forEach((slider) => {
    const element = document.getElementById(slider.id);
    const display = document.getElementById(slider.display);

    element.addEventListener("input", function () {
      display.textContent = this.value;
      updateAllPreviews();
    });
  });

  // Setup change listeners for other inputs
  const allInputs = document.querySelectorAll("input, select");
  allInputs.forEach((input) => {
    input.addEventListener("change", updateAllPreviews);
  });
}

function updateAllPreviews() {
  const tabs = ["bukkit", "spigot", "server", "paper", "purpur"];
  tabs.forEach((tab) => updatePreview(tab));
}

function updatePreview(tab) {
  let preview = "";

  switch (tab) {
    case "bukkit":
      preview = generateBukkitConfig();
      break;
    case "spigot":
      preview = generateSpigotConfig();
      break;
    case "server":
      preview = generateServerConfig();
      break;
    case "paper":
      preview = generatePaperConfig();
      break;
    case "purpur":
      preview = generatePurpurConfig();
      break;
  }

  document.getElementById(`${tab}-preview`).textContent = preview;
}

function generateBukkitConfig() {
  const allowEnd = document.getElementById("allow-end").checked;
  const monsters = document.getElementById("spawn-monsters").value;
  const animals = document.getElementById("spawn-animals").value;
  const waterAnimals = document.getElementById("spawn-water-animals").value;
  const waterAmbient = document.getElementById("spawn-water-ambient").value;
  const waterUnderground = document.getElementById(
    "spawn-water-underground"
  ).value;
  const axolotls = document.getElementById("spawn-axolotls").value;
  const ambient = document.getElementById("spawn-ambient").value;
  const tickMonsters = document.getElementById("tick-monster-spawns").value;
  const tickAnimals = document.getElementById("tick-animal-spawns").value;
  const tickWater = document.getElementById("tick-water-spawns").value;
  const tickWaterAmbient = document.getElementById(
    "tick-water-ambient-spawns"
  ).value;
  const tickWaterUnderground = document.getElementById(
    "tick-water-underground-spawns"
  ).value;
  const tickAxolotls = document.getElementById("tick-axolotl-spawns").value;
  const tickAmbient = document.getElementById("tick-ambient-spawns").value;
  const autosave = document.getElementById("tick-autosave").value;

  return `settings:
  allow-end: ${allowEnd}
  warn-on-overload: true
  permissions-file: permissions.yml
  update-folder: update
  plugin-profiling: false
  connection-throttle: 4000
  query-plugins: true
  deprecated-verbose: default
  shutdown-message: Server closed
  minimum-api: none
  use-map-color-cache: true
spawn-limits:
  monsters: ${monsters}
  animals: ${animals}
  water-animals: ${waterAnimals}
  water-ambient: ${waterAmbient}
  water-underground-creature: ${waterUnderground}
  axolotls: ${axolotls}
  ambient: ${ambient}
chunk-gc:
  period-in-ticks: 600
ticks-per:
  monster-spawns: ${tickMonsters}
  animal-spawns: ${tickAnimals}
  water-spawns: ${tickWater}
  water-ambient-spawns: ${tickWaterAmbient}
  water-underground-creature-spawns: ${tickWaterUnderground}
  axolotl-spawns: ${tickAxolotls}
  ambient-spawns: ${tickAmbient}
  autosave: ${autosave}
aliases: now-in-commands.yml`;
}

function generateSpigotConfig() {
  const viewDistance = document.getElementById("spigot-view-distance").value;
  const simDistance = document.getElementById("spigot-sim-distance").value;
  const earAnimals = document.getElementById("ear-animals").value;
  const earMonsters = document.getElementById("ear-monsters").value;
  const earVillagers = document.getElementById("ear-villagers").value;
  const tickInactive = document.getElementById(
    "tick-inactive-villagers"
  ).checked;
  const nerfSpawner = document.getElementById("nerf-spawner-mobs").checked;
  const hopperTransfer = document.getElementById("hopper-transfer").value;
  const hopperCheck = document.getElementById("hopper-check").value;
  const mobSpawnRange = document.getElementById("mob-spawn-range").value;

  return `settings:
  debug: false
  sample-count: 12
  bungeecord: false
  timeout-time: 60
  restart-on-crash: true
  restart-script: ./start.sh
  log-villager-deaths: true
  log-named-deaths: true
  save-user-cache-on-stop-only: false
  moved-wrongly-threshold: 0.0625
  moved-too-quickly-multiplier: 10.0
  player-shuffle: 0
  user-cache-size: 1000
  netty-threads: 4
world-settings:
  default:
    nerf-spawner-mobs: ${nerfSpawner}
    mob-spawn-range: ${mobSpawnRange}
    entity-activation-range:
      animals: ${earAnimals}
      monsters: ${earMonsters}
      raiders: 48
      misc: 8
      water: 8
      villagers: ${earVillagers}
      flying-monsters: 32
    entity-tracking-range:
      players: 48
      animals: 48
      monsters: 48
      misc: 32
      display: 64
      other: 64
    ticks-per:
      hopper-transfer: ${hopperTransfer}
      hopper-check: ${hopperCheck}
    merge-radius:
      item: 3.5
      exp: 4.0
    simulation-distance: ${simDistance}
    view-distance: ${viewDistance}
config-version: 12`;
}

function generateServerConfig() {
  const viewDistance = document.getElementById("server-view-distance").value;
  const simDistance = document.getElementById("server-sim-distance").value;
  const maxPlayers = document.getElementById("max-players").value;
  const difficulty = document.getElementById("difficulty").value;
  const gamemode = document.getElementById("gamemode").value;
  const pvp = document.getElementById("pvp").checked;
  const hardcore = document.getElementById("hardcore").checked;
  const motd = document.getElementById("motd").value;
  const port = document.getElementById("server-port").value;
  const networkCompression = document.getElementById(
    "network-compression-threshold"
  ).value;
  const syncChunkWrites = document.getElementById("sync-chunk-writes").checked;
  const allowNether = document.getElementById("allow-nether").checked;
  const spawnAnimals = document.getElementById("spawn-animals-server").checked;
  const spawnMonsters = document.getElementById(
    "spawn-monsters-server"
  ).checked;
  const spawnNpcs = document.getElementById("spawn-npcs").checked;
  const generateStructures = document.getElementById(
    "generate-structures"
  ).checked;

  return `accepts-transfers=false
allow-flight=false
allow-nether=${allowNether}
broadcast-console-to-ops=true
broadcast-rcon-to-ops=true
bug-report-link=
debug=false
difficulty=${difficulty}
enable-command-block=false
enable-jmx-monitoring=false
enable-query=false
enable-rcon=false
enable-status=true
enforce-secure-profile=true
enforce-whitelist=false
entity-broadcast-range-percentage=100
force-gamemode=false
function-permission-level=2
gamemode=${gamemode}
generate-structures=${generateStructures}
generator-settings={}
hardcore=${hardcore}
hide-online-players=false
initial-disabled-packs=
initial-enabled-packs=vanilla
level-name=world
level-seed=
level-type=default
log-ips=true
max-build-height=256
max-chained-neighbor-updates=1000000
max-players=${maxPlayers}
max-tick-time=60000
max-world-size=29999984
motd=${motd}
network-compression-threshold=${networkCompression}
online-mode=false
op-permission-level=4
pause-when-empty-seconds=-1
player-idle-timeout=0
prevent-proxy-connections=false
pvp=${pvp}
query.port=${port}
rate-limit=0
rcon.password=
rcon.port=25570
region-file-compression=deflate
require-resource-pack=false
resource-pack=
resource-pack-id=
resource-pack-prompt=
resource-pack-sha1=
server-ip=
server-port=${port}
simulation-distance=${simDistance}
snooper-enabled=true
spawn-animals=${spawnAnimals}
spawn-monsters=${spawnMonsters}
spawn-npcs=${spawnNpcs}
spawn-protection=16
sync-chunk-writes=${syncChunkWrites}
text-filtering-config=
text-filtering-version=0
use-native-transport=true
view-distance=${viewDistance}
white-list=false`;
}

function generatePaperConfig() {
  const delayUnload = document.getElementById("delay-chunk-unloads").value;
  const maxSave = document.getElementById("max-auto-save").value;
  const preventUnloaded = document.getElementById("prevent-unloaded").checked;
  const softRange = document.getElementById("despawn-soft").value;
  const hardRange = document.getElementById("despawn-hard").value;
  const antiXray = document.getElementById("anti-xray").checked;
  const xrayEngine = document.getElementById("xray-engine").value;
  const xrayHeight = document.getElementById("xray-height").value;
  const optimizeExplosions = document.getElementById(
    "optimize-explosions"
  ).checked;
  const nonPlayerArrow = document.getElementById(
    "non-player-arrow-despawn"
  ).value;
  const creativeArrow = document.getElementById("creative-arrow-despawn").value;
  const despawnCobblestone = document.getElementById(
    "despawn-cobblestone"
  ).value;
  const despawnNetherrack = document.getElementById("despawn-netherrack").value;
  const despawnSand = document.getElementById("despawn-sand").value;

  return `_version: 31
chunks:
  auto-save-interval: default
  delay-chunk-unloads-by: ${delayUnload}s
  entity-per-chunk-save-limit:
    area_effect_cloud: 8
    arrow: 16
    breeze_wind_charge: 8
    dragon_fireball: 3
    egg: 8
    ender_pearl: 8
    experience_bottle: 3
    experience_orb: 16
    eye_of_ender: 8
    fireball: 8
    firework_rocket: 8
    llama_spit: 3
    splash_potion: 8
    lingering_potion: 8
    shulker_bullet: 8
    small_fireball: 8
    snowball: 8
    spectral_arrow: 16
    trident: 16
    wind_charge: 8
    wither_skull: 4
  fixed-chunk-inhabited-time: -1
  max-auto-save-chunks-per-tick: ${maxSave}
  prevent-moving-into-unloaded-chunks: ${preventUnloaded}
despawn-ranges:
  ambient:
    hard: ${hardRange}
    soft: ${softRange}
  axolotls:
    hard: ${hardRange}
    soft: ${softRange}
  creature:
    hard: ${hardRange}
    soft: ${softRange}
  misc:
    hard: ${hardRange}
    soft: ${softRange}
  monster:
    hard: ${hardRange}
    soft: ${softRange}
  underground_water_creature:
    hard: ${hardRange}
    soft: ${softRange}
  water_ambient:
    hard: ${hardRange}
    soft: ${softRange}
  water_creature:
    hard: ${hardRange}
    soft: ${softRange}
anticheat:
  anti-xray:
    enabled: ${antiXray}
    engine-mode: ${xrayEngine}
    hidden-blocks:
    - copper_ore
    - deepslate_copper_ore
    - gold_ore
    - deepslate_gold_ore
    - iron_ore
    - deepslate_iron_ore
    - coal_ore
    - deepslate_coal_ore
    - lapis_ore
    - deepslate_lapis_ore
    - mossy_cobblestone
    - obsidian
    - chest
    - diamond_ore
    - deepslate_diamond_ore
    - redstone_ore
    - deepslate_redstone_ore
    - clay
    - emerald_ore
    - deepslate_emerald_ore
    - ender_chest
    lava-obscures: false
    max-block-height: ${xrayHeight}
    replacement-blocks:
    - stone
    - oak_planks
    - deepslate
    update-radius: 2
    use-permission: false
misc:
  optimize-explosions: ${optimizeExplosions}
  non-player-arrow-despawn-rate: ${nonPlayerArrow}
  creative-arrow-despawn-rate: ${creativeArrow}
alt-item-despawn-rate:
  enabled: true
  items:
    cobblestone: ${despawnCobblestone}
    netherrack: ${despawnNetherrack}
    sand: ${despawnSand}`;
}

function generatePurpurConfig() {
  const useAlternateKeepalive = document.getElementById(
    "use-alternate-keepalive"
  ).checked;
  const disableDolphinTreasure =
    document.getElementById("dolphin-treasure").checked;
  const teleportOutsideBorder = document.getElementById(
    "teleport-outside-border"
  ).checked;

  return `settings:
  use-alternate-keepalive: ${useAlternateKeepalive}
dolphin:
  disable-treasure-searching: ${disableDolphinTreasure}
world:
  teleport-if-outside-border: ${teleportOutsideBorder}`;
}

function downloadConfig(type) {
  let content = "";
  let filename = "";

  switch (type) {
    case "bukkit":
      content = generateBukkitConfig();
      filename = "bukkit.yml";
      break;
    case "spigot":
      content = generateSpigotConfig();
      filename = "spigot.yml";
      break;
    case "server":
      content = generateServerConfig();
      filename = "server.properties";
      break;
    case "paper":
      content = generatePaperConfig();
      filename = "paper-world.yml";
      break;
    case "purpur":
      content = generatePurpurConfig();
      filename = "purpur.yml";
      break;
  }

  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function getCurrentTab() {
  const tabs = ["bukkit", "spigot", "server", "paper", "purpur"];
  for (const tab of tabs) {
    if (
      !document.getElementById(`content-${tab}`).classList.contains("hidden")
    ) {
      return tab;
    }
  }
  return "bukkit"; // Fallback to bukkit if no tab is active
}

function downloadAll() {
  downloadConfig("bukkit");
  setTimeout(() => downloadConfig("spigot"), 200);
  setTimeout(() => downloadConfig("server"), 400);
  setTimeout(() => downloadConfig("paper"), 600);
  setTimeout(() => downloadConfig("purpur"), 800);
}

function resetDefaults() {
  if (
    confirm("Are you sure you want to reset all settings to default values?")
  ) {
    // Bukkit defaults
    document.getElementById("allow-end").checked = true;
    document.getElementById("spawn-monsters").value = 20;
    document.getElementById("spawn-animals").value = 5;
    document.getElementById("spawn-water-animals").value = 2;
    document.getElementById("spawn-water-ambient").value = 2;
    document.getElementById("spawn-water-underground").value = 3;
    document.getElementById("spawn-axolotls").value = 3;
    document.getElementById("spawn-ambient").value = 1;
    document.getElementById("tick-monster-spawns").value = 10;
    document.getElementById("tick-animal-spawns").value = 400;
    document.getElementById("tick-water-spawns").value = 400;
    document.getElementById("tick-water-ambient-spawns").value = 400;
    document.getElementById("tick-water-underground-spawns").value = 400;
    document.getElementById("tick-axolotl-spawns").value = 400;
    document.getElementById("tick-ambient-spawns").value = 400;
    document.getElementById("tick-autosave").value = 6000;

    // Spigot defaults
    document.getElementById("spigot-view-distance").value = "default";
    document.getElementById("spigot-sim-distance").value = "default";
    document.getElementById("ear-animals").value = 16;
    document.getElementById("ear-monsters").value = 24;
    document.getElementById("ear-villagers").value = 16;
    document.getElementById("tick-inactive-villagers").checked = false;
    document.getElementById("nerf-spawner-mobs").checked = true;
    document.getElementById("hopper-transfer").value = 8;
    document.getElementById("hopper-check").value = 8;
    document.getElementById("mob-spawn-range").value = 3;

    // Server defaults
    document.getElementById("server-view-distance").value = 7;
    document.getElementById("server-sim-distance").value = 4;
    document.getElementById("max-players").value = 50;
    document.getElementById("difficulty").value = "normal";
    document.getElementById("gamemode").value = "survival";
    document.getElementById("pvp").checked = true;
    document.getElementById("hardcore").checked = false;
    document.getElementById("motd").value = "Kohinoor Hira";
    document.getElementById("server-port").value = 25565;
    document.getElementById("network-compression-threshold").value = 256;
    document.getElementById("sync-chunk-writes").checked = true;
    document.getElementById("allow-nether").checked = true;
    document.getElementById("spawn-animals-server").checked = true;
    document.getElementById("spawn-monsters-server").checked = true;
    document.getElementById("spawn-npcs").checked = true;
    document.getElementById("generate-structures").checked = true;

    // Paper defaults
    document.getElementById("delay-chunk-unloads").value = 10;
    document.getElementById("max-auto-save").value = 8;
    document.getElementById("prevent-unloaded").checked = true;
    document.getElementById("despawn-soft").value = 30;
    document.getElementById("despawn-hard").value = 72;
    document.getElementById("anti-xray").checked = true;
    document.getElementById("xray-engine").value = "1";
    document.getElementById("xray-height").value = 64;
    document.getElementById("optimize-explosions").checked = true;
    document.getElementById("non-player-arrow-despawn").value = 20;
    document.getElementById("creative-arrow-despawn").value = 20;
    document.getElementById("despawn-cobblestone").value = 300;
    document.getElementById("despawn-netherrack").value = 300;
    document.getElementById("despawn-sand").value = 300;

    // Purpur defaults
    document.getElementById("use-alternate-keepalive").checked = true;
    document.getElementById("dolphin-treasure").checked = true;
    document.getElementById("teleport-outside-border").checked = true;

    // Update all displays
    document.getElementById("monsters-val").textContent = "20";
    document.getElementById("animals-val").textContent = "5";
    document.getElementById("water-animals-val").textContent = "2";
    document.getElementById("water-ambient-val").textContent = "2";
    document.getElementById("water-underground-val").textContent = "3";
    document.getElementById("axolotls-val").textContent = "3";
    document.getElementById("ambient-val").textContent = "1";
    document.getElementById("tick-monsters-val").textContent = "10";
    document.getElementById("tick-animals-val").textContent = "400";
    document.getElementById("tick-water-val").textContent = "400";
    document.getElementById("tick-water-ambient-val").textContent = "400";
    document.getElementById("tick-water-underground-val").textContent = "400";
    document.getElementById("tick-axolotls-val").textContent = "400";
    document.getElementById("tick-ambient-val").textContent = "400";
    document.getElementById("autosave-val").textContent = "6000";
    document.getElementById("ear-animals-val").textContent = "16";
    document.getElementById("ear-monsters-val").textContent = "24";
    document.getElementById("ear-villagers-val").textContent = "16";
    document.getElementById("hopper-transfer-val").textContent = "8";
    document.getElementById("hopper-check-val").textContent = "8";
    document.getElementById("mob-spawn-range-val").textContent = "3";
    document.getElementById("server-view-val").textContent = "7";
    document.getElementById("server-sim-val").textContent = "4";
    document.getElementById("max-players-val").textContent = "50";
    document.getElementById("network-compression-val").textContent = "256";
    document.getElementById("delay-unload-val").textContent = "10";
    document.getElementById("max-save-val").textContent = "8";
    document.getElementById("despawn-soft-val").textContent = "30";
    document.getElementById("despawn-hard-val").textContent = "72";
    document.getElementById("non-player-arrow-val").textContent = "20";
    document.getElementById("creative-arrow-val").textContent = "20";
    document.getElementById("despawn-cobblestone-val").textContent = "300";
    document.getElementById("despawn-netherrack-val").textContent = "300";
    document.getElementById("despawn-sand-val").textContent = "300";
    document.getElementById("xray-height-val").textContent = "64";

    updateAllPreviews();
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  setupSliders();
  updateAllPreviews();
});
