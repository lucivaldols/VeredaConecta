import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { email, senha } = await req.json();

    const usuarios = await sql`
      SELECT id, nome, email, criado_em 
      FROM usuarios 
      WHERE email = ${email} AND senha = ${senha}
    `;

    if (usuarios.length === 0) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        mensagem: 'Email ou senha incorretos' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      sucesso: true, 
      usuario: usuarios[0] 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (erro) {
    console.error('Erro no login:', erro);
    return new Response(JSON.stringify({ 
      sucesso: false, 
      mensagem: 'Erro interno' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: "/api/login" };
