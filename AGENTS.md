## Project
A lightweight Postman clone that supports sending and receiving HTTP requests, and saving these requests to collections. Tech stack is Typescript, Node.js backend, React frontend.

## Architecture
Schemas: shared schemas in shared/types/schemas.ts
Controller layer: functions called by routes, uses functions from the service layer
RequestService: where the actual API calls happen, and abstractions for interaction with the repository
Repository layer: connects to prisma database in prisma/schema.prisma

## Conventions
Backend functions should return Result<T,E> types (given in lib/result.ts) in general
Zod only used at trust boundaries 
All async functions explicitly typed return values

## What not to do
Don't add dependencies without asking
Don't restructure files, only add to existing patterns
Don't edit models or schemas