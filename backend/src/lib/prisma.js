const { PrismaClient } = require('@prisma/client')

// Uma instancia para a aplicação - O PrismaClient Abre o seu próprio pool de conexões 
const prisma = new PrismaClient()

module.exports = prisma