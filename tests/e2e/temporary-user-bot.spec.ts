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

  // Entrenamiento: completar la sesión y comprobar que Inicio se actualiza.
  await page.getByRole('button', { name: 'Entrenar', exact: true }).click();
  const exercises = page.locator('.exercise');
  const count = await exercises.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) await exercises.nth(i).click();
  await page.getByRole('button', { name: 'Finalizar entrenamiento' }).click();
  await expect(page.getByRole('button', { name: 'Guardado ✓' })).toBeVisible();

  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Entrenamiento completado' })).toBeVisible();

  // La app debe seguir registrando localmente sin Internet.
  await context.setOffline(true);
  await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '+ 250 ml' }).click();
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
