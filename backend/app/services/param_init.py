import math
import random
from typing import Dict, List, Literal, Optional

InitStrategy = Literal['random_uniform', 'random_normal', 'xavier', 'he', 'zeros', 'identity']


def _seeded_rng(seed: Optional[int]) -> random.Random:
    rng = random.Random()
    if seed is not None:
        rng.seed(seed)
    return rng


def initialize_parameter(
    strategy: InitStrategy,
    seed: Optional[int] = None,
    fan_in: int = 1,
    fan_out: int = 1,
) -> float:
    rng = _seeded_rng(seed)

    if strategy == 'random_uniform':
        return rng.uniform(0, 2 * math.pi)

    elif strategy == 'random_normal':
        return rng.gauss(0.0, 0.1)

    elif strategy == 'xavier':
        if fan_in + fan_out <= 0:
            raise ValueError("fan_in + fan_out must be > 0 for Xavier initialization")
        limit = math.sqrt(6.0 / (fan_in + fan_out))
        return rng.uniform(-limit, limit)

    elif strategy == 'he':
        if fan_in <= 0:
            raise ValueError("fan_in must be > 0 for He initialization")
        std = math.sqrt(2.0 / fan_in)
        return rng.gauss(0.0, std)

    elif strategy == 'zeros':
        return 0.0

    elif strategy == 'identity':
        return math.pi / 2

    raise ValueError(f"Unknown initialization strategy: {strategy}")


def initialize_parameters(
    names: List[str],
    strategy: InitStrategy,
    seed: Optional[int] = None,
    fan_in: Optional[int] = None,
    fan_out: Optional[int] = None,
) -> Dict[str, float]:
    n = len(names)
    fi = fan_in if fan_in is not None else n
    fo = fan_out if fan_out is not None else n

    result: Dict[str, float] = {}
    for i, name in enumerate(names):
        param_seed = (seed + i) if seed is not None else None
        result[name] = initialize_parameter(strategy, seed=param_seed, fan_in=fi, fan_out=fo)
    return result
