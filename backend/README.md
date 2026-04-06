# Cirqit Backend

FastAPI + Qiskit backend for quantum circuit execution and LLM-powered explanations.

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** `qiskit-aer` is commented out in `requirements.txt` due to C++ compilation requirements on Windows. It can be installed separately if you have Visual Studio or CMake configured. For basic quantum simulation, Qiskit's built-in statevector simulator is sufficient.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `OPENROUTER_API_KEY`: API key for OpenRouter LLM gateway
- `GEMINI_API_KEY`: Google Gemini API key for gate explanations
- `REDIS_URL`: Redis connection URL (default: `redis://localhost:6379`)

## Development

### Run Dev Server

```bash
make run
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at http://localhost:8000

API docs: http://localhost:8000/docs

### Run Tests

```bash
make test
# or
pytest -v --cov=app --cov-report=term-missing
```

### Make Commands

- `make install` - Install dependencies
- `make test` - Run tests with coverage
- `make run` - Start development server

## API Endpoints

### Health Check

```
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

## Architecture

- **FastAPI**: Modern async web framework with automatic OpenAPI docs
- **Qiskit**: IBM's quantum computing SDK for circuit simulation
- **Pydantic**: Data validation and serialization
- **pytest**: Testing framework with async support
- **Celery + Redis**: Async task queue for long-running simulations (planned)

## Next Steps

- Add circuit execution endpoints (P1.08)
- Implement Qiskit simulator integration
- Add code generation endpoints (P1.14)
- Integrate LLM gateway for explanations (P1.16)
