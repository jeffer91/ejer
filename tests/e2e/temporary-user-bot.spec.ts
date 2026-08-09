import { expect, test } from '@playwright/test';

test('bot temporal recorre el flujo principal como usuario invitado', async ({ page, context }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByText('Fitness Jeff', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu día, sin complicaciones' })).toBeVisible();

  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
  });

  // Registro rápido de agua.
  await page.getByRole('button', { name: '+ 250 ml' }).click();
  await expect(page.getByText('1 vasos', { exact: true })).toBeVisible();

  // Progreso: peso y una medida.
  await page.getByRole('button', { name: 'Progreso', exact: true }).click();
  await page.getByLabel('Peso actual (kg)').fill('70.5');
  await page.getByRole('button', { name: 'Guardar peso' }).click();
  await expect(page.getByText('70.5 kg', { exact: true }).first()).toBeVisible();

  await page.getByLabel('Cintura (cm)').fill('80');
  await page.getByRole('button', { name: 'Guardar medida' }).click();
  await expect(page.getByText('1 mediciones corporales', { exact: true })).toBeVisible();

  // IndexedDB debe persistir tras recargar.
  await page.reload();
  await page.getByRole('button', { name: 'Progreso', exact: true }).click();
  await expect(page.getByText('70.5 kg', { exact: true }).first()).toBeVisible();

  // Aislamiento: un registro local perteneciente a otro UID no debe mostrarse.
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('fitness-jeff-v1', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const now = new Date().toISOString();
    const id = '11111111-1111-4111-8111-111111111111';
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('records', 'readwrite');
      tx.objectStore('records').put({
        key: `body_records:${id}`,
        table: 'body_records',
        data: { id, user_id: '22222222-2222-4222-8222-222222222222', weight_kg: 99.9, created_at: now, updated_at: now, deleted_at: null },
        updatedAt: now,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload();
  await page.getByRole('button', { name: 'Progreso', exact: true }).click();
  await expect(page.getByText('70.5 kg', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('99.9 kg', { exact: true })).toHaveCount(0);

  // Entrenamiento: completar la sesión y comprobar que Inicio se actualiza.
  await page.getByRole('button', { name: 'Entrenar', exact: true }).click();
  const exercises = page.locator('.exercise');
  const count = await exercises.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) await exercises.nth(i).click();
  await page.getByRole('button', { name: 'Finalizar entrenamiento' }).click();
  await expect(page.getByRole('button', { name: 'Guardado ✓' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardado ✓' })).toBeDisabled();

  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entrenamiento completado' })).toBeVisible();

  // La app debe seguir funcionando y recargando sin Internet gracias a PWA + IndexedDB.
  await context.setOffline(true);
  await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '+ 250 ml' }).click();
  await expect(page.getByText('2 vasos', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Fitness Jeff', { exact: true })).toBeVisible();
  await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible();
  await expect(page.getByText('2 vasos', { exact: true })).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByText('En línea', { exact: true })).toBeVisible();

  // Estado y modo invitado.
  await page.getByRole('button', { name: 'Más', exact: true }).click();
  await expect(page.getByText('Modo invitado', { exact: true })).toBeVisible();
  await expect(page.getByText('Sin configurar', { exact: true })).toBeVisible();

  // Sin cuenta, IA queda correctamente bloqueada y explica el motivo.
  await page.getByRole('button', { name: 'IA', exact: true }).click();
  await expect(page.getByText('Inicia sesión con Google para habilitar IA.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generar recomendación' })).toBeDisabled();

  expect(pageErrors, `Errores JavaScript detectados: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(consoleErrors, `Errores de consola detectados: ${consoleErrors.join(' | ')}`).toEqual([]);
});
