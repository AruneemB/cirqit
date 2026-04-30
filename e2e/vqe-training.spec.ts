import { test, expect } from '@playwright/test'

const SSE_EVENTS = [
  'event: progress\ndata: {"current":1,"total":10,"loss":0.9542,"parameters":{"theta_0":0.1}}\n\n',
  'event: progress\ndata: {"current":3,"total":10,"loss":0.6871,"parameters":{"theta_0":0.4}}\n\n',
  'event: progress\ndata: {"current":5,"total":10,"loss":0.4213,"parameters":{"theta_0":0.7}}\n\n',
  'event: progress\ndata: {"current":7,"total":10,"loss":0.2654,"parameters":{"theta_0":1.0}}\n\n',
  'event: progress\ndata: {"current":9,"total":10,"loss":0.1498,"parameters":{"theta_0":1.2}}\n\n',
  'event: progress\ndata: {"current":10,"total":10,"loss":0.1105,"parameters":{"theta_0":1.3}}\n\n',
  'event: completed\ndata: {"status":"completed","final_loss":0.1105,"final_parameters":{"theta_0":1.3},"loss_history":[0.9542,0.6871,0.4213,0.2654,0.1498,0.1105],"iterations":10}\n\n',
].join('')

test('full VQE training workflow — build, train, verify convergence, export', async ({ page }) => {
  // Mock training start endpoint
  await page.route('**/api/training/start', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jobId: 'mock-vqe-job', status: 'pending' }),
    })
  )

  // Mock SSE training stream — Playwright intercepts EventSource (GET) and returns all events at once
  await page.route('**/api/training/stream/mock-vqe-job', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
      body: SSE_EVENTS,
    })
  )

  // Mock Qiskit export endpoint
  await page.route('**/api/export/qiskit', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: [
          'from qiskit import QuantumCircuit',
          'from qiskit.circuit import ParameterVector',
          '',
          'theta = ParameterVector("theta", 2)',
          'qc = QuantumCircuit(2)',
          'qc.ry(theta[0], 0)',
          'qc.ry(theta[1], 1)',
          'qc.cx(0, 1)',
        ].join('\n'),
        language: 'python',
        framework: 'qiskit',
      }),
    })
  )

  await page.goto('/')
  await expect(page).toHaveTitle(/Cirqit/)

  // Wait for Zustand store to be exposed
  await page.waitForFunction(() => !!(window as any).__cirqitStore)

  // ── Step 1: Build ansatz circuit with two RY gates ──────────────────────────
  await page.evaluate(() => {
    const store = (window as any).__cirqitStore
    store.getState().clearCircuit()
    store.getState().addGate({ type: 'RY', qubits: [0], params: [0], position: { x: 100, y: 0 } })
    store.getState().addGate({ type: 'RY', qubits: [1], params: [0], position: { x: 100, y: 100 } })
  })

  const gateCount = await page.evaluate(() =>
    (window as any).__cirqitStore.getState().circuit.gates.length
  )
  expect(gateCount).toBe(2)

  // ── Step 2: Create trainable parameters ─────────────────────────────────────
  await page.evaluate(() => {
    const store = (window as any).__cirqitStore
    store.getState().createParameter('theta_0', 0, true)
    store.getState().createParameter('theta_1', 0, true)
  })

  const paramCount = await page.evaluate(() =>
    Object.keys((window as any).__cirqitStore.getState().parameters).length
  )
  expect(paramCount).toBe(2)

  // ── Step 3: Link parameters to gates ────────────────────────────────────────
  await page.evaluate(() => {
    const store = (window as any).__cirqitStore
    const gates = store.getState().circuit.gates
    store.getState().linkGateToParameter(gates[0].id, 0, 'theta_0')
    store.getState().linkGateToParameter(gates[1].id, 0, 'theta_1')
  })

  const mappingCount = await page.evaluate(() =>
    (window as any).__cirqitStore.getState().parameterMappings.length
  )
  expect(mappingCount).toBe(2)

  // Verify gate params were updated to parameter values
  const gateParamsAfterLink = await page.evaluate(() => {
    const state = (window as any).__cirqitStore.getState()
    return state.circuit.gates.map((g: any) => g.params?.[0])
  })
  expect(gateParamsAfterLink).toEqual([0, 0])

  // ── Step 4: Define H₂ Hamiltonian observable ────────────────────────────────
  await page.evaluate(() => {
    const store = (window as any).__cirqitStore
    store.getState().setObservable({
      name: 'H2',
      terms: [
        { coefficient: -1.0523, paulis: ['I', 'I'] },
        { coefficient:  0.3979, paulis: ['Z', 'I'] },
        { coefficient: -0.3979, paulis: ['I', 'Z'] },
        { coefficient: -0.0112, paulis: ['Z', 'Z'] },
        { coefficient:  0.1809, paulis: ['X', 'X'] },
      ],
    })
  })

  const observableSet = await page.evaluate(
    () => !!(window as any).__cirqitStore.getState().observable
  )
  expect(observableSet).toBe(true)

  // ── Step 5: Start training ───────────────────────────────────────────────────
  await page.evaluate(async () => {
    const store = (window as any).__cirqitStore
    await store.getState().startTraining({ learningRate: 0.01, maxIterations: 10 })
  })

  // ── Step 6: Wait for training to converge (isTraining → false) ──────────────
  await page.waitForFunction(
    () => !(window as any).__cirqitStore.getState().training.isTraining,
    { timeout: 10000 }
  )

  // ── Step 7: Verify loss decreased over training ──────────────────────────────
  const trainingResult = await page.evaluate(() => {
    const { lossHistory, currentIteration } = (
      window as any
    ).__cirqitStore.getState().training
    return { lossHistory, currentIteration }
  })

  expect(trainingResult.lossHistory.length).toBeGreaterThan(1)
  expect(trainingResult.lossHistory[trainingResult.lossHistory.length - 1]).toBeLessThan(
    trainingResult.lossHistory[0]
  )
  expect(trainingResult.currentIteration).toBeGreaterThan(0)

  // ── Step 8: Export trained circuit via the UI ────────────────────────────────
  const exportButton = page.getByTestId('export-btn')
  await expect(exportButton).toBeEnabled()
  await exportButton.click()

  await expect(page.getByTestId('export-modal-title')).toContainText('Export Qiskit Code')
  await expect(page.getByTestId('export-code-block')).toContainText('QuantumCircuit')
})
