export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === '/' || path === '/index.html') {
            return new Response(getHTML(), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }

        if (path === '/api/rank') {
            const type = url.searchParams.get('type') || 'china';
            return proxyRequest(`https://tuxun.fun/api/v0/tuxun/getRank?type=${type}`);
        }

        if (path === '/api/activity') {
            const userId = url.searchParams.get('userId');
            if (!userId) {
                return new Response(JSON.stringify({ error: 'userId required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return proxyRequest(`https://tuxun.fun/api/v0/tuxun/history/listUserRating?userId=${userId}`);
        }

        return new Response('Not Found', { status: 404 });
    }
};

async function proxyRequest(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tuxun.fun/'
            }
        });

        const data = await response.json();

        if (targetUrl.includes('listUserRating')) {
            let isActive = false;
            if (data.success && data.data && data.data[0]) {
                const lastGame = data.data[0];
                isActive = (Date.now() - lastGame.gmtCreate) <= 10 * 60 * 1000;
            }
            return new Response(JSON.stringify({ isActive }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function getHTML() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图寻活跃前100监控</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #e0e0e0;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            padding: 30px 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            background: linear-gradient(90deg, #ff9427, #ffb347);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header .subtitle {
            color: #888;
            font-size: 14px;
        }

        .controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .mode-switch {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(0, 0, 0, 0.3);
            padding: 8px 16px;
            border-radius: 25px;
        }

        .mode-switch span {
            font-size: 14px;
            color: #aaa;
            transition: color 0.3s;
        }

        .mode-switch span.active {
            color: #ff9427;
            font-weight: 600;
        }

        .toggle-btn {
            width: 50px;
            height: 26px;
            background: #333;
            border-radius: 13px;
            cursor: pointer;
            position: relative;
            transition: background 0.3s;
        }

        .toggle-btn::after {
            content: '';
            position: absolute;
            width: 22px;
            height: 22px;
            background: #fff;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 0.3s;
        }

        .toggle-btn.world::after {
            transform: translateX(24px);
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #ff9427, #ff7b00);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 148, 39, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e0e0e0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
        }

        .btn-success {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
        }

        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 13px;
        }

        .status-bar .left {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #27ae60;
            animation: pulse 2s infinite;
        }

        .status-dot.paused {
            background: #e74c3c;
            animation: none;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .active-count {
            background: rgba(39, 174, 96, 0.2);
            color: #2ecc71;
            padding: 4px 12px;
            border-radius: 15px;
            font-weight: 500;
        }

        .rank-table-container {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }

        .rank-table {
            width: 100%;
            border-collapse: collapse;
        }

        .rank-table th {
            background: rgba(0, 0, 0, 0.4);
            padding: 14px 12px;
            text-align: left;
            font-weight: 600;
            color: #aaa;
            font-size: 13px;
            position: sticky;
            top: 0;
        }

        .rank-table th:nth-child(1),
        .rank-table th:nth-child(3),
        .rank-table th:nth-child(4) {
            text-align: center;
        }

        .rank-table td {
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 14px;
        }

        .rank-table td:nth-child(1),
        .rank-table td:nth-child(3),
        .rank-table td:nth-child(4) {
            text-align: center;
        }

        .rank-table tr.active-row {
            background: rgba(39, 174, 96, 0.15);
        }

        .rank-table tr:nth-child(even):not(.active-row) {
            background: rgba(255, 255, 255, 0.02);
        }

        .rank-table tr:hover {
            background: rgba(255, 148, 39, 0.1);
        }

        .rank-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            font-weight: 700;
            font-size: 12px;
        }

        .rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; }
        .rank-2 { background: linear-gradient(135deg, #C0C0C0, #A8A8A8); color: #000; }
        .rank-3 { background: linear-gradient(135deg, #CD7F32, #B8860B); color: #fff; }
        .rank-top10 { background: rgba(255, 107, 107, 0.3); color: #FF6B6B; }
        .rank-other { background: rgba(255, 255, 255, 0.1); color: #aaa; }

        .player-name {
            font-weight: 500;
            color: #e0e0e0;
        }

        .rating {
            font-weight: 700;
            font-size: 15px;
        }

        .change {
            font-weight: 600;
            font-size: 13px;
        }

        .change.positive { color: #2ecc71; }
        .change.negative { color: #e74c3c; }
        .change.neutral { color: #666; }

        .loading {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 148, 39, 0.3);
            border-top-color: #ff9427;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 148, 39, 0.95);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            max-width: 350px;
            transform: translateX(400px);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification h4 {
            font-size: 14px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .notification-content {
            font-size: 13px;
            line-height: 1.6;
        }

        .notification-item {
            padding: 4px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .notification-item:last-child {
            border-bottom: none;
        }

        .notification-item .player-change {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .notification-item .rank-info {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.8);
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }

        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }

            .header h1 {
                font-size: 22px;
            }

            .controls {
                gap: 10px;
            }

            .btn {
                padding: 8px 14px;
                font-size: 13px;
            }

            .rank-table th,
            .rank-table td {
                padding: 10px 8px;
                font-size: 12px;
            }

            .status-bar {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>图寻活跃前100监控</h1>
            <p class="subtitle">实时监控排行榜积分变动</p>
            <div class="controls">
                <div class="mode-switch">
                    <span id="chinaLabel" class="active">中国</span>
                    <div class="toggle-btn" id="modeToggle"></div>
                    <span id="worldLabel">世界</span>
                </div>
                <button class="btn btn-primary" id="refreshBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    手动刷新
                </button>
                <button class="btn btn-success" id="autoRefreshBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    自动刷新中
                </button>
            </div>
        </div>

        <div class="status-bar">
            <div class="left">
                <div class="status-indicator">
                    <div class="status-dot" id="statusDot"></div>
                    <span id="statusText">自动刷新中</span>
                </div>
                <span id="lastUpdate">等待数据...</span>
            </div>
            <div class="active-count" id="activeCount">活跃: 0 / 100</div>
        </div>

        <div class="rank-table-container">
            <table class="rank-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>玩家</th>
                        <th>积分</th>
                        <th>变动</th>
                    </tr>
                </thead>
                <tbody id="rankList">
                    <tr>
                        <td colspan="4">
                            <div class="loading">
                                <div class="loading-spinner"></div>
                                <div>正在加载数据...</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            数据来源: tuxun.fun | 刷新间隔: 5秒
        </div>
    </div>

    <div class="notification" id="notification">
        <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            积分变动提醒
        </h4>
        <div class="notification-content" id="notificationContent"></div>
    </div>

    <script>
        const API_BASE = window.location.origin;
        
        let currentMode = 'china';
        let isAutoRefresh = true;
        let autoRefreshInterval = null;
        let playerHistory = { china: {}, world: {} };
        let currentRankData = [];

        const modeToggle = document.getElementById('modeToggle');
        const chinaLabel = document.getElementById('chinaLabel');
        const worldLabel = document.getElementById('worldLabel');
        const refreshBtn = document.getElementById('refreshBtn');
        const autoRefreshBtn = document.getElementById('autoRefreshBtn');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const lastUpdate = document.getElementById('lastUpdate');
        const activeCount = document.getElementById('activeCount');
        const rankList = document.getElementById('rankList');
        const notification = document.getElementById('notification');
        const notificationContent = document.getElementById('notificationContent');

        function init() {
            loadHistory();
            startAutoRefresh();
            fetchRankData();
        }

        function loadHistory() {
            const saved = localStorage.getItem('playerHistory');
            if (saved) {
                playerHistory = JSON.parse(saved);
            }
        }

        function saveHistory() {
            localStorage.setItem('playerHistory', JSON.stringify(playerHistory));
        }

        modeToggle.addEventListener('click', () => {
            currentMode = currentMode === 'china' ? 'world' : 'china';
            updateModeUI();
            fetchRankData();
        });

        function updateModeUI() {
            if (currentMode === 'world') {
                modeToggle.classList.add('world');
                chinaLabel.classList.remove('active');
                worldLabel.classList.add('active');
            } else {
                modeToggle.classList.remove('world');
                chinaLabel.classList.add('active');
                worldLabel.classList.remove('active');
            }
        }

        refreshBtn.addEventListener('click', () => {
            fetchRankData();
        });

        autoRefreshBtn.addEventListener('click', () => {
            isAutoRefresh = !isAutoRefresh;
            if (isAutoRefresh) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
            updateAutoRefreshUI();
        });

        function startAutoRefresh() {
            if (autoRefreshInterval) clearInterval(autoRefreshInterval);
            autoRefreshInterval = setInterval(() => {
                if (isAutoRefresh) fetchRankData();
            }, 5000);
        }

        function stopAutoRefresh() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
            }
        }

        function updateAutoRefreshUI() {
            if (isAutoRefresh) {
                autoRefreshBtn.className = 'btn btn-success';
                autoRefreshBtn.innerHTML = \`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    自动刷新中
                \`;
                statusDot.classList.remove('paused');
                statusText.textContent = '自动刷新中';
            } else {
                autoRefreshBtn.className = 'btn btn-danger';
                autoRefreshBtn.innerHTML = \`
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    已暂停
                \`;
                statusDot.classList.add('paused');
                statusText.textContent = '已暂停';
            }
        }

        async function fetchRankData() {
            try {
                const response = await fetch(\`\${API_BASE}/api/rank?type=\${currentMode}\`);
                const data = await response.json();
                
                if (data.success) {
                    processRankData(data.data);
                } else {
                    showError('获取数据失败');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                showError('网络请求失败');
            }
        }

        function processRankData(data) {
            const sortedData = data
                .filter(item => item && item.rank)
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 100);

            let changedPlayers = [];
            
            sortedData.forEach(player => {
                const userId = player.userAO.userId;
                const currentRating = currentMode === 'china' ? player.userAO.chinaRating : player.userAO.rating;
                const oldRecord = playerHistory[currentMode][userId];

                if (oldRecord && oldRecord.rating !== currentRating) {
                    const diff = currentRating - oldRecord.rating;
                    changedPlayers.push({
                        name: player.userAO.userName,
                        diff: diff,
                        rank: player.rank,
                        newRating: currentRating
                    });
                }
            });

            if (changedPlayers.length > 0) {
                showNotification(changedPlayers);
            }

            currentRankData = sortedData;
            checkActivePlayers(sortedData);
        }

        async function checkActivePlayers(data) {
            const checkPromises = data.map(async player => {
                const userId = player.userAO.userId;
                try {
                    const response = await fetch(\`\${API_BASE}/api/activity?userId=\${userId}\`);
                    const result = await response.json();
                    player.isActive = result.isActive;
                } catch {
                    player.isActive = false;
                }
                return player;
            });

            const dataWithActive = await Promise.all(checkPromises);
            displayRankList(dataWithActive);
            updatePlayerHistory(dataWithActive);
            
            const activeNum = dataWithActive.filter(p => p.isActive).length;
            activeCount.textContent = \`活跃: \${activeNum} / 100\`;
            lastUpdate.textContent = \`最后更新: \${new Date().toLocaleTimeString()}\`;
        }

        function updatePlayerHistory(data) {
            data.forEach(player => {
                const userId = player.userAO.userId;
                const currentRating = currentMode === 'china' ? player.userAO.chinaRating : player.userAO.rating;
                playerHistory[currentMode][userId] = {
                    rating: currentRating,
                    userName: player.userAO.userName,
                    timestamp: Date.now()
                };
            });
            saveHistory();
        }

        function displayRankList(data) {
            let html = '';
            
            data.forEach((player) => {
                const currentRating = currentMode === 'china' ? player.userAO.chinaRating : player.userAO.rating;
                const record = playerHistory[currentMode][player.userAO.userId];
                let changeText = '0';
                let changeClass = 'neutral';

                if (record) {
                    const diff = currentRating - record.rating;
                    if (diff > 0) {
                        changeText = \`+\${diff}\`;
                        changeClass = 'positive';
                    } else if (diff < 0) {
                        changeText = diff;
                        changeClass = 'negative';
                    }
                }

                const rowClass = player.isActive ? 'active-row' : '';
                let rankClass = 'rank-other';
                if (player.rank === 1) rankClass = 'rank-1';
                else if (player.rank === 2) rankClass = 'rank-2';
                else if (player.rank === 3) rankClass = 'rank-3';
                else if (player.rank <= 10) rankClass = 'rank-top10';

                html += \`
                    <tr class="\${rowClass}">
                        <td><span class="rank-badge \${rankClass}">\${player.rank}</span></td>
                        <td class="player-name">\${escapeHtml(player.userAO.userName)}</td>
                        <td class="rating">\${currentRating}</td>
                        <td class="change \${changeClass}">\${changeText}</td>
                    </tr>
                \`;
            });

            rankList.innerHTML = html;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showNotification(players) {
            let content = '';
            players.forEach(p => {
                const diffClass = p.diff > 0 ? 'positive' : 'negative';
                const diffSign = p.diff > 0 ? '+' : '';
                content += \`
                    <div class="notification-item">
                        <div class="player-change">
                            <span>\${escapeHtml(p.name)}</span>
                            <span class="change \${diffClass}">\${diffSign}\${p.diff}</span>
                        </div>
                        <div class="rank-info">当前排名: 第 \${p.rank} 名 | 积分: \${p.newRating}</div>
                    </div>
                \`;
            });
            
            notificationContent.innerHTML = content;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }

        function showError(message) {
            rankList.innerHTML = \`
                <tr>
                    <td colspan="4">
                        <div class="loading">
                            <div style="color: #e74c3c; margin-bottom: 10px;">\${message}</div>
                            <button class="btn btn-primary" onclick="fetchRankData()">重试</button>
                        </div>
                    </td>
                </tr>
            \`;
        }

        init();
    <\/script>
</body>
</html>`;
}
