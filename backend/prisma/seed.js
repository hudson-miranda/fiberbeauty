const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.attendance.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.attendanceForm.deleteMany();
  await prisma.client.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash('FiberBeauty@2025', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário administrador criado:', { username: admin.username });

  // Criar notificações de exemplo
  const notifications = await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'Bem-vindo ao Sistema!',
        message: 'Seja bem-vindo ao sistema de gerenciamento de fichas de atendimento. Comece criando seus primeiros clientes.',
        type: 'INFO',
      },
      /*{
        userId: admin.id,
        title: 'Sistema Configurado',
        message: 'O sistema foi configurado com sucesso e está pronto para uso.',
        type: 'SUCCESS',
      },
      {
        userId: admin.id,
        title: 'Dica do Sistema',
        message: 'Você pode personalizar as fichas de atendimento acessando o menu Formulários.',
        type: 'INFO',
      },
      {
        userId: admin.id,
        title: 'Backup Recomendado',
        message: 'Recomendamos fazer backup dos dados importantes regularmente.',
        type: 'WARNING',
      },
      {
        userId: admin.id,
        title: 'Atualização Disponível',
        message: 'Uma nova versão do sistema está disponível. Considere atualizar para obter as últimas funcionalidades.',
        type: 'INFO',
      },
      {
        userId: admin.id,
        title: 'Espaço em Disco',
        message: 'O espaço em disco está ficando baixo. Considere fazer limpeza dos arquivos desnecessários.',
        type: 'WARNING',
      },*/
    ],
  });

  console.log('✅ Notificações criadas:', notifications.count);

  // Criar clientes de exemplo
  const clients = await prisma.client.createMany({
    data: [
      {
        firstName: 'Maria',
        lastName: 'Silva',
        cpf: '12345678901',
        isActive: true,
      },
      {
        firstName: 'Ana',
        lastName: 'Santos',
        cpf: '23456789012',
        isActive: true,
      },
      {
        firstName: 'Carla',
        lastName: 'Oliveira',
        cpf: '34567890123',
        isActive: true,
      },
      {
        firstName: 'Juliana',
        lastName: 'Costa',
        cpf: '45678901234',
        isActive: true,
      },
      {
        firstName: 'Fernanda',
        lastName: 'Lima',
        cpf: '56789012345',
        isActive: true,
      },
    ],
  });

  console.log('✅ Clientes criados:', clients.count);

  // Buscar os clientes criados para usar seus IDs
  const createdClients = await prisma.client.findMany({
    where: { isActive: true },
  });

  // Criar formulários de atendimento
  const form1 = await prisma.attendanceForm.create({
    data: {
      name: 'Ficha de Limpeza de Pele',
      description: 'Formulário completo para procedimentos de limpeza de pele',
      isActive: true,
      fields: {
        create: [
          {
            label: 'Tipo de Pele',
            type: 'SELECT',
            options: ['Oleosa', 'Seca', 'Mista', 'Normal', 'Sensível'],
            required: true,
            order: 1,
            isActive: true,
          },
          {
            label: 'Produtos Utilizados',
            type: 'TEXTAREA',
            required: true,
            order: 2,
            isActive: true,
          },
          {
            label: 'Observações',
            type: 'TEXTAREA',
            required: false,
            order: 3,
            isActive: true,
          },
        ],
      },
    },
  });

  const form2 = await prisma.attendanceForm.create({
    data: {
      name: 'Massagem Relaxante',
      description: 'Formulário para procedimentos de massagem',
      isActive: true,
      fields: {
        create: [
          {
            label: 'Tipo de Massagem',
            type: 'SELECT',
            options: ['Relaxante', 'Terapêutica', 'Desportiva', 'Estética'],
            required: true,
            order: 1,
            isActive: true,
          },
          {
            label: 'Duração',
            type: 'SELECT',
            options: ['30 minutos', '60 minutos', '90 minutos'],
            required: true,
            order: 2,
            isActive: true,
          },
          {
            label: 'Óleos Utilizados',
            type: 'TEXT',
            required: false,
            order: 3,
            isActive: true,
          },
        ],
      },
    },
  });

  const form3 = await prisma.attendanceForm.create({
    data: {
      name: 'Design de Sobrancelhas',
      description: 'Formulário para procedimentos de design de sobrancelhas',
      isActive: true,
      fields: {
        create: [
          {
            label: 'Formato Desejado',
            type: 'TEXT',
            required: true,
            order: 1,
            isActive: true,
          },
          {
            label: 'Técnica Utilizada',
            type: 'SELECT',
            options: ['Pinça', 'Cera', 'Linha', 'Navalha'],
            required: true,
            order: 2,
            isActive: true,
          },
          {
            label: 'Coloração',
            type: 'CHECKBOX',
            required: false,
            order: 3,
            isActive: true,
          },
        ],
      },
    },
  });

  console.log('✅ Formulários criados: 3');

  // Criar atendimentos de exemplo (distribuídos nos últimos 3 meses)
  const today = new Date();
  const attendances = [];

  for (let i = 0; i < 25; i++) {
    // Criar datas aleatórias nos últimos 90 dias
    const daysAgo = Math.floor(Math.random() * 90);
    const attendanceDate = new Date(today);
    attendanceDate.setDate(today.getDate() - daysAgo);

    // Selecionar cliente aleatório
    const randomClient = createdClients[Math.floor(Math.random() * createdClients.length)];
    
    // Selecionar formulário aleatório
    const forms = [form1, form2, form3];
    const randomForm = forms[Math.floor(Math.random() * forms.length)];

    attendances.push({
      clientId: randomClient.id,
      userId: admin.id,
      attendanceFormId: randomForm.id,
      responses: {
        'Tipo de Pele': 'Mista',
        'Produtos Utilizados': 'Limpeza com gel, tônico e hidratante',
        'Observações': 'Cliente satisfeita com o resultado'
      },
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      notes: 'Atendimento realizado com sucesso',
      createdAt: attendanceDate,
      updatedAt: attendanceDate,
    });
  }

  await prisma.attendance.createMany({
    data: attendances,
  });

  console.log('✅ Atendimentos criados:', attendances.length);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('👤 Login Admin: admin / FiberBeauty@2025');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
