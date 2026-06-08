
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const projects = await prisma.project.findMany();
    console.log('Projects:', projects.map(p => ({ id: p.id, name: p.name, apiKey: p.apiKey })));
    process.exit(0);
}
run();
