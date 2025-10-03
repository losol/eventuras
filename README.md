# Eventuras - Event and Course Management Solution

![.NET Core CI](https://github.com/losol/eventuras/workflows/.NET%20Core%20CI/badge.svg)
![Docker Image CI](https://github.com/losol/eventuras/workflows/Docker%20Image%20CI/badge.svg)

Event and Course management solution.


## Get started

### Docker

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/).

```bash
# Clone the repository
git clone https://github.com/losol/eventuras.git
cd eventuras

# Build and run the application
docker-compose up
```

The application will now be live at `localhost:5100`.  
Use the following credentials to login:

```text
Username: admin@email.com
Password: Str0ng!PaSsw0rd
```
## AI Development Agents

This project uses specialized AI agent instructions for different parts of the codebase. When working with AI assistants, please refer to the appropriate agent:

- **Backend** (`apps/api`): [.ai/agents/backend-agent.md](.ai/agents/backend-agent.md)
- **Frontend** (`apps/web`, `apps/historia`, `libs/*`): [.ai/agents/frontend-agent.md](.ai/agents/frontend-agent.md)
- **Converto** (`apps/convertoapi`): [.ai/agents/converto-agent.md](.ai/agents/converto-agent.md)

See [.ai/README.md](.ai/README.md) for more details.
