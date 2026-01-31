# Portfolio Forge Architecture Diagrams

This document contains visual representations of the Portfolio Forge system architecture using Mermaid diagrams.

## Table of Contents

- [System Overview](#system-overview)
- [Application Layers](#application-layers)
- [Authentication Flow](#authentication-flow)
- [API Request Flow](#api-request-flow)
- [AI System Architecture](#ai-system-architecture)
- [Portfolio Builder Flow](#portfolio-builder-flow)
- [Database Schema](#database-schema)
- [Component Hierarchy](#component-hierarchy)

---

## System Overview

High-level view of the Portfolio Forge system and external integrations.

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[React UI Components]
        State[React Context/State]
    end

    subgraph NextJS["Next.js App Router"]
        Pages[Pages & Layouts]
        API[API Routes /api/v1/*]
        Middleware[Auth Middleware]
    end

    subgraph External["External Services"]
        Supabase[(Supabase)]
        Groq[Groq AI API]
        Storage[Supabase Storage]
    end

    UI --> Pages
    UI --> API
    State --> UI
    Pages --> Middleware
    API --> Middleware
    Middleware --> Supabase
    API --> Groq
    API --> Storage
    Supabase --> Storage
```

---

## Application Layers

The layered architecture of Portfolio Forge.

```mermaid
flowchart TB
    subgraph Presentation["Presentation Layer"]
        direction LR
        Pages["App Pages"]
        Components["UI Components"]
        Templates["Portfolio Templates"]
    end

    subgraph Business["Business Logic Layer"]
        direction LR
        Hooks["Custom Hooks"]
        Context["React Context"]
        Actions["Server Actions"]
    end

    subgraph API["API Layer"]
        direction LR
        Routes["API Routes"]
        Handler["Route Handler"]
        Validation["Zod Validation"]
        RateLimit["Rate Limiter"]
    end

    subgraph Integration["Integration Layer"]
        direction LR
        Supabase["Supabase Client"]
        AI["AI Provider"]
        Storage["Storage Client"]
    end

    subgraph Data["Data Layer"]
        direction LR
        DB[(PostgreSQL)]
        Files[(File Storage)]
    end

    Presentation --> Business
    Business --> API
    API --> Integration
    Integration --> Data
```

---

## Authentication Flow

OAuth authentication flow with Supabase.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS as Next.js App
    participant Middleware
    participant Supabase
    participant Provider as OAuth Provider

    User->>Browser: Click Login
    Browser->>NextJS: GET /auth/login
    NextJS->>Supabase: signInWithOAuth()
    Supabase->>Provider: Redirect to OAuth
    Provider->>User: Show Login Form
    User->>Provider: Enter Credentials
    Provider->>Supabase: Auth Code
    Supabase->>NextJS: Redirect /auth/callback
    NextJS->>Supabase: exchangeCodeForSession()
    Supabase-->>NextJS: Session Token
    NextJS->>Browser: Set Cookie & Redirect
    
    Note over Browser,Middleware: Subsequent Requests
    Browser->>Middleware: Request with Cookie
    Middleware->>Supabase: Validate Session
    Supabase-->>Middleware: User Data
    Middleware->>NextJS: Authorized Request
```

---

## API Request Flow

How API requests are processed through the middleware stack.

```mermaid
flowchart LR
    subgraph Request["Incoming Request"]
        Req[HTTP Request]
    end

    subgraph Middleware["Middleware Stack"]
        direction TB
        M1[Auth Check]
        M2[Rate Limiter]
        M3[Validation]
    end

    subgraph Handler["Route Handler"]
        direction TB
        H1[withApiHandler]
        H2[Business Logic]
        H3[Database Query]
    end

    subgraph Response["Response"]
        Res[JSON Response]
    end

    Req --> M1
    M1 -->|Authenticated| M2
    M1 -->|Unauthenticated| E1[401 Error]
    M2 -->|Within Limit| M3
    M2 -->|Exceeded| E2[429 Error]
    M3 -->|Valid| H1
    M3 -->|Invalid| E3[400 Error]
    H1 --> H2
    H2 --> H3
    H3 --> Res
```

---

## AI System Architecture

The modular AI system with abilities and agents.

```mermaid
flowchart TB
    subgraph Client["Client Request"]
        Hook[Custom Hook]
    end

    subgraph API["API Layer"]
        Route["/api/v1/ai/*"]
    end

    subgraph AISystem["AI System"]
        direction TB
        Router["AI Router"]
        
        subgraph Abilities["Abilities (Simple Tasks)"]
            A1[generateSummary]
            A2[improveText]
            A3[suggestTags]
            A4[analyzePortfolio]
        end
        
        subgraph Agents["Agents (Complex Workflows)"]
            AG1[resumeAgent]
            AG2[optimizeAgent]
            AG3[rewriteAgent]
        end
        
        Provider["AI Provider (Groq)"]
    end

    subgraph External["External"]
        Groq[Groq API]
    end

    Hook --> Route
    Route --> Router
    Router --> Abilities
    Router --> Agents
    Abilities --> Provider
    Agents --> Provider
    Provider --> Groq
```

---

## Portfolio Builder Flow

User interaction flow in the Portfolio Builder component.

```mermaid
stateDiagram-v2
    [*] --> Empty: No Sections
    Empty --> AddSection: Click Add
    
    AddSection --> SelectType: Choose Section Type
    SelectType --> CreateSection: API Call
    CreateSection --> ViewSections: Success
    
    ViewSections --> EditSection: Click Edit
    EditSection --> SaveChanges: Save
    SaveChanges --> ViewSections: Success
    
    ViewSections --> DeleteSection: Click Delete
    DeleteSection --> Confirm: Show Modal
    Confirm --> ViewSections: Cancel
    Confirm --> RemoveSection: Confirm
    RemoveSection --> ViewSections: Success
    RemoveSection --> Empty: Last Section
    
    ViewSections --> ReorderSections: Drag & Drop
    ReorderSections --> ViewSections: Update Order
    
    ViewSections --> AIFeatures: Use AI Tools
    AIFeatures --> ViewSections: Apply Changes
```

---

## Database Schema

Entity relationship diagram for the main database tables.

```mermaid
erDiagram
    users ||--o{ portfolios : owns
    users ||--o{ tags : creates
    users ||--o{ certifications : uploads
    portfolios ||--o{ portfolio_sections : contains
    portfolios }o--o{ tags : tagged_with
    
    users {
        uuid id PK
        string email
        timestamp created_at
    }
    
    portfolios {
        uuid id PK
        uuid user_id FK
        string title
        string description
        string template
        string theme
        boolean is_public
        string share_token
        timestamp created_at
        timestamp updated_at
    }
    
    portfolio_sections {
        uuid id PK
        uuid portfolio_id FK
        string section_type
        jsonb content
        int order_index
        timestamp created_at
        timestamp updated_at
    }
    
    tags {
        uuid id PK
        uuid user_id FK
        string name
        string color
        timestamp created_at
    }
    
    certifications {
        uuid id PK
        uuid user_id FK
        string name
        string issuer
        date issue_date
        date expiry_date
        string file_url
        timestamp created_at
    }
```

---

## Component Hierarchy

Main component structure of the application.

```mermaid
flowchart TB
    subgraph App["App Layout"]
        RootLayout["RootLayout"]
        
        subgraph Auth["Auth Pages"]
            Login[LoginPage]
            Signup[SignupPage]
            Callback[CallbackPage]
        end
        
        subgraph Dashboard["Dashboard"]
            DashLayout["DashboardLayout"]
            Overview[OverviewPage]
            Portfolios[PortfoliosPage]
            Certs[CertificationsPage]
            Settings[SettingsPage]
        end
        
        subgraph Public["Public Pages"]
            Home[HomePage]
            PublicPortfolio["PublicPortfolio [token]"]
        end
    end
    
    RootLayout --> Auth
    RootLayout --> Dashboard
    RootLayout --> Public
    
    subgraph BuilderComponents["Portfolio Builder"]
        Builder[Builder]
        BuilderCtx[BuilderContext]
        SectionCard[SectionCard]
        SectionEditor[SectionEditor]
        SectionAddMenu[SectionAddMenu]
        
        subgraph AITools["AI Tools"]
            Analyzer[AIPortfolioAnalyzer]
            Generator[AIResumeGenerator]
            Optimizer[AIJobOptimizer]
            Rewriter[AIRewritePortfolio]
        end
    end
    
    Portfolios --> Builder
    Builder --> BuilderCtx
    BuilderCtx --> SectionCard
    BuilderCtx --> SectionEditor
    BuilderCtx --> SectionAddMenu
    Builder --> AITools
```

---

## Request Rate Limiting

How rate limiting is applied to different endpoint types.

```mermaid
flowchart TB
    subgraph Incoming["Incoming Request"]
        Req[Request]
    end
    
    subgraph Identification["Key Identification"]
        IP["IP Address"]
        UserID["User ID"]
    end
    
    subgraph Configs["Rate Limit Configs"]
        direction TB
        Public["Public: 100/min (IP)"]
        Auth["Auth: 10/min (IP)"]
        API["API: 100/min (User)"]
        AI["AI: 20/min (User)"]
    end
    
    subgraph Check["Rate Limit Check"]
        Store["In-Memory Store"]
        Count["Request Count"]
        Window["Time Window"]
    end
    
    subgraph Result["Result"]
        Pass["Pass: Add Headers"]
        Block["Block: 429 Response"]
    end
    
    Req --> IP
    Req --> UserID
    IP --> Public
    IP --> Auth
    UserID --> API
    UserID --> AI
    Public & Auth & API & AI --> Check
    Check --> Count
    Count --> Window
    Window -->|Under Limit| Pass
    Window -->|Over Limit| Block
```

---

## File Upload Flow

Certification file upload process.

```mermaid
sequenceDiagram
    participant User
    participant Form as CertificationForm
    participant API as /api/v1/certifications
    participant Supabase
    participant Storage as Supabase Storage

    User->>Form: Select File
    Form->>Form: Validate (type, size)
    Form->>API: POST with FormData
    API->>API: Authenticate User
    API->>Storage: Upload to certifications bucket
    Storage-->>API: Public URL
    API->>Supabase: Insert certification record
    Supabase-->>API: Certification data
    API-->>Form: Success response
    Form-->>User: Show success message
```

---

## Deployment Architecture

Production deployment on Vercel with Supabase.

```mermaid
flowchart TB
    subgraph Users["Users"]
        Browser[Browser]
    end
    
    subgraph Vercel["Vercel Edge Network"]
        CDN[CDN/Edge Cache]
        Serverless[Serverless Functions]
    end
    
    subgraph Supabase["Supabase Cloud"]
        Auth[Auth Service]
        DB[(PostgreSQL)]
        Storage[Storage Buckets]
        Realtime[Realtime]
    end
    
    subgraph External["External APIs"]
        Groq[Groq AI]
    end
    
    Browser -->|HTTPS| CDN
    CDN -->|Static Assets| Browser
    CDN -->|API Requests| Serverless
    Serverless -->|Auth| Auth
    Serverless -->|Data| DB
    Serverless -->|Files| Storage
    Serverless -->|AI| Groq
```

---

## Notes

- All diagrams use [Mermaid](https://mermaid.js.org/) syntax
- GitHub and VS Code natively render Mermaid diagrams
- For other platforms, use the [Mermaid Live Editor](https://mermaid.live/)
