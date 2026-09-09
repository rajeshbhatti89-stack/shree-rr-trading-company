const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.status = 'disconnected'; // 'disconnected' | 'qr_ready' | 'connecting' | 'connected'
    this.qrString = null;
    this.qrDataUrl = null;
    this.user = null;
    this.authFolder = path.join(__dirname, 'auth_info_baileys');
    this.listeners = [];
  }

  onStateChange(fn) {
    this.listeners.push(fn);
  }

  emitState() {
    const payload = {
      status: this.status,
      user: this.user,
      qrDataUrl: this.status === 'qr_ready' ? this.qrDataUrl : null,
      updatedAt: new Date().toISOString()
    };
    this.listeners.forEach(fn => {
      try { fn(payload); } catch (e) {}
    });
  }

  async init() {
    try {
      if (!fs.existsSync(this.authFolder)) {
        fs.mkdirSync(this.authFolder, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

      this.sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['Shree RR Payroll Bot', 'Chrome', '120.0.0'],
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.status = 'qr_ready';
          this.qrString = qr;
          try {
            this.qrDataUrl = await QRCode.toDataURL(qr);
          } catch (err) {
            console.error('QR generate error:', err);
          }
          console.log('[WhatsApp] New QR code generated. Ready to scan.');
          this.emitState();
        }

        if (connection === 'connecting') {
          this.status = 'connecting';
          this.emitState();
        }

        if (connection === 'open') {
          this.status = 'connected';
          this.qrString = null;
          this.qrDataUrl = null;
          this.user = this.sock.user;
          console.log('[WhatsApp] Successfully connected as:', this.user);
          this.emitState();
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          console.log('[WhatsApp] Connection closed. Reason:', statusCode, 'Reconnect:', shouldReconnect);

          this.status = 'disconnected';
          this.user = null;
          this.emitState();

          if (shouldReconnect) {
            setTimeout(() => this.init(), 3000);
          } else {
            // Clean auth on logout
            try {
              fs.rmSync(this.authFolder, { recursive: true, force: true });
            } catch (e) {}
            setTimeout(() => this.init(), 1000);
          }
        }
      });

    } catch (err) {
      console.error('[WhatsApp] Initialization error:', err);
      this.status = 'disconnected';
      this.emitState();
    }
  }

  async logout() {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
      }
    } catch (e) {}
    try {
      fs.rmSync(this.authFolder, { recursive: true, force: true });
    } catch (e) {}
    this.status = 'disconnected';
    this.user = null;
    this.emitState();
    setTimeout(() => this.init(), 1000);
    return { success: true };
  }

  formatJid(mobile) {
    let clean = String(mobile || '').replace(/\D/g, '');
    if (clean.length === 10) clean = '91' + clean;
    if (!clean.endsWith('@s.whatsapp.net')) {
      clean = clean + '@s.whatsapp.net';
    }
    return clean;
  }

  /**
   * Send PDF document with Anti-Ban Safe Delay and Human Composing simulation
   */
  async sendSalarySlipDocument({ mobile, pdfBuffer, fileName, caption, employeeName }) {
    if (this.status !== 'connected' || !this.sock) {
      throw new Error('WhatsApp is not connected! Please scan QR code first.');
    }

    const jid = this.formatJid(mobile);

    // 1. Anti-Ban Human Simulation: presence subscribe & composing simulation
    try {
      await this.sock.presenceSubscribe(jid);
      await delay(500);
      await this.sock.sendPresenceUpdate('composing', jid);
      // Wait 2-3 seconds human simulated delay before sending
      await delay(2500);
      await this.sock.sendPresenceUpdate('paused', jid);
    } catch (pErr) {
      // Non-fatal if presence fails
    }

    // 2. Send actual PDF document file
    const result = await this.sock.sendMessage(jid, {
      document: pdfBuffer,
      mimetype: 'application/pdf',
      fileName: fileName || 'Salary_Slip.pdf',
      caption: caption || `📄 Shree RR Trading Company - Salary Slip for ${employeeName}`
    });

    return {
      success: true,
      jid,
      messageId: result?.key?.id,
      timestamp: new Date().toISOString()
    };
  }
}

const whatsappService = new WhatsAppService();

module.exports = {
  whatsappService
};
