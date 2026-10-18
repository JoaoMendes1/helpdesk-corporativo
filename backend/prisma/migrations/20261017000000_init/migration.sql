-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `perfil` ENUM('SOLICITANTE', 'APROVADOR') NOT NULL DEFAULT 'SOLICITANTE',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dtCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `status` ENUM('DISPONIVEL', 'EMPRESTADO', 'MANUTENCAO', 'INATIVO') NOT NULL DEFAULT 'DISPONIVEL',
    `dtCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criadoPorId` INTEGER NOT NULL,

    INDEX `equipamentos_status_tipo_idx`(`status`, `tipo`),
    INDEX `equipamentos_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitanteId` INTEGER NOT NULL,
    `equipamentoId` INTEGER NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `marcaSolicitada` VARCHAR(191) NULL,
    `modeloSolicitado` VARCHAR(191) NULL,
    `tipoSolicitado` VARCHAR(191) NULL,
    `status` ENUM('PENDENTE', 'APROVADA', 'RECUSADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `observacao` TEXT NULL,
    `dtSolicitacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dtDecisao` DATETIME(3) NULL,
    `aprovadorId` INTEGER NULL,

    INDEX `solicitacoes_solicitanteId_status_idx`(`solicitanteId`, `status`),
    INDEX `solicitacoes_aprovadorId_status_idx`(`aprovadorId`, `status`),
    INDEX `solicitacoes_status_dtSolicitacao_idx`(`status`, `dtSolicitacao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_solicitacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitacaoId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `statusAnterior` ENUM('PENDENTE', 'APROVADA', 'RECUSADA', 'CANCELADA') NULL,
    `statusNovo` ENUM('PENDENTE', 'APROVADA', 'RECUSADA', 'CANCELADA') NOT NULL,
    `observacao` TEXT NULL,
    `dtRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historico_solicitacoes_solicitacaoId_dtRegistro_idx`(`solicitacaoId`, `dtRegistro`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes` ADD CONSTRAINT `solicitacoes_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes` ADD CONSTRAINT `solicitacoes_aprovadorId_fkey` FOREIGN KEY (`aprovadorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes` ADD CONSTRAINT `solicitacoes_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_solicitacoes` ADD CONSTRAINT `historico_solicitacoes_solicitacaoId_fkey` FOREIGN KEY (`solicitacaoId`) REFERENCES `solicitacoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_solicitacoes` ADD CONSTRAINT `historico_solicitacoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

