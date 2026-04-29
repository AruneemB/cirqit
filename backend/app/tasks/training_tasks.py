from app.celery_app import celery_app
from app.models.training import CircuitContext
from app.services.gradient_engine import compute_expectation_value, compute_gradients_parameter_shift
from app.services.optimizers import ADAMOptimizer
from typing import Dict, List
import time


@celery_app.task(bind=True)
def train_circuit(
    self,
    context_dict: dict,
    learning_rate: float = 0.01,
    max_iterations: int = 100,
    convergence_threshold: float = 1e-6
) -> Dict:
    """
    Async training task using ADAM optimizer.

    Returns:
        Dict with final parameters, loss history, and metadata
    """
    context = CircuitContext(**context_dict)
    optimizer = ADAMOptimizer(learning_rate=learning_rate)

    loss_history: List[float] = []
    parameter_history: List[Dict[str, float]] = []

    current_params = {
        name: param.value
        for name, param in context.parameters.items()
        if param.isTrainable
    }

    for iteration in range(max_iterations):
        loss = compute_expectation_value(context)
        gradients = compute_gradients_parameter_shift(context)

        loss_history.append(loss)
        parameter_history.append(current_params.copy())

        self.update_state(
            state='PROGRESS',
            meta={
                'current': iteration + 1,
                'total': max_iterations,
                'loss': loss,
                'parameters': current_params
            }
        )

        if iteration > 0 and abs(loss_history[-1] - loss_history[-2]) < convergence_threshold:
            break

        current_params = optimizer.step(current_params, gradients)

        for param_name, new_value in current_params.items():
            context.parameters[param_name].value = new_value
            for mapping in context.parameterMappings:
                if mapping.parameterName == param_name:
                    for gate in context.circuit.gates:
                        if gate.id == mapping.gateId:
                            gate.params[mapping.paramIndex] = new_value

        time.sleep(0.01)

    return {
        'status': 'completed',
        'final_loss': loss_history[-1],
        'final_parameters': current_params,
        'loss_history': loss_history,
        'parameter_history': parameter_history,
        'iterations': len(loss_history)
    }
