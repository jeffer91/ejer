interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
}

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null, { status: 204, headers: corsHeaders() });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = context.request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return json({ ok: false, error: 'Sesión requerida.' }, 401);

    const userResponse = await fetch(`${context.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: auth, apikey: context.env.SUPABASE_PUBLISHABLE_KEY },
    });
    if (!userResponse.ok) return json({ ok: false, error: 'Sesión no válida.' }, 401);

    const body = await context.request.json<{ context?: unknown }>();
    const model = context.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const system = 'Eres un asistente de bienestar para una app de entrenamiento. Da una recomendación breve, prudente y sostenible. No diagnostiques, no prometas resultados y evita extremos. Responde en español con máximo 120 palabras y una acción pequeña para hoy.';
    const prompt = `${system}\n\nDatos recientes del usuario:\n${JSON.stringify(body.context || {})}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(context.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    const data = await response.json<any>();
    if (!response.ok) return json({ ok: false, error: data?.error?.message || 'Error de IA.' }, 502);
    const recommendation = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('\n').trim();
    if (!recommendation) return json({ ok: false, error: 'La IA no devolvió contenido.' }, 502);
    return json({ ok: true, recommendation });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : 'Error inesperado.' }, 500);
  }
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
