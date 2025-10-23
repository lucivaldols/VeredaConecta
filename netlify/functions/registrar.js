import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { nome, email, senha } = await req.json();

    // Verificar se email já existe
    const existente = await sql`
      SELECT id FROM usuarios WHERE email = ${email}
    `;

    if (existente.length > 0) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        mensagem: 'Email já cadastrado' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Inserir novo usuário
    const resultado = await sql`
      INSERT INTO usuarios (nome, email, senha)
      VALUES (${nome}, ${email}, ${senha})
      RETURNING id, nome, email, criado_em
    `;

    return new Response(JSON.stringify({ 
      sucesso: true, 
      usuario: resultado[0] 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (erro) {
    console.error('Erro no registro:', erro);
    return new Response(JSON.stringify({ 
      sucesso: false, 
      mensagem: 'Erro ao criar conta' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/api/registrar"
};
