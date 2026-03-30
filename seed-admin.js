// seed-admin.js
// Ejecutar UNA sola vez para crear el primer usuario ADMIN:
//   node seed-admin.js
//
// Requiere que la BD esté corriendo y .env configurado.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_NOMBRE   = 'Admin Sistema';
const ADMIN_EMAIL    = 'admin@pcforum.edu';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  const existe = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existe) {
    console.log('⚠️  Ya existe un usuario con ese email. Nada que hacer.');
    return;
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: { nombre: ADMIN_NOMBRE, email: ADMIN_EMAIL, password: hash, rol: 'ADMIN' },
  });

  console.log('✅ Admin creado correctamente:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   ID:       ${admin.id}`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());