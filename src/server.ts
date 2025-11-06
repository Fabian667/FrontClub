import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import multer from 'multer';
import { setInterval as scheduleInterval } from 'node:timers';

const browserDistFolder = join(import.meta.dirname, '../browser');
const uploadsFolder = join(import.meta.dirname, '../public/uploads');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Keepalive: realiza un GET periódico a https://backclub.onrender.com/
 * para evitar que el backend entre en suspensión cuando no hay clientes activos.
 */
function scheduleKeepAlive() {
  const url = 'https://backclub.onrender.com/';
  const intervalMs = 5 * 60 * 1000; // 5 minutos

  const ping = async () => {
    try {
      // Usamos fetch de Node (disponible en Node 18+) sin opciones especiales.
      await fetch(url, { method: 'GET' });
    } catch {
      // Silenciamos errores para no ensuciar logs ni romper el proceso.
    }
  };

  // Disparo inicial y programación periódica.
  ping();
  scheduleInterval(ping, intervalMs);
}

// Programar el keepalive al cargar el módulo.
scheduleKeepAlive();

// Servir imágenes subidas desde /public/uploads
app.use('/uploads', express.static(uploadsFolder, { maxAge: '1y' }));

// Endpoint de subida de imágenes
const storage = multer.diskStorage({
  destination: uploadsFolder,
  filename: (req: any, file: any, cb: any) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = (file?.originalname || '').split('.').pop();
    cb(null, `${unique}.${ext || 'bin'}`);
  },
});
const upload = multer({ storage });
app.post('/api/upload', upload.single('file'), (req: any, res) => {
  const filename = req?.file?.filename;
  res.json({ path: `/uploads/${filename}` });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
