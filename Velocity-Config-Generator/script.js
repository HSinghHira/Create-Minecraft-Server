// ============================================
// DATA STRUCTURES
// ============================================
let servers = [
    { name: 'lobby', address: '127.0.0.1:30066' },
    { name: 'factions', address: '127.0.0.1:30067' },
    { name: 'minigames', address: '127.0.0.1:30068' }
];

let tryOrder = ['lobby'];

let forcedHosts = [
    { domain: 'lobby.example.com', servers: ['lobby'] },
    { domain: 'factions.example.com', servers: ['factions'] },
    { domain: 'minigames.example.com', servers: ['minigames'] }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    renderServers();
    renderTryOrder();
    renderForcedHosts();
    console.log('⚡ Velocity Config Generator loaded');
});

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.querySelector(`[data-content="${tabName}"]`).classList.add('active');
}

// ============================================
// SERVER MANAGEMENT
// ============================================
function renderServers() {
    const container = document.getElementById('serversList');
    container.innerHTML = servers.map((server, index) => `
        <div class="server-item">
            <div style="display: flex; gap: 12px; align-items: center;">
                <input type="text" value="${server.name}" onchange="updateServer(${index}, 'name', this.value)" 
                       style="flex: 1;" placeholder="Server name">
                <input type="text" value="${server.address}" onchange="updateServer(${index}, 'address', this.value)" 
                       style="flex: 2;" placeholder="127.0.0.1:25565">
                <button class="btn" onclick="removeServer(${index})" style="padding: 8px 12px;">❌</button>
            </div>
        </div>
    `).join('');
}

function addServer() {
    servers.push({ name: 'newserver', address: '127.0.0.1:25565' });
    renderServers();
    renderTryOrder();
    renderForcedHosts();
    showAlert('Server added!', 'success');
}

function updateServer(index, field, value) {
    const oldName = servers[index].name;
    servers[index][field] = value;
    
    // Update try order if name changed
    if (field === 'name') {
        tryOrder = tryOrder.map(s => s === oldName ? value : s);
        forcedHosts.forEach(host => {
            host.servers = host.servers.map(s => s === oldName ? value : s);
        });
    }
    
    renderTryOrder();
    renderForcedHosts();
}

function removeServer(index) {
    const serverName = servers[index].name;
    
    if (confirm(`Remove server "${serverName}"?`)) {
        servers.splice(index, 1);
        tryOrder = tryOrder.filter(s => s !== serverName);
        
        // Remove from forced hosts
        forcedHosts.forEach(host => {
            host.servers = host.servers.filter(s => s !== serverName);
        });
        
        renderServers();
        renderTryOrder();
        renderForcedHosts();
        showAlert('Server removed', 'info');
    }
}

