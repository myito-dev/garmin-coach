# Garmin Coach by Mario Galindo

App conectada a Garmin Connect para seguir el plan de 13 semanas hacia el Medio Maratón de Puebla: compara cada
entrenamiento contra el plan, revisa insights automáticos (ritmo, frecuencia cardíaca, cadencia) y visualiza el
progreso hacia el objetivo sub 2:00:00.

## Cómo funciona la conexión con Garmin

Garmin no ofrece una API pública sencilla para desarrolladores individuales. Esta app usa
[`garmin-connect`](https://github.com/Pythe1337N/garmin-connect), una librería no oficial que inicia sesión igual que
lo harías desde el navegador, usando tu correo y contraseña de Garmin Connect.

Por eso:

- Las credenciales solo se leen en el servidor (nunca llegan al navegador), como variables de entorno.
- El token de sesión y el caché de actividades sincronizadas se guardan en una base de datos Redis privada
  (Upstash) — nada se escribe en el repositorio ni en disco.
- La app entera está protegida con una contraseña compartida (`APP_PASSWORD`) para que solo la gente a la que se la
  des pueda entrar, aunque el link sea público. Ver "Desplegar y compartir" abajo.

## Primeros pasos (local)

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de variables de entorno:

   ```bash
   cp .env.local.example .env.local
   ```

   Rellena `GARMIN_EMAIL` / `GARMIN_PASSWORD` con tus credenciales de Garmin Connect, y `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN` con los datos de una base de datos Redis gratuita (ver el paso 1 de "Desplegar y
   compartir" para crear una). Deja `APP_PASSWORD` vacío para desarrollo local — así no te pide contraseña en tu
   propia máquina.

3. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000), ve a **Conectar** y presiona **Sincronizar con Garmin**.

## Desplegar y compartir (gratis) con familia y amigos

La app queda disponible 24/7 en un link, sin depender de que tu computadora esté prendida, usando solo servicios
con capa gratuita: **Vercel** (hosting) + **Upstash** (base de datos Redis) + **GitHub** (para que Vercel despliegue
solo cada vez que subas un cambio).

1. **Crea la base de datos Redis**: entra a [console.upstash.com](https://console.upstash.com), crea una cuenta
   gratis y una base de datos Redis nueva (región cercana a donde vivas). En la pestaña "REST API" copia los
   valores `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
2. **Sube el proyecto a GitHub**: crea un repositorio (puede ser privado) y sube este código.
3. **Crea el proyecto en Vercel**: entra a [vercel.com](https://vercel.com), inicia sesión con tu cuenta de GitHub,
   e importa el repositorio. Antes de desplegar, en "Environment Variables" agrega:
   - `GARMIN_EMAIL`, `GARMIN_PASSWORD` — tus credenciales de Garmin Connect.
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — de Upstash.
   - `APP_PASSWORD` — inventa una contraseña; es la que vas a compartir con tu familia y amigos.
4. Despliega. Vercel te da un link tipo `https://tu-proyecto.vercel.app`. Compártelo junto con la contraseña de
   `APP_PASSWORD` con quien quieras que vea tu plan y tu progreso.
5. Entra tú primero y presiona **Sincronizar con Garmin** en la página Conectar — así todos los que entren después
   ya ven tus entrenamientos.

**Para actualizar la app después** (nuevas semanas de plan, ajustes, etc.): solo haz `git push` — Vercel vuelve a
desplegar solo en unos 30-60 segundos.

## Estructura

- `src/data/plans/*.json` — los datos de cada plan de entrenamiento (ver "Agregar un nuevo plan" abajo).
- `src/lib/planSchema.ts` — el esquema (Zod) que valida cualquier archivo de plan.
- `src/data/trainingPlan.ts` — carga el plan activo, lo valida contra el esquema y lo expone ya tipado al resto de
  la app (no hace falta tocar este archivo para cambiar de plan).
- `src/lib/garmin.ts` — el puente con Garmin Connect (login, reuso de sesión, normalización de actividades y
  parciales por kilómetro).
- `src/lib/kv.ts` / `src/lib/store.ts` — cliente de Redis (Upstash) y todas las lecturas/escrituras del token de
  sesión, el caché de actividades y los parciales.
- `src/proxy.ts` + `src/app/api/gate/route.ts` — el gate de contraseña compartida que protege toda la app.
- `src/lib/planMatch.ts` — empareja cada sesión planeada con la actividad de Garmin correspondiente; si no hay nada
  registrado exactamente ese día, busca hasta 2 días antes/después (por si corriste la sesión tarde o temprano) y
  lo marca como tal.
- `src/lib/insights.ts` — el motor de análisis que compara cada entrenamiento contra lo planeado (ritmo, FC,
  cadencia) y genera los insights; el puntaje numérico de cada entrenamiento se deriva de esos mismos insights
  (nunca puede contradecir lo que dice el texto).
- `src/app/` — páginas: Panel (`/`), Plan (`/plan`), Entrenamientos (`/entrenamientos` y `/entrenamientos/[id]`,
  este último con parciales por kilómetro) y Conectar (`/conectar`).

## Agregar un nuevo plan de entrenamiento

Cuando tengas otra carrera y otro plan, no hace falta tocar código:

1. Copia `src/data/plans/puebla-half-2026.json` a un nuevo archivo, ej. `src/data/plans/otra-carrera-2027.json`.
2. Edita ese JSON con los datos del nuevo plan (carrera, zonas de FC, diagnóstico, semanas y sesiones). El archivo
   `src/lib/planSchema.ts` define exactamente qué campos espera cada parte — si algo falta o tiene el formato
   incorrecto (por ejemplo un ritmo que no sea `"m:ss"`), la app falla al arrancar con un mensaje claro de qué está
   mal, en vez de romperse en silencio a medias.
3. En `src/data/trainingPlan.ts`, cambia el import de `./plans/puebla-half-2026.json` al nuevo archivo.

## Notas

- Si Garmin Connect pide verificación en dos pasos (MFA) al iniciar sesión, el login automático puede fallar; la
  librería no maneja MFA todavía. En la práctica, el mismo error también aparece por contraseña incorrecta o por un
  bloqueo anti-bot de Garmin — la única forma de distinguirlos es revisar el log del servidor (`npm run dev`) justo
  después del intento, donde debería imprimirse `login page title: ...` con el título real de la página que Garmin
  devolvió.
- Sin credenciales configuradas, la app funciona igual mostrando el plan completo — solo el puente con Garmin queda
  inactivo hasta que agregues `.env.local`.
- Los ritmos del plan se recalibraron el 27 jul 2026 usando tus primeras semanas reales sincronizadas de Garmin
  (ver el resumen en `diagnosis.summary` dentro del JSON del plan). Si sigues entrenando y tu ritmo real cambia,
  vale la pena repetir ese análisis cada varias semanas y ajustar los rangos de ritmo del JSON a mano.
