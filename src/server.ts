import https from "https";
import http from "http";
import http2 from "http2";


interface ServerOptions {
  port?: number;
  hostname?: string;
  http2?: boolean;
  https?: {
    allowHTTP1?: boolean;
    key: string;
    cert: string;
  };
}

class Server {
  private instance!: http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer;
  private options!: ServerOptions;
  private handler!: (req: any, res: any) => void;

  init(handler: (req: any, res: any) => void, options?: ServerOptions){
    this.handler = handler;
    this.options = options || {};

    this.instance = this.create();
  }

  listen(cb?: () => void) {
    if (!this.options.hostname) {
      this.instance.listen(this.options.port || 8000, cb);
    } else {
      this.instance.listen(this.options.port || 8000, this.options.hostname, cb);
    }
  }

  close(cb?: ((err?: Error | undefined) => void)) {
    if (this.instance) {
      this.instance.close(() => {
        setTimeout(cb as () => void, 100);
      });
    }
  }

  private create() {
    if (this.options.https) {
      const httpsSettings = {
        key: this.options.https.key,
        cert: this.options.https.cert,
      };
      if (this.options.http2) {
        return http2.createSecureServer({
          ...httpsSettings,
          allowHTTP1: typeof this.options.https.allowHTTP1 === "boolean" ? this.options.https.allowHTTP1 : true
        }, this.handler);
      } else {
        return https.createServer(httpsSettings, this.handler)
      }
    } else if (this.options.http2) {
      return http2.createServer(this.handler)
    } else {
      return http.createServer(this.handler)
    }
  }
}

export {
  Server,
  ServerOptions
}
