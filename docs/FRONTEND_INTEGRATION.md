# Guía de Integración Frontend — SIMAUD-LEX

Este documento contiene las interfaces TypeScript alineadas al backend, ejemplos de cliente Axios configurado con JWT, y funciones de acceso a la API que el frontend puede usar directamente.

## Interfaces (copiar a `src/types/index.ts` en el frontend)

```ts
// src/types/index.ts

export type UUID = string;

export interface Nna {
  id: UUID;
  nombre_completo: string;
  fecha_nacimiento: string; // ISO date string
  opinion_nna?: string | null;
  necesidades_especiales?: string[] | null;
  procesos?: ProcesoJudicial[];
}

export interface Person {
  id: UUID;
  cedula?: string | null;
  nombre_completo?: string | null;
  recursos_economicos?: number | null; // number en frontend
  ocupacion?: string | null;
  entorno_hogar?: string | null;
}

export enum EstadoProceso {
  EN_PROCESO = 'EN_PROCESO',
  SENTENCIA = 'SENTENCIA',
  CONCILIACION = 'CONCILIACION',
}

export enum TipoDemanda {
  GUARDA = 'GUARDA',
  ALIMENTOS = 'ALIMENTOS',
  VISITAS = 'VISITAS',
}

export interface ProcesoJudicial {
  id: UUID;
  fecha_inicio: string; // ISO date
  estado: EstadoProceso;
  tipo_demanda: TipoDemanda;
  nna?: Nna | null;
}

// DTOs para peticiones
export interface CreateProcesoDto {
  fecha_inicio: string; // ISO
  estado: EstadoProceso;
  tipo_demanda: TipoDemanda;
  nnaId: UUID;
}

export interface SimulationDto {
  procesoId?: UUID; // si la simulación toma solo proceso
  // o payload custom que el backend acepte
}
```

## Cliente HTTP configurado (copiar a `src/lib/axios.ts`)

```ts
// src/lib/axios.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para inyectar JWT desde localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Funciones de acceso a la API (`src/api/*` ejemplo)

```ts
// src/api/nna.ts
import { api } from '../lib/axios';
import { Nna } from '../types';

export async function getNnas(): Promise<Nna[]> {
  const { data } = await api.get<Nna[]>('/nna');
  return data;
}

// src/api/proceso.ts
import { api } from '../lib/axios';
import { CreateProcesoDto, ProcesoJudicial } from '../types';

export async function createProceso(
  data: CreateProcesoDto,
): Promise<ProcesoJudicial> {
  const { data: res } = await api.post<ProcesoJudicial>(
    '/proceso-judicial',
    data,
  );
  return res;
}

export async function runSimulation(procesoId: string) {
  const { data } = await api.post(
    `/proceso-judicial/${procesoId}/simular-sentencia`,
  );
  return data; // estructura definida por backend (ej. sugerencia de sentencia)
}
```

## Recomendaciones para el frontend

- Mantener `src/types/index.ts` sincronizado con los DTOs del backend. Usar Swagger para validar diferencias.
- Usar TanStack Query para caché y sincronización de datos. Ejemplo rápido:

```ts
// ejemplo: useQuery('nna', getNnas)
```

- Formularios: `react-hook-form` + `zod`. Para `recursos_economicos` usar `z.number().nonnegative()`.
- Para `necesidades_especiales` usar un input de tags (array de strings).

## Ejemplo rápido: validación Zod para `Person` (formulario)

```ts
import { z } from 'zod';

export const personSchema = z.object({
  nombre_completo: z.string().min(1),
  recursos_economicos: z.number().nonnegative(),
  cedula: z.string().optional(),
  entorno_hogar: z.string().optional(),
});

export type PersonForm = z.infer<typeof personSchema>;
```

## Flujo de autenticación en frontend

1. Usuario hace `POST /auth/login` con credenciales.
2. Backend responde con token JWT.
3. Guardar token en `localStorage` (o `httpOnly cookie` si cambias estrategia) y usar el interceptor axios para enviarlo.

## Notas finales

- Swagger está disponible para verificar constantemente los contratos.
- Si el backend añade nuevos campos/DTOs, actualizar `src/types/index.ts` y correr `npm run build` en frontend.
