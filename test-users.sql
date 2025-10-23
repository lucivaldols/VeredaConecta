-- SQL para criar 3 usuários de teste com diferentes níveis de acesso
-- Execute estes comandos no Neon Console

-- 1. ADMIN - Acesso completo ao sistema
INSERT INTO usuarios (nome, email, senha, role, cpf, endereco, telefone)
VALUES ('Admin Sistema', 'admin@community.com', 'senha123', 'admin', '111.111.111-11', 'Rua Principal, 100', '(31) 99999-0001');

-- 2. GESTOR DE PROJETOS - Acesso a Dashboard, Perfil, Projetos, Criativo, Chat
INSERT INTO usuarios (nome, email, senha, role, cpf, endereco, telefone)
VALUES ('Gestor de Projetos', 'gestor@community.com', 'senha123', 'projectManager', '222.222.222-22', 'Rua Secundária, 200', '(31) 99999-0002');

-- 3. MEMBRO - Acesso básico: Dashboard, Perfil, Chat
INSERT INTO usuarios (nome, email, senha, role, cpf, endereco, telefone)
VALUES ('Membro Comum', 'membro@community.com', 'senha123', 'member', '333.333.333-33', 'Rua Terciária, 300', '(31) 99999-0003');

-- CREDENCIAIS DE TESTE:
-- Admin:   admin@community.com / senha123
-- Gestor:  gestor@community.com / senha123
-- Membro:  membro@community.com / senha123
