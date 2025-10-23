import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { nome, email, senha, cpf, endereco, telefone } = await req.json();

    // Validações básicas
    if (!nome || !email || !senha) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        mensagem: 'Nome, email e senha são obrigatórios' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        mensagem: 'Email inválido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tamanho mínimo da senha
    if (senha.length < 6) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        mensagem: 'A senha deve ter no mínimo 6 caracteres' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se email já existe
    const existente = await sql`
      SELECT id FROM usuarios WHERE email = ${email}
    `;

    if (existente.length > 0) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        mensagem: 'Este email já está cadastrado' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se CPF já existe (se foi fornecido)
    if (cpf) {
      const cpfExistente = await sql`
        SELECT id FROM usuarios WHERE cpf = ${cpf}
      `;
      
      if (cpfExistente.length > 0) {
        return new Response(JSON.stringify({ 
          sucesso: false, 
          mensagem: 'Este CPF já está cadastrado' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Inserir novo usuário
    const resultado = await sql`
      INSERT INTO usuarios (nome, email, senha, cpf, endereco, telefone)
      VALUES (${nome}, ${email}, ${senha}, ${cpf || null}, ${endereco || null}, ${telefone || null})
      RETURNING id, nome, email, cpf, endereco, telefone, criado_em
    `;

    return new Response(JSON.stringify({ 
      sucesso: true,
      mensagem: 'Conta criada com sucesso!',
      usuario: resultado[0] 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    return new Response(JSON.stringify({ 
      sucesso: false, 
      mensagem: 'Erro ao criar conta. Tente novamente.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/api/registrar"
};
