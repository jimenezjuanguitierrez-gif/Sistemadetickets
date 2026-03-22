Lo que Thiago tiene que hacer una sola vez en el servidor de la escuela:

Instalar Node.js y PostgreSQL en 192.168.0.31
Crear la base de datos:

sqlCREATE DATABASE helpdesk_db;

Clonar el repo y configurar el .env
Ejecutar:

bashnpm install
npm run prisma:migrate
npm run start
```

---

**Para acceder al sistema desde cualquier computadora de la escuela**, conectados por cable o por el WiFi de la escuela, simplemente entran al navegador y ponen:
```
http://192.168.0.31:3000/api/health
Si responde { success: true } — el sistema está funcionando para toda la escuela.