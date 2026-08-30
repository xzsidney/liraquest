import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sequelize from './server/config/database';
import familyRoutes from './server/routes/familyRoutes';
import authRoutes from './server/routes/authRoutes';
import { initFamilySocket } from './server/sockets/familySocketService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Configura Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir uploads de fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir sprites MUGEN
app.use('/sprites', express.static(path.join(__dirname, 'public/sprites')));

// Rotas da API
app.use('/api/family', familyRoutes);
app.use('/api/auth', authRoutes);

// Inicializa os WebSockets da Raid em Família
initFamilySocket(io);

// Servir Frontend em Produção (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback SPA para Vue Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Inicialização do Banco e Servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ [LiraQuest Database] Conectado ao MySQL com sucesso!');
    
    server.listen(port, () => {
      console.log(`🏰 [LiraQuest Server] Rodando na porta ${port} | http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ [LiraQuest Database] Erro ao conectar:', error);
  }
}

startServer();
