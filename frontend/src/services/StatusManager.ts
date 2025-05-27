export class StatusManager {
    private websocket: WebSocket | null = null;
    private reconnectInterval = 5000;
    private pingInterval = 30000;
    private pingTimer?: number;

    connect() {
		const token = sessionStorage.getItem('access');
        const wsUrl = `wss://localhost/ws/status/?token=${token}`;

        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            this.startPing();
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
        };

        this.websocket.onclose = () => {
            setTimeout(() => this.connect(), this.reconnectInterval);
        };
    }

    disconnect() {
        if (this.pingTimer) clearInterval(this.pingTimer);
        if (this.websocket) this.websocket.close();
    }

    private startPing() {
        this.pingTimer = window.setInterval(() => {
            if (this.websocket?.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({type: 'ping'}));
            }
        }, this.pingInterval);
    }
}
