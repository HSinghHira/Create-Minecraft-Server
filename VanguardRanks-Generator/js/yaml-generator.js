// YAML Generation
import { state } from "./state.js";

export function generateYAML() {
  if (state.ranks.length === 0) {
    return "# Add or select a rank to see preview\n# Your ranks will appear here";
  }

  let yaml = "";
  state.ranks.forEach((rank) => {
    yaml += `${rank.name}:\n`;
    yaml += `  prefix: "${rank.prefix}"\n`;
    yaml += `  display_name: '${rank.display_name}'\n`;
    yaml += `  icon: ${rank.icon}\n`;
    yaml += `  icon_amount: ${rank.icon_amount}\n`;
    yaml += `  icon_model_data: ${rank.icon_model_data}\n`;

    if (rank.requirements && rank.requirements.length > 0) {
      yaml += `  requirements:\n`;
      rank.requirements.forEach((req) => {
        const key = Object.keys(req)[0];
        const data = req[key];
        yaml += `    '${key}':\n`;
        yaml += `      type: ${data.type}\n`;
        yaml += `      eval: ${data.eval}\n`;
        yaml += `      value: ${data.value}\n`;
        if (data.gui_message)
          yaml += `      gui_message: '${data.gui_message}'\n`;
        if (data.deny_message)
          yaml += `      deny_message: '${data.deny_message}'\n`;
      });
    }

    if (rank.lore && rank.lore.length > 0) {
      yaml += `  lore:\n`;
      rank.lore.forEach((line) => {
        yaml += `  - '${line}'\n`;
      });
    }

    if (rank.commands && rank.commands.length > 0) {
      yaml += `  commands:\n`;
      rank.commands.forEach((cmd) => {
        yaml += `  - '${cmd}'\n`;
      });
    }
    yaml += "\n";
  });
  return yaml.trim();
}

export function downloadYAML() {
  if (state.ranks.length === 0) {
    return null;
  }
  const yaml = generateYAML();
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  return { url, filename: "ranks.yml" };
}
