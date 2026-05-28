# Core Capabilities & Code Blueprints

## 1. Clean Architecture Folder Structure
Always enforce and maintain the following project structure:
src/
├── domain/                # Entities, Value Objects, and Repository Interfaces
│   ├── entities/          # Pet, User, Chat, AdoptionRequest
│   └── repositories/      # Interface contracts (IPetRepository, IAuthRepository)
├── application/           # Use Cases & state managers
│   ├── use-cases/         # AuthenticateUser, RegisterPet, SubmitAdoption
│   └── store/             # Contexts / Zustand stores
└── infrastructure/        # Framework-specific implementations, APIs, and UI
├── api/               # Gemini client, Supabase client
├── repositories/      # Concrete repository implementations (SupabasePetRepository)
└── ui/                # Screns, Components, Layouts, Forms, Animations
