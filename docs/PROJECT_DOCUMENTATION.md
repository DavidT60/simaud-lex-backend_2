# SIMAUD-LEX - Documentación del Proyecto (Backend)

## Resumen

Este documento resume la arquitectura, módulos principales, entidades, DTOs y rutas expuestas por el backend de `SIMAUD-LEX` (NestJS + TypeORM). Está pensado para que el equipo frontend pueda integrar de forma segura y consistente.

## Estructura principal

- `src/app.module.ts` — Configuración global y conexión a Postgres (`TypeOrmModule.forRoot`).
- Módulos principales:
  - `AuthModule` — Autenticación JWT.
  - `UserModule` — Gestión de usuarios.
  - `PersonModule` — Personas (progenitores y demás).
  - `NnaModule` — NNA (Niños, Niñas y Adolescentes).
  - `ProcesoJudicialModule` — Procesos judiciales y simulaciones.

## Cómo levantar el proyecto (dev)

1. Configurar variables de entorno (por ejemplo `JWT_SECRET`, `DATABASE_URL` o las que uses localmente).
2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar en modo desarrollo:

```bash
npm run start:dev
```

La API estará en `http://localhost:3000` por defecto. Swagger disponible en `http://localhost:3000/api`.

## Configuración de CORS

En `src/main.ts` se habilita CORS para `http://localhost:5173` (frontend Vite por defecto).

## Autenticación

- Se usa JWT con `passport-jwt`. El `AuthModule` exporta `AuthService` y registra `JwtStrategy`.
- Endpoints de autenticación:
  - `POST /auth/singin` — Registro/creación (payload: `{ email, password, name }`).
  - `POST /auth/login` — Login (payload: `{ email, password }`) -> retorna token JWT.

Para peticiones desde el frontend: incluir header `Authorization: Bearer <token>`.

## Entidades clave y relaciones

1. `Nna` (src/nna/nna.entity.ts)

- `id: string` (uuid)
- `nombre_completo: string`
- `fecha_nacimiento: Date` (en DTOs se usa string ISO)
- `opinion_nna: string | null`
- `necesidades_especiales: string[] | null` (almacenado como `jsonb`)
- `procesos: ProcesoJudicial[]` (OneToMany)

2. `Person` (src/person/person.entity.ts)

- `id: string` (uuid)
- `cedula: string | null`
- `nombre_completo: string | null`
- `recursos_economicos: number | null` (decimal en BD)
- `ocupacion: string | null`
- `entorno_hogar: string | null`
- `partesProceso: ParteProceso[]` (OneToMany)

3. `ProcesoJudicial` (src/proceso-judicial/proceso-judicial.entity.ts)

- `id: string` (uuid)
- `fecha_inicio: Date`
- `estado: EstadoProceso` (enum)
- `tipo_demanda: TipoDemanda` (enum)
- `nna: Nna` (ManyToOne)
- `partes: ParteProceso[]`, `sentencia`, `obligaciones`, `regimenesVisita`

Enums (valores disponibles) — `src/proceso-judicial/enums/proceso.enums.ts`:

- `EstadoProceso`: `EN_PROCESO`, `SENTENCIA`, `CONCILIACION`
- `TipoDemanda`: `GUARDA`, `ALIMENTOS`, `VISITAS`
- `FrecuenciaPago`: `MENSUAL`, `QUINCENAL`, `SEMANAL`
- `ModalidadPago`: `EFECTIVO`, `ESPECIE`
- `RolParte`: `DEMANDANTE`, `DEMANDADO`

## DTOs importantes (resumen)

- `CreateProcesoJudicialDto` (src/proceso-judicial/dto/create-proceso-judicial.dto.ts)
  - `fecha_inicio: string` (ISO date string)
  - `estado: EstadoProceso` (enum)
  - `tipo_demanda: TipoDemanda` (enum)
  - `nnaId: string` (UUID)

- `UpdateProcesoJudicialDto` extiende `PartialType(CreateProcesoJudicialDto)`

Otros DTOs siguen el patrón estándar `Create/Update` en `person`, `nna`, etc.

## Endpoints principales (extracto)

- NNA
  - `GET /nna` — listar
  - `POST /nna` — crear
  - `GET /nna/:id` — obtener
  - `PATCH /nna/:id` — actualizar
  - `DELETE /nna/:id` — eliminar

- Persona
  - `GET /person` — listar
  - `POST /person` — crear
  - `GET /person/:id` — obtener
  - `PATCH /person/:id` — actualizar
  - `DELETE /person/:id` — eliminar

- Proceso Judicial
  - `GET /proceso-judicial` — listar
  - `POST /proceso-judicial` — crear
  - `GET /proceso-judicial/:id` — obtener
  - `PATCH /proceso-judicial/:id` — actualizar
  - `DELETE /proceso-judicial/:id` — eliminar
  - `POST /proceso-judicial/:id/simular-sentencia` — generar simulación de sentencia (usado por el módulo de simulación)

> Nota: Ver `src/*/*.controller.ts` para detalles y validaciones Swagger.

## Buenas prácticas para el frontend

- Usar Swagger (`/api`) como fuente de verdad para payload y esquemas.
- Todas las llamadas que requieran autenticación deben enviar `Authorization: Bearer <token>`.
- Convertir fechas ISO a objetos Date en cliente cuando sea necesario.
- Para `necesidades_especiales` usar array de strings (posible control de tags en UI).

## Archivos creados en esta tarea

- `docs/PROJECT_DOCUMENTATION.md` (este archivo)

---

Siguiente paso: generar `docs/FRONTEND_INTEGRATION.md` con interfaces TypeScript y ejemplos de llamadas HTTP.