// ============================================
// TRY ORDER MANAGEMENT
// ============================================
function renderTryOrder() {
    const container = document.getElementById('tryOrderList');
    container.innerHTML = `
        <div class="setting-item">
            <select id="tryOrderSelect" multiple style="height: 120px;">
                ${servers.map(s => `<option value="${s.name}" ${tryOrder.includes(s.name) ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
            <p class="help-text">Hold Ctrl/Cmd to select multiple. Order matters - first is tried first.</p>
            <button class="btn" onclick="updateTryOrder()" style="margin-top: 8px;">Update Try Order</button>
        </div>
    `;
}

function updateTryOrder() {
    const select = document.getElementById('tryOrderSelect');
    tryOrder = Array.from(select.selectedOptions).map(opt => opt.value);
    showAlert('Try order updated!', 'success');
}

// ============================================
// FORCED HOSTS MANAGEMENT
// ============================================
function renderForcedHosts() {
    const container = document.getElementById('forcedHostsList');
    container.innerHTML = forcedHosts.map((host, index) => `
        <div class="forced-host-item">
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; gap: 8px;">
                    <input type="text" value="${host.domain}" onchange="updateForcedHost(${index}, 'domain', this.value)" 
                           style="flex: 1;" placeholder="domain.example.com">
                    <button class="btn" onclick="removeForcedHost(${index})" style="padding: 8px 12px;">❌</button>
                </div>
                <select multiple style="height: 80px;" id="forcedHost${index}" onchange="updateForcedHostServers(${index})">
                    ${servers.map(s => `<option value="${s.name}" ${host.servers.includes(s.name) ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
                <p class="help-text" style="margin: 0;">Target servers for this domain</p>
            </div>
        </div>
    `).join('');
}

function addForcedHost() {
    forcedHosts.push({ domain: 'example.com', servers: [] });
    renderForcedHosts();
    showAlert('Forced host added!', 'success');
}

function updateForcedHost(index, field, value) {
    forcedHosts[index][field] = value;
}

function updateForcedHostServers(index) {
    const select = document.getElementById(`forcedHost${index}`);
    forcedHosts[index].servers = Array.from(select.selectedOptions).map(opt => opt.value);
}

function removeForcedHost(index) {
    if (confirm('Remove this forced host?')) {
        forcedHosts.splice(index, 1);
        renderForcedHosts();
        showAlert('Forced host removed', 'info');
    }
}

// ============================================
// CONFIG GENERATION
// ============================================
function generateConfig() {
    const config = `# Generated at: https://createminecraftserver.hira.im/

# Config version. Do not change this
config-version = "2.7"

# What port should the proxy be bound to? By default, we'll bind to all addresses on port 25565.
bind = "${document.getElementById('bind').value}"

# What should be the MOTD? This gets displayed when the player adds your server to
# their server list. Only MiniMessage format is accepted.
motd = "${document.getElementById('motd').value}"

# What should we display for the maximum number of players? (Velocity does not support a cap
# on the number of players online.)
show-max-players = ${document.getElementById('showMaxPlayers').value}

# Should we authenticate players with Mojang? By default, this is on.
online-mode = ${document.getElementById('onlineMode').checked}

# Should the proxy enforce the new public key security standard? By default, this is on.
force-key-authentication = ${document.getElementById('forceKeyAuth').checked}

# If client's ISP/AS sent from this proxy is different from the one from Mojang's
# authentication server, the player is kicked. This disallows some VPN and proxy
# connections but is a weak form of protection.
prevent-client-proxy-connections = ${document.getElementById('preventClientProxy').checked}

# Should we forward IP addresses and other data to backend servers?
# Available options:
# - "none":        No forwarding will be done. All players will appear to be connecting
#                  from the proxy and will have offline-mode UUIDs.
# - "legacy":      Forward player IPs and UUIDs in a BungeeCord-compatible format. Use this
#                  if you run servers using Minecraft 1.12 or lower.
# - "bungeeguard": Forward player IPs and UUIDs in a format supported by the BungeeGuard
#                  plugin. Use this if you run servers using Minecraft 1.12 or lower, and are
#                  unable to implement network level firewalling (on a shared host).
# - "modern":      Forward player IPs and UUIDs as part of the login process using
#                  Velocity's native forwarding. Only applicable for Minecraft 1.13 or higher.
player-info-forwarding-mode = "${document.getElementById('forwardingMode').value.toUpperCase()}"

# If you are using modern or BungeeGuard IP forwarding, configure a file that contains a unique secret here.
# The file is expected to be UTF-8 encoded and not empty.
forwarding-secret-file = "${document.getElementById('forwardingSecret').value}"

# Announce whether or not your server supports Forge. If you run a modded server, we
# suggest turning this on.
# 
# If your network runs one modpack consistently, consider using ping-passthrough = "mods"
# instead for a nicer display in the server list.
announce-forge = ${document.getElementById('announceForge').checked}

# If enabled (default is false) and the proxy is in online mode, Velocity will kick
# any existing player who is online if a duplicate connection attempt is made.
kick-existing-players = ${document.getElementById('kickExisting').checked}

# Should Velocity pass server list ping requests to a backend server?
# Available options:
# - "disabled":    No pass-through will be done. The velocity.toml and server-icon.png
#                  will determine the initial server list ping response.
# - "mods":        Passes only the mod list from your backend server into the response.
#                  The first server in your try list (or forced host) with a mod list will be
#                  used. If no backend servers can be contacted, Velocity won't display any
#                  mod information.
# - "description": Uses the description and mod list from the backend server. The first
#                  server in the try (or forced host) list that responds is used for the
#                  description and mod list.
# - "all":         Uses the backend server's response as the proxy response. The Velocity
#                  configuration is used if no servers could be contacted.
ping-passthrough = "${document.getElementById('pingPassthrough').value.toUpperCase()}"

# If enabled (default is false), then a sample of the online players on the proxy will be visible
# when hovering over the player count in the server list.
# This doesn't have any effect when ping passthrough is set to either "description" or "all".
sample-players-in-ping = ${document.getElementById('samplePlayers').checked}

# If not enabled (default is true) player IP addresses will be replaced by <ip address withheld> in logs
enable-player-address-logging = ${document.getElementById('enableAddressLog').checked}

[servers]
# Configure your servers here. Each key represents the server's name, and the value
# represents the IP address of the server to connect to.
${servers.map(s => `${s.name} = "${s.address}"`).join('\n')}

# In what order we should try servers when a player logs in or is kicked from a server.
try = [
${tryOrder.map(s => `    "${s}"`).join(',\n')}
]

[forced-hosts]
# Configure your forced hosts here.
${forcedHosts.map(h => `"${h.domain}" = [\n${h.servers.map(s => `    "${s}"`).join(',\n')}\n]`).join('\n')}

[advanced]
# How large a Minecraft packet has to be before we compress it. Setting this to zero will
# compress all packets, and setting it to -1 will disable compression entirely.
compression-threshold = ${document.getElementById('compressionThreshold').value}

# How much compression should be done (from 0-9). The default is -1, which uses the
# default level of 6.
compression-level = ${document.getElementById('compressionLevel').value}

# How fast (in milliseconds) are clients allowed to connect after the last connection? By
# default, this is three seconds. Disable this by setting this to 0.
login-ratelimit = ${document.getElementById('loginRateLimit').value}

# Specify a custom timeout for connection timeouts here. The default is five seconds.
connection-timeout = ${document.getElementById('connectionTimeout').value}

# Specify a read timeout for connections here. The default is 30 seconds.
read-timeout = ${document.getElementById('readTimeout').value}

# Enables compatibility with HAProxy's PROXY protocol. If you don't know what this is for, then
# don't enable it.
haproxy-protocol = ${document.getElementById('haproxyProtocol').checked}

# Enables TCP fast open support on the proxy. Requires the proxy to run on Linux.
tcp-fast-open = ${document.getElementById('tcpFastOpen').checked}

# Enables BungeeCord plugin messaging channel support on Velocity.
bungee-plugin-message-channel = ${document.getElementById('bungeePluginChannel').checked}

# Shows ping requests to the proxy from clients.
show-ping-requests = ${document.getElementById('showPingRequests').checked}

# By default, Velocity will attempt to gracefully handle situations where the user unexpectedly
# loses connection to the server without an explicit disconnect message by attempting to fall the
# user back, except in the case of read timeouts. BungeeCord will disconnect the user instead. You
# can disable this setting to use the BungeeCord behavior.
failover-on-unexpected-server-disconnect = ${document.getElementById('failoverUnexpected').checked}

# Declares the proxy commands to 1.13+ clients.
announce-proxy-commands = ${document.getElementById('announceCommands').checked}

# Enables the logging of commands
log-command-executions = ${document.getElementById('logCommands').checked}

# Enables logging of player connections when connecting to the proxy, switching servers
# and disconnecting from the proxy.
log-player-connections = ${document.getElementById('logConnections').checked}

# Allows players transferred from other hosts via the
# Transfer packet (Minecraft 1.20.5) to be received.
accepts-transfers = ${document.getElementById('acceptsTransfers').checked}

# Enables support for SO_REUSEPORT. This may help the proxy scale better on multicore systems
# with a lot of incoming connections, and provide better CPU utilization than the existing
# strategy of having a single thread accepting connections and distributing them to worker
# threads. Disabled by default. Requires Linux or macOS.
enable-reuse-port = ${document.getElementById('enableReusePort').checked}

# How fast (in milliseconds) are clients allowed to send commands after the last command
# By default this is 50ms (20 commands per second)
command-rate-limit = ${document.getElementById('commandRateLimit').value}

# Should we forward commands to the backend upon being rate limited?
# This will forward the command to the server instead of processing it on the proxy.
# Since most server implementations have a rate limit, this will prevent the player
# from being able to send excessive commands to the server.
forward-commands-if-rate-limited = ${document.getElementById('forwardRateLimited').checked}

# How many commands are allowed to be sent after the rate limit is hit before the player is kicked?
# Setting this to 0 or lower will disable this feature.
kick-after-rate-limited-commands = ${document.getElementById('kickAfterRateLimited').value}

# How fast (in milliseconds) are clients allowed to send tab completions after the last tab completion
tab-complete-rate-limit = ${document.getElementById('tabCompleteRateLimit').value}

# How many tab completions are allowed to be sent after the rate limit is hit before the player is kicked?
# Setting this to 0 or lower will disable this feature.
kick-after-rate-limited-tab-completes = ${document.getElementById('kickAfterTabRateLimited').value}

[query]
# Whether to enable responding to GameSpy 4 query responses or not.
enabled = ${document.getElementById('queryEnabled').checked}

# If query is enabled, on what port should the query protocol listen on?
port = ${document.getElementById('queryPort').value}

# This is the map name that is reported to the query services.
map = "${document.getElementById('queryMap').value}"

# Whether plugins should be shown in query response by default or not
show-plugins = ${document.getElementById('queryShowPlugins').checked}
`;

    document.getElementById('configOutput').textContent = config;
    showAlert('Configuration generated!', 'success');
}

// ============================================
// DOWNLOAD CONFIG
// ============================================
function downloadConfig() {
    const config = document.getElementById('configOutput').textContent;
    
    if (config === '# Click "Generate Config" to see your velocity.toml configuration here') {
        showAlert('Please generate config first!', 'error');
        return;
    }
    
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'velocity.toml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('velocity.toml downloaded!', 'success');
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard() {
    const config = document.getElementById('configOutput').textContent;
    
    if (config === '# Click "Generate Config" to see your velocity.toml configuration here') {
        showAlert('Please generate config first!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(config).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(() => {
        showAlert('Failed to copy', 'error');
    });
}

// ============================================
// RESET TO DEFAULTS
// ============================================
function resetToDefaults() {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) {
        return;
    }
    
    // Reset all form values
    document.getElementById('bind').value = '0.0.0.0:25565';
    document.getElementById('motd').value = '<#09add3>A Velocity Server';
    document.getElementById('showMaxPlayers').value = '500';
    document.getElementById('onlineMode').checked = true;
    document.getElementById('forceKeyAuth').checked = true;
    document.getElementById('preventClientProxy').checked = false;
    document.getElementById('forwardingMode').value = 'none';
    document.getElementById('forwardingSecret').value = 'forwarding.secret';
    document.getElementById('announceForge').checked = false;
    document.getElementById('kickExisting').checked = false;
    document.getElementById('pingPassthrough').value = 'disabled';
    document.getElementById('samplePlayers').checked = false;
    document.getElementById('enableAddressLog').checked = true;
    
    // Reset servers
    servers = [
        { name: 'lobby', address: '127.0.0.1:30066' },
        { name: 'factions', address: '127.0.0.1:30067' },
        { name: 'minigames', address: '127.0.0.1:30068' }
    ];
    tryOrder = ['lobby'];
    forcedHosts = [
        { domain: 'lobby.example.com', servers: ['lobby'] },
        { domain: 'factions.example.com', servers: ['factions'] },
        { domain: 'minigames.example.com', servers: ['minigames'] }
    ];
    
    // Reset advanced
    document.getElementById('compressionThreshold').value = '256';
    document.getElementById('compressionLevel').value = '-1';
    document.getElementById('loginRateLimit').value = '3000';
    document.getElementById('connectionTimeout').value = '5000';
    document.getElementById('readTimeout').value = '30000';
    document.getElementById('haproxyProtocol').checked = false;
    document.getElementById('tcpFastOpen').checked = false;
    document.getElementById('bungeePluginChannel').checked = true;
    document.getElementById('showPingRequests').checked = false;
    document.getElementById('failoverUnexpected').checked = true;
    document.getElementById('announceCommands').checked = true;
    document.getElementById('logCommands').checked = false;
    document.getElementById('logConnections').checked = true;
    document.getElementById('acceptsTransfers').checked = false;
    document.getElementById('enableReusePort').checked = false;
    document.getElementById('commandRateLimit').value = '50';
    document.getElementById('forwardRateLimited').checked = true;
    document.getElementById('kickAfterRateLimited').value = '0';
    document.getElementById('tabCompleteRateLimit').value = '10';
    document.getElementById('kickAfterTabRateLimited').value = '0';
    
    // Reset query
    document.getElementById('queryEnabled').checked = false;
    document.getElementById('queryPort').value = '25565';
    document.getElementById('queryMap').value = 'Velocity';
    document.getElementById('queryShowPlugins').checked = false;
    
    renderServers();
    renderTryOrder();
    renderForcedHosts();
    
    document.getElementById('configOutput').textContent = '# Click "Generate Config" to see your velocity.toml configuration here';
    
    showAlert('Reset to defaults!', 'info');
}

// ============================================
// IMPORT MODAL
// ============================================
function openImportModal() {
    document.getElementById('importModal').classList.remove('hidden');
}

function closeImportModal() {
    document.getElementById('importModal').classList.add('hidden');
    document.getElementById('importText').value = '';
}

function importConfig() {
    const tomlText = document.getElementById('importText').value.trim();
    
    if (!tomlText) {
        showAlert('Please paste TOML content', 'error');
        return;
    }
    
    try {
        // Parse basic values
        const getValue = (key) => {
            const regex = new RegExp(`${key}\\s*=\\s*"([^"]*)"`, 'i');
            const match = tomlText.match(regex);
            return match ? match[1] : null;
        };
        
        const getBoolValue = (key) => {
            const regex = new RegExp(`${key}\\s*=\\s*(true|false)`, 'i');
            const match = tomlText.match(regex);
            return match ? match[1] === 'true' : false;
        };
        
        const getNumValue = (key) => {
            const regex = new RegExp(`${key}\\s*=\\s*(-?\\d+)`, 'i');
            const match = tomlText.match(regex);
            return match ? match[1] : null;
        };
        
        // Import basic settings
        const bind = getValue('bind');
        if (bind) document.getElementById('bind').value = bind;
        
        const motd = getValue('motd');
        if (motd) document.getElementById('motd').value = motd;
        
        const maxPlayers = getNumValue('show-max-players');
        if (maxPlayers) document.getElementById('showMaxPlayers').value = maxPlayers;
        
        document.getElementById('onlineMode').checked = getBoolValue('online-mode');
        document.getElementById('forceKeyAuth').checked = getBoolValue('force-key-authentication');
        document.getElementById('preventClientProxy').checked = getBoolValue('prevent-client-proxy-connections');
        
        const forwardingMode = getValue('player-info-forwarding-mode');
        if (forwardingMode) document.getElementById('forwardingMode').value = forwardingMode.toLowerCase();
        
        const forwardingSecret = getValue('forwarding-secret-file');
        if (forwardingSecret) document.getElementById('forwardingSecret').value = forwardingSecret;
        
        document.getElementById('announceForge').checked = getBoolValue('announce-forge');
        document.getElementById('kickExisting').checked = getBoolValue('kick-existing-players');
        
        const pingPassthrough = getValue('ping-passthrough');
        if (pingPassthrough) document.getElementById('pingPassthrough').value = pingPassthrough.toLowerCase();
        
        document.getElementById('samplePlayers').checked = getBoolValue('sample-players-in-ping');
        document.getElementById('enableAddressLog').checked = getBoolValue('enable-player-address-logging');
        
        // Import advanced settings
        const compressionThreshold = getNumValue('compression-threshold');
        if (compressionThreshold) document.getElementById('compressionThreshold').value = compressionThreshold;
        
        const compressionLevel = getNumValue('compression-level');
        if (compressionLevel) document.getElementById('compressionLevel').value = compressionLevel;
        
        const loginRateLimit = getNumValue('login-ratelimit');
        if (loginRateLimit) document.getElementById('loginRateLimit').value = loginRateLimit;
        
        const connectionTimeout = getNumValue('connection-timeout');
        if (connectionTimeout) document.getElementById('connectionTimeout').value = connectionTimeout;
        
        const readTimeout = getNumValue('read-timeout');
        if (readTimeout) document.getElementById('readTimeout').value = readTimeout;
        
        document.getElementById('haproxyProtocol').checked = getBoolValue('haproxy-protocol');
        document.getElementById('tcpFastOpen').checked = getBoolValue('tcp-fast-open');
        document.getElementById('bungeePluginChannel').checked = getBoolValue('bungee-plugin-message-channel');
        document.getElementById('showPingRequests').checked = getBoolValue('show-ping-requests');
        document.getElementById('failoverUnexpected').checked = getBoolValue('failover-on-unexpected-server-disconnect');
        document.getElementById('announceCommands').checked = getBoolValue('announce-proxy-commands');
        document.getElementById('logCommands').checked = getBoolValue('log-command-executions');
        document.getElementById('logConnections').checked = getBoolValue('log-player-connections');
        document.getElementById('acceptsTransfers').checked = getBoolValue('accepts-transfers');
        document.getElementById('enableReusePort').checked = getBoolValue('enable-reuse-port');
        
        const commandRateLimit = getNumValue('command-rate-limit');
        if (commandRateLimit) document.getElementById('commandRateLimit').value = commandRateLimit;
        
        document.getElementById('forwardRateLimited').checked = getBoolValue('forward-commands-if-rate-limited');
        
        const kickAfterRateLimited = getNumValue('kick-after-rate-limited-commands');
        if (kickAfterRateLimited) document.getElementById('kickAfterRateLimited').value = kickAfterRateLimited;
        
        const tabCompleteRateLimit = getNumValue('tab-complete-rate-limit');
        if (tabCompleteRateLimit) document.getElementById('tabCompleteRateLimit').value = tabCompleteRateLimit;
        
        const kickAfterTabRateLimited = getNumValue('kick-after-rate-limited-tab-completes');
        if (kickAfterTabRateLimited) document.getElementById('kickAfterTabRateLimited').value = kickAfterTabRateLimited;
        
        // Import query settings
        document.getElementById('queryEnabled').checked = getBoolValue('enabled');
        
        const queryPort = getNumValue('port');
        if (queryPort) document.getElementById('queryPort').value = queryPort;
        
        const queryMap = getValue('map');
        if (queryMap) document.getElementById('queryMap').value = queryMap;
        
        document.getElementById('queryShowPlugins').checked = getBoolValue('show-plugins');
        
        // Parse servers section
        const serversMatch = tomlText.match(/\[servers\]([\s\S]*?)(?=\[|$)/);
        if (serversMatch) {
            const serversSection = serversMatch[1];
            const serverLines = serversSection.match(/^(\w+)\s*=\s*"([^"]+)"/gm);
            
            if (serverLines) {
                servers = [];
                serverLines.forEach(line => {
                    const match = line.match(/^(\w+)\s*=\s*"([^"]+)"/);
                    if (match && match[1] !== 'try') {
                        servers.push({ name: match[1], address: match[2] });
                    }
                });
            }
            
            // Parse try order
            const tryMatch = serversSection.match(/try\s*=\s*\[([\s\S]*?)\]/);
            if (tryMatch) {
                tryOrder = tryMatch[1].match(/"([^"]+)"/g).map(s => s.replace(/"/g, ''));
            }
        }
        
        // Parse forced hosts
        const forcedHostsMatch = tomlText.match(/\[forced-hosts\]([\s\S]*?)(?=\[|$)/);
        if (forcedHostsMatch) {
            const forcedHostsSection = forcedHostsMatch[1];
            const hostMatches = [...forcedHostsSection.matchAll(/"([^"]+)"\s*=\s*\[([\s\S]*?)\]/g)];
            
            if (hostMatches.length > 0) {
                forcedHosts = [];
                hostMatches.forEach(match => {
                    const domain = match[1];
                    const serversStr = match[2];
                    const serversList = serversStr.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
                    forcedHosts.push({ domain, servers: serversList });
                });
            }
        }
        
        renderServers();
        renderTryOrder();
        renderForcedHosts();
        
        closeImportModal();
        showAlert('Configuration imported!', 'success');
        
    } catch (error) {
        console.error('Import error:', error);
        showAlert('Failed to parse TOML: ' + error.message, 'error');
    }
}

