import { apiBaseUrl } from './platform';
import { getSession } from './supabase';

export async function requestRecommendation(context: Record<string, unknown>): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error('Inicia sesión con Google para usar la IA.');
  const response = await fetch(`${apiBaseUrl()}/api/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ context }),
  });
  const data = (await response.json()) as { ok?: boolean; recommendation?: string; error?: string };
  if (!response.ok || !data.ok || !data.recommendation) throw new Error(data.error || 'No se pudo generar la recomendación.');
  return data.recommendation;
}
