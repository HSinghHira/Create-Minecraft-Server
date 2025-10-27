// Skript Generation
import { state } from "./state.js";

export function generateSkript() {
  const date = new Date().toLocaleDateString();
  let skript = `# =====================================
# VanguardRanks - LuckPerms Setup Script
# =====================================
# Generated: ${date}
# Total Ranks: ${state.ranks.length}
# Generated at: https://git.hsinghhira.me/VanguardRanks-Generator/
# 
# INSTALLATION:
# 1. Place this file in /plugins/Skript/scripts/
# 2. Run /sk reload installranks (or restart server)
# 3. Execute /installranks in-game (requires admin permission)
# 4. To remove all ranks: /uninstallranks
# =====================================

command /installranks:
\tpermission: admin.vanguardranks
\tpermission message: &c⚠️ You don't have permission to install ranks!
\taliases: /setupranks, /vginstall
\ttrigger:
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&6⚔️ VanguardRanks &8| &aLuckPerms Installation" to player
\t\tsend "&7Installing &e${state.ranks.length} &7rank group(s)..." to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "" to player
\t\t
\t\t# Create default group if it doesn't exist
\t\tsend "&7[0/${state.ranks.length + 1}] &fChecking default group..." to player
\t\texecute console command "/lp creategroup default"
\t\texecute console command "/lp group default setweight 0"
\t\texecute console command "/lp group default displayname &7Member"
\t\texecute console command "/lp group default meta setprefix 1 ""&#FFFFFF[Member]&r """
\t\twait 2 ticks
\t\t
`;

  state.ranks.forEach((rank, index) => {
    const weight = rank.luckperms?.weight || index + 1;
    const displayName = rank.display_name || rank.name;
    const prefix = rank.prefix || `[${rank.name}]`;
    const permissions = rank.luckperms?.permissions || [];
    const inheritPrevious = rank.luckperms?.inheritPrevious !== false;

    skript += `\t\t# ===== RANK ${
      index + 1
    }: ${rank.name.toUpperCase()} =====\n`;
    skript += `\t\tsend "&7[${index + 1}/${
      state.ranks.length + 1
    }] &fCreating rank: &e${displayName}" to player\n`;
    skript += `\t\texecute console command "/lp creategroup ${rank.name}"\n`;
    skript += `\t\texecute console command "/lp group ${rank.name} setweight ${weight}"\n`;
    skript += `\t\texecute console command "/lp group ${rank.name} displayname ""${displayName}"""\n`;
    skript += `\t\texecute console command "/lp group ${rank.name} meta setprefix ${weight} ""${prefix} """\n`;

    if (inheritPrevious && index > 0) {
      const previousRank = state.ranks[index - 1];
      skript += `\t\texecute console command "/lp group ${rank.name} parent add ${previousRank.name}"\n`;
    } else if (index === 0) {
      skript += `\t\texecute console command "/lp group ${rank.name} parent add default"\n`;
    }

    if (permissions.length > 0) {
      permissions.forEach((perm) => {
        if (perm.trim()) {
          skript += `\t\texecute console command "/lp group ${rank.name} permission set ${perm} true"\n`;
        }
      });
    }

    skript += `\t\twait 2 ticks\n`;
    skript += `\t\t\n`;
  });

  skript += `\t\tsend "" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&a✓ Installation Complete!" to player
\t\tsend "&7Ranks created: &e${state.ranks.length}" to player
\t\tsend "" to player
\t\tsend "&7To assign ranks to players:" to player
\t\tsend "&f/lp user <player> parent set <rank>" to player
\t\tsend "" to player
\t\tsend "&7Example: &f/lp user Harman parent set ${
    state.ranks[0]?.name || "rookie"
  }" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player

command /uninstallranks:
\tpermission: admin.vanguardranks
\tpermission message: &c⚠️ You don't have permission to uninstall ranks!
\taliases: /removeranks, /vguninstall
\ttrigger:
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&6⚔️ VanguardRanks &8| &cRank Removal" to player
\t\tsend "&7Removing &e${state.ranks.length} &7rank group(s)..." to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "" to player
\t\t
`;

  state.ranks.forEach((rank, index) => {
    skript += `\t\tsend "&7[${index + 1}/${state.ranks.length}] &fRemoving: &e${
      rank.display_name || rank.name
    }" to player\n`;
    skript += `\t\texecute console command "/lp deletegroup ${rank.name}"\n`;
    skript += `\t\twait 1 tick\n`;
  });

  skript += `\t\t
\t\tsend "" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&a✓ All ranks removed successfully!" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player

command /ranksinfo:
\tpermission: admin.vanguardranks
\tpermission message: &c⚠️ You don't have permission!
\taliases: /vginfo
\ttrigger:
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "&6⚔️ VanguardRanks &8| &bRanks Information" to player
\t\tsend "&7Total Ranks: &e${state.ranks.length}" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
\t\tsend "" to player
`;

  state.ranks.forEach((rank, index) => {
    const weight = rank.luckperms?.weight || index + 1;
    const permCount = rank.luckperms?.permissions?.length || 0;
    skript += `\t\tsend "&e${index + 1}. &f${
      rank.display_name || rank.name
    } &8(&7${rank.name}&8)" to player\n`;
    skript += `\t\tsend "   &7Weight: &a${weight} &8| &7Permissions: &a${permCount}" to player\n`;
  });

  skript += `\t\tsend "" to player
\t\tsend "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" to player
`;

  return skript;
}

export function downloadSkript() {
  if (state.ranks.length === 0) {
    return null;
  }
  const skript = generateSkript();
  const blob = new Blob([skript], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  return { url, filename: "installranks.sk" };
}
