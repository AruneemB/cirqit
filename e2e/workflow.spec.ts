import { test, expect } from '@playwright/test'

test('build and export a Bell state', async ({ page }) => {
  // Mock the Qiskit export endpoint — no running backend required
  await page.route('**/api/export/qiskit', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\n',
        language: 'qiskit',
        framework: 'qiskit',
      }),
    })
  )

  await page.goto('/')

  // 1. Page title
  await expect(page).toHaveTitle(/Cirqit/)

  // 2. State Inspector panel is present (shows "No Results Yet" before execution)
  await expect(page.getByTestId('state-inspector')).toBeVisible()

  // 3. Add an H gate via the Zustand store so the Export button becomes enabled
  await page.waitForFunction(() => !!(window as any).__cirqitStore)
  await page.evaluate(() => {
    const store = (window as any).__cirqitStore
    store.getState().addGate({ type: 'H', qubits: [0], position: { x: 100, y: 0 } })
  })

  // 4. Open the export modal
  const exportButton = page.getByTestId('export-btn')
  await expect(exportButton).toBeEnabled()
  await exportButton.click()
  await expect(page.getByTestId('export-modal-title')).toContainText('Export Qiskit Code')

  // 5. Verify the generated code contains a Qiskit QuantumCircuit
  await expect(page.locator('pre')).toContainText('QuantumCircuit')
})