// ============================================
// ALERT SYSTEM
// ============================================
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(400px)';
        alert.style.transition = 'all 0.3s ease';
        setTimeout(() => alert.remove(), 3000000);
    }, 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeImportModal();
    }
    
    // Ctrl/Cmd + S to generate config
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        generateConfig();
    }
    
    // Ctrl/Cmd + D to download
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadConfig();
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function validateServerName(name) {
    // Server names should be alphanumeric with underscores and hyphens
    return /^[a-zA-Z0-9_-]+$/.test(name);
}

function validateAddress(address) {
    // Basic validation for IP:PORT or DOMAIN:PORT
    const pattern = /^[a-zA-Z0-9.-]+:\d{1,5}$/;
    return pattern.test(address);
}

function validateDomain(domain) {
    // Basic domain validation
    const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*\.[a-zA-Z]{2,}$/;
    return pattern.test(domain);
}

// ============================================
// VALIDATION WARNINGS
// ============================================
function validateConfiguration() {
    const warnings = [];
    
    // Check if online mode is disabled
    if (!document.getElementById('onlineMode').checked) {
        warnings.push('⚠️ Online mode is disabled - server is vulnerable to impersonation');
    }
    
    // Check forwarding mode with online mode
    const forwardingMode = document.getElementById('forwardingMode').value;
    const onlineMode = document.getElementById('onlineMode').checked;
    
    if (onlineMode && forwardingMode === 'none') {
        warnings.push('⚠️ Online mode is enabled but forwarding is set to "none" - backend servers will see offline UUIDs');
    }
    
    // Check if no servers configured
    if (servers.length === 0) {
        warnings.push('❌ No backend servers configured');
    }
    
    // Check if try order is empty
    if (tryOrder.length === 0) {
        warnings.push('❌ Try order is empty - players won\'t be able to connect');
    }
    
    // Validate server names and addresses
    servers.forEach(server => {
        if (!validateServerName(server.name)) {
            warnings.push(`⚠️ Invalid server name: "${server.name}" (use alphanumeric, underscore, hyphen only)`);
        }
        if (!validateAddress(server.address)) {
            warnings.push(`⚠️ Invalid server address: "${server.address}" (format: IP:PORT or DOMAIN:PORT)`);
        }
    });
    
    // Validate forced host domains
    forcedHosts.forEach(host => {
        if (!validateDomain(host.domain)) {
            warnings.push(`⚠️ Invalid domain: "${host.domain}"`);
        }
        if (host.servers.length === 0) {
            warnings.push(`⚠️ Forced host "${host.domain}" has no target servers`);
        }
    });
    
    // Check compression settings
    const compressionThreshold = parseInt(document.getElementById('compressionThreshold').value);
    if (compressionThreshold > 0 && compressionThreshold < 256) {
        warnings.push('⚠️ Compression threshold below 256 may impact performance');
    }
    
    // Check rate limits
    const loginRateLimit = parseInt(document.getElementById('loginRateLimit').value);
    if (loginRateLimit === 0) {
        warnings.push('⚠️ Login rate limit disabled - vulnerable to connection spam');
    }
    
    return warnings;
}

