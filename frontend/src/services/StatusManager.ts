import { WS_PATH } from "./constants";

export default class StatusManager {
    private websocket: WebSocket | null = null;
    private reconnectInterval = 5000;
    private pingInterval = 30000;
    private pingTimer: number | null = null;

    startWatching() {
        this.checkAndManageConnection();
        this.pingTimer = window.setInterval(() => {
            this.checkAndManageConnection();
        }, this.pingInterval);
    }

    stopWatching() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        this.disconnect();
    }

    private checkAndManageConnection() {
        const token = sessionStorage.getItem('access');
        const isAuth = sessionStorage.getItem('is_authenticated') === 'true';
        if (token && isAuth && this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
            this.connect();
        } else if ((!token || !isAuth) && this.websocket) {
            this.disconnect();
        }
    }

    connect() {
        const access_token = sessionStorage.getItem('access');
        const isAuth = sessionStorage.getItem('is_authenticated') === 'true';
        if (!access_token || !isAuth) {
            return ;
        }
        this.disconnect();

        const wsUrl = `${WS_PATH}/ws/status/?token=${access_token}`;
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            this.startPing();
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
        };

        this.websocket.onclose = () => {
            this.stopPing();
            const token = sessionStorage.getItem('access');
            const auth = sessionStorage.getItem('is_authenticated');

            if (token && auth) {
                this.pingTimer = window.setTimeout(() => this.connect(), this.reconnectInterval);
            }
        };
    }

    disconnect() {
        this.stopPing();
        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    private startPing() {
        this.stopPing();
        this.pingTimer = window.setInterval(() => {
            if (this.websocket?.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({type: 'ping'}));
            }
        }, this.pingInterval);
    }

    private stopPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }
}
