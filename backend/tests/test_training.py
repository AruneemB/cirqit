import pytest
from app.services.optimizers import ADAMOptimizer


def test_adam_optimizer():
    optimizer = ADAMOptimizer(learning_rate=0.1)

    params = {'theta': 0.5}
    gradients = {'theta': 0.2}

    updated = optimizer.step(params, gradients)

    assert updated['theta'] < params['theta']


def test_adam_convergence():
    optimizer = ADAMOptimizer(learning_rate=0.1)

    params = {'theta': 1.0}

    for _ in range(50):
        gradients = {'theta': params['theta']}
        params = optimizer.step(params, gradients)

    assert abs(params['theta']) < 0.1


def test_adam_skips_missing_gradient():
    optimizer = ADAMOptimizer(learning_rate=0.1)

    params = {'theta': 0.5, 'phi': 1.0}
    gradients = {'theta': 0.2}

    updated = optimizer.step(params, gradients)

    assert updated['phi'] == 1.0
    assert updated['theta'] < 0.5


def test_adam_moment_accumulation():
    optimizer = ADAMOptimizer(learning_rate=0.01)

    params = {'theta': 1.0}
    gradients = {'theta': 1.0}

    for _ in range(5):
        params = optimizer.step(params, gradients)

    assert optimizer.t == 5
    assert 'theta' in optimizer.m
    assert 'theta' in optimizer.v