function showValidationWarnings() {
    const warnings = validateConfiguration();
    
    if (warnings.length === 0) {
        showAlert('✅ Configuration validated - no issues found!', 'success');
        return;
    }
    
    // Create validation modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>⚠️ Configuration Warnings</h2>
            <div style="max-height: 400px; overflow-y: auto;">
                ${warnings.map(w => `
                    <div class="info-box info-box-warning" style="margin-bottom: 8px;">
                        <p style="margin: 0; font-size: 14px;">${w}</p>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 16px;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on click outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add validation button listener (add this to your HTML if you want a validation button)
// <button class="btn" onclick="showValidationWarnings()">🔍 Validate Config</button>

// ============================================
// AUTO-SAVE TO LOCAL STORAGE (OPTIONAL)
// ============================================
function saveToLocalStorage() {
    const configData = {
        bind: document.getElementById('bind').value,
        motd: document.getElementById('motd').value,
        showMaxPlayers: document.getElementById('showMaxPlayers').value,
        onlineMode: document.getElementById('onlineMode').checked,
        forceKeyAuth: document.getElementById('forceKeyAuth').checked,
        preventClientProxy: document.getElementById('preventClientProxy').checked,
        forwardingMode: document.getElementById('forwardingMode').value,
        forwardingSecret: document.getElementById('forwardingSecret').value,
        announceForge: document.getElementById('announceForge').checked,
        kickExisting: document.getElementById('kickExisting').checked,
        pingPassthrough: document.getElementById('pingPassthrough').value,
        samplePlayers: document.getElementById('samplePlayers').checked,
        enableAddressLog: document.getElementById('enableAddressLog').checked,
        servers: servers,
        tryOrder: tryOrder,
        forcedHosts: forcedHosts,
        compressionThreshold: document.getElementById('compressionThreshold').value,
        compressionLevel: document.getElementById('compressionLevel').value,
        loginRateLimit: document.getElementById('loginRateLimit').value,
        connectionTimeout: document.getElementById('connectionTimeout').value,
        readTimeout: document.getElementById('readTimeout').value,
        haproxyProtocol: document.getElementById('haproxyProtocol').checked,
        tcpFastOpen: document.getElementById('tcpFastOpen').checked,
        bungeePluginChannel: document.getElementById('bungeePluginChannel').checked,
        showPingRequests: document.getElementById('showPingRequests').checked,
        failoverUnexpected: document.getElementById('failoverUnexpected').checked,
        announceCommands: document.getElementById('announceCommands').checked,
        logCommands: document.getElementById('logCommands').checked,
        logConnections: document.getElementById('logConnections').checked,
        acceptsTransfers: document.getElementById('acceptsTransfers').checked,
        enableReusePort: document.getElementById('enableReusePort').checked,
        commandRateLimit: document.getElementById('commandRateLimit').value,
        forwardRateLimited: document.getElementById('forwardRateLimited').checked,
        kickAfterRateLimited: document.getElementById('kickAfterRateLimited').value,
        tabCompleteRateLimit: document.getElementById('tabCompleteRateLimit').value,
        kickAfterTabRateLimited: document.getElementById('kickAfterTabRateLimited').value,
        queryEnabled: document.getElementById('queryEnabled').checked,
        queryPort: document.getElementById('queryPort').value,
        queryMap: document.getElementById('queryMap').value,
        queryShowPlugins: document.getElementById('queryShowPlugins').checked
    };
    
    try {
        localStorage.setItem('velocityConfigDraft', JSON.stringify(configData));
        console.log('✅ Configuration auto-saved to browser storage');
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('velocityConfigDraft');
        if (!saved) return false;
        
        const configData = JSON.parse(saved);
        
        // Restore all values
        document.getElementById('bind').value = configData.bind || '0.0.0.0:25565';
        document.getElementById('motd').value = configData.motd || '<#09add3>A Velocity Server';
        document.getElementById('showMaxPlayers').value = configData.showMaxPlayers || '500';
        document.getElementById('onlineMode').checked = configData.onlineMode ?? true;
        document.getElementById('forceKeyAuth').checked = configData.forceKeyAuth ?? true;
        document.getElementById('preventClientProxy').checked = configData.preventClientProxy ?? false;
        document.getElementById('forwardingMode').value = configData.forwardingMode || 'none';
        document.getElementById('forwardingSecret').value = configData.forwardingSecret || 'forwarding.secret';
        document.getElementById('announceForge').checked = configData.announceForge ?? false;
        document.getElementById('kickExisting').checked = configData.kickExisting ?? false;
        document.getElementById('pingPassthrough').value = configData.pingPassthrough || 'disabled';
        document.getElementById('samplePlayers').checked = configData.samplePlayers ?? false;
        document.getElementById('enableAddressLog').checked = configData.enableAddressLog ?? true;
        
        if (configData.servers) servers = configData.servers;
        if (configData.tryOrder) tryOrder = configData.tryOrder;
        if (configData.forcedHosts) forcedHosts = configData.forcedHosts;
        
        document.getElementById('compressionThreshold').value = configData.compressionThreshold || '256';
        document.getElementById('compressionLevel').value = configData.compressionLevel || '-1';
        document.getElementById('loginRateLimit').value = configData.loginRateLimit || '3000';
        document.getElementById('connectionTimeout').value = configData.connectionTimeout || '5000';
        document.getElementById('readTimeout').value = configData.readTimeout || '30000';
        document.getElementById('haproxyProtocol').checked = configData.haproxyProtocol ?? false;
        document.getElementById('tcpFastOpen').checked = configData.tcpFastOpen ?? false;
        document.getElementById('bungeePluginChannel').checked = configData.bungeePluginChannel ?? true;
        document.getElementById('showPingRequests').checked = configData.showPingRequests ?? false;
        document.getElementById('failoverUnexpected').checked = configData.failoverUnexpected ?? true;
        document.getElementById('announceCommands').checked = configData.announceCommands ?? true;
        document.getElementById('logCommands').checked = configData.logCommands ?? false;
        document.getElementById('logConnections').checked = configData.logConnections ?? true;
        document.getElementById('acceptsTransfers').checked = configData.acceptsTransfers ?? false;
        document.getElementById('enableReusePort').checked = configData.enableReusePort ?? false;
        document.getElementById('commandRateLimit').value = configData.commandRateLimit || '50';
        document.getElementById('forwardRateLimited').checked = configData.forwardRateLimited ?? true;
        document.getElementById('kickAfterRateLimited').value = configData.kickAfterRateLimited || '0';
        document.getElementById('tabCompleteRateLimit').value = configData.tabCompleteRateLimit || '10';
        document.getElementById('kickAfterTabRateLimited').value = configData.kickAfterTabRateLimited || '0';
        document.getElementById('queryEnabled').checked = configData.queryEnabled ?? false;
        document.getElementById('queryPort').value = configData.queryPort || '25565';
        document.getElementById('queryMap').value = configData.queryMap || 'Velocity';
        document.getElementById('queryShowPlugins').checked = configData.queryShowPlugins ?? false;
        
        renderServers();
        renderTryOrder();
        renderForcedHosts();
        
        console.log('✅ Configuration loaded from browser storage');
        return true;
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        return false;
    }
}

function clearLocalStorage() {
    localStorage.removeItem('velocityConfigDraft');
    showAlert('Browser storage cleared!', 'info');
}

// Auto-save every 30 seconds
setInterval(() => {
    saveToLocalStorage();
}, 30000);

// Try to load saved config on page load
document.addEventListener('DOMContentLoaded', function() {
    const loaded = loadFromLocalStorage();
    if (loaded) {
        showAlert('Previous draft loaded from browser storage', 'info');
    }
});

// ============================================
// EXPORT AS JSON (FOR BACKUP/SHARING)
// ============================================
function exportAsJSON() {
    const configData = {
        version: '1.0',
        exported: new Date().toISOString(),
        bind: document.getElementById('bind').value,
        motd: document.getElementById('motd').value,
        showMaxPlayers: document.getElementById('showMaxPlayers').value,
        onlineMode: document.getElementById('onlineMode').checked,
        forceKeyAuth: document.getElementById('forceKeyAuth').checked,
        preventClientProxy: document.getElementById('preventClientProxy').checked,
        forwardingMode: document.getElementById('forwardingMode').value,
        forwardingSecret: document.getElementById('forwardingSecret').value,
        announceForge: document.getElementById('announceForge').checked,
        kickExisting: document.getElementById('kickExisting').checked,
        pingPassthrough: document.getElementById('pingPassthrough').value,
        samplePlayers: document.getElementById('samplePlayers').checked,
        enableAddressLog: document.getElementById('enableAddressLog').checked,
        servers: servers,
        tryOrder: tryOrder,
        forcedHosts: forcedHosts,
        advanced: {
            compressionThreshold: document.getElementById('compressionThreshold').value,
            compressionLevel: document.getElementById('compressionLevel').value,
            loginRateLimit: document.getElementById('loginRateLimit').value,
            connectionTimeout: document.getElementById('connectionTimeout').value,
            readTimeout: document.getElementById('readTimeout').value,
            haproxyProtocol: document.getElementById('haproxyProtocol').checked,
            tcpFastOpen: document.getElementById('tcpFastOpen').checked,
            bungeePluginChannel: document.getElementById('bungeePluginChannel').checked,
            showPingRequests: document.getElementById('showPingRequests').checked,
            failoverUnexpected: document.getElementById('failoverUnexpected').checked,
            announceCommands: document.getElementById('announceCommands').checked,
            logCommands: document.getElementById('logCommands').checked,
            logConnections: document.getElementById('logConnections').checked,
            acceptsTransfers: document.getElementById('acceptsTransfers').checked,
            enableReusePort: document.getElementById('enableReusePort').checked,
            commandRateLimit: document.getElementById('commandRateLimit').value,
            forwardRateLimited: document.getElementById('forwardRateLimited').checked,
            kickAfterRateLimited: document.getElementById('kickAfterRateLimited').value,
            tabCompleteRateLimit: document.getElementById('tabCompleteRateLimit').value,
            kickAfterTabRateLimited: document.getElementById('kickAfterTabRateLimited').value
        },
        query: {
            enabled: document.getElementById('queryEnabled').checked,
            port: document.getElementById('queryPort').value,
            map: document.getElementById('queryMap').value,
            showPlugins: document.getElementById('queryShowPlugins').checked
        }
    };
    
    const json = JSON.stringify(configData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'velocity-config-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('JSON backup downloaded!', 'success');
}

// Console welcome message
console.log('%c⚡ Velocity Config Generator', 'font-size: 20px; font-weight: bold; color: #7aa2f7;');
console.log('%cMade with 🤍 by Harman Singh Hira', 'font-size: 14px; color: #bb9af7;');
console.log('%cTips:', 'font-size: 14px; font-weight: bold; color: #9ece6a;');
console.log('- Press Ctrl/Cmd + S to generate config');
console.log('- Press Ctrl/Cmd + D to download config');
console.log('- Press Escape to close modals');
console.log('- Your config is auto-saved every 30 seconds to browser storage');