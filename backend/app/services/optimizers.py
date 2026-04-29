import numpy as np
from typing import Dict


class ADAMOptimizer:
    """ADAM optimizer for quantum circuit training"""

    def __init__(
        self,
        learning_rate: float = 0.01,
        beta1: float = 0.9,
        beta2: float = 0.999,
        epsilon: float = 1e-8
    ):
        self.lr = learning_rate
        self.beta1 = beta1
        self.beta2 = beta2
        self.epsilon = epsilon

        self.m: Dict[str, float] = {}  # First moment
        self.v: Dict[str, float] = {}  # Second moment
        self.t = 0  # Time step

    def step(self, parameters: Dict[str, float], gradients: Dict[str, float]) -> Dict[str, float]:
        """
        Perform one optimization step.

        Args:
            parameters: Current parameter values
            gradients: Gradient for each parameter

        Returns:
            Updated parameter values
        """
        self.t += 1
        updated_params = {}

        for param_name, current_value in parameters.items():
            if param_name not in gradients:
                updated_params[param_name] = current_value
                continue

            grad = gradients[param_name]

            if param_name not in self.m:
                self.m[param_name] = 0.0
                self.v[param_name] = 0.0

            self.m[param_name] = self.beta1 * self.m[param_name] + (1 - self.beta1) * grad
            self.v[param_name] = self.beta2 * self.v[param_name] + (1 - self.beta2) * (grad ** 2)

            m_hat = self.m[param_name] / (1 - self.beta1 ** self.t)
            v_hat = self.v[param_name] / (1 - self.beta2 ** self.t)

            updated_params[param_name] = current_value - self.lr * m_hat / (np.sqrt(v_hat) + self.epsilon)

        return updated_params
