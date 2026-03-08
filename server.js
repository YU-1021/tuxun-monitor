const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function proxyRequest(url, res) {
    https.get(url, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
    }).on('error', (e) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    if (url.pathname === '/api/rank') {
        const type = url.searchParams.get('type') || 'china';
        proxyRequest(`https://tuxun.fun/api/v0/tuxun/getRank?type=${type}`, res);
        return;
    }
    
    if (url.pathname === '/api/activity') {
        const userId = url.searchParams.get('userId');
        if (!userId) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'userId required' }));
            return;
        }
        https.get(`https://tuxun.fun/api/v0/tuxun/history/listUserRating?userId=${userId}`, (proxyRes) => {
            let data = '';
            proxyRes.on('data', chunk => data += chunk);
            proxyRes.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    let isActive = false;
                    if (json.success && json.data && json.data[0]) {
                        isActive = (Date.now() - json.data[0].gmtCreate) <= 10 * 60 * 1000;
                    }
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ isActive }));
                } catch (e) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: e.message }));
                }
            });
        }).on('error', (e) => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        });
        return;
    }
    
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    filePath = path.join(__dirname, filePath);
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
