# Patrones de Git sobre el Wiki de GitHub

El GitHub Wiki de `pa-ui` es una fuente de **solo lectura** para la
documentación técnica de referencia (arquitectura, theming, CSS, testing, etc.).
GitHub no expone una REST API para contenido de Wiki (confirmado:
`gh api repos/JosepFernande/pa-ui/wiki` devuelve 404); el Wiki es un repo git
normal, accesible solo vía `git clone` / `git pull` de
`https://github.com/JosepFernande/pa-ui.wiki.git` (branch `master`). Ningún
comando de escritura (`git push`) se usa nunca desde esta skill; esa
responsabilidad es exclusiva de `gh issue create` / `gh issue edit` /
`gh issue comment` sobre GitHub Issues.

## Ubicación del clone local

```
.wiki-cache/pa-ui.wiki/
```

Ruta relativa a la raíz del proyecto `pa-ui`, ignorada por git (`.wiki-cache/`
en `.gitignore`).

## Comandos usados por la skill

### 1. Clonar el repo del Wiki (primera vez)

**Uso:** Crear el clone local cuando `.wiki-cache/pa-ui.wiki` no existe.

```bash
git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki
```

**Costo:** 1 operación de red. **Tiempo:** ~2-5 segundos (repo pequeño, solo
markdown).

### 2. Actualizar el clone (`pull --ff-only`)

**Uso:** Traer los últimos commits sin crear merge commits ni divergir del
historial remoto.

```bash
git -C .wiki-cache/pa-ui.wiki pull --ff-only
```

**Costo:** 1 operación de red. **Tiempo:** ~1-2 segundos.

### 3. Obtener el HEAD actual (`rev-parse`)

**Uso:** Chequeo de frescura — comparar contra `last_synced_head_sha` cacheado
en Engram. Reemplaza las N validaciones de frescura por documento que requería
el mecanismo anterior (1 llamada de API por página) por una sola comparación de
string.

```bash
git -C .wiki-cache/pa-ui.wiki rev-parse HEAD
```

**Retorna:** el SHA completo del commit HEAD (40 caracteres hex). **Costo:**
operación local, sin red. **Tiempo:** instantáneo.

### 4. Listar páginas que cambiaron (`diff --name-only`)

**Uso:** Cuando el HEAD actual difiere del cacheado, saber exactamente qué
archivos `.md` cambiaron entre ambos commits, para re-leer solo esos.

```bash
git -C .wiki-cache/pa-ui.wiki diff --name-only <sha-viejo> <sha-nuevo> -- '*.md'
```

**Retorna:** lista de rutas de archivos `.md` modificados, uno por línea.
**Costo:** operación local, sin red. **Tiempo:** instantáneo.

### 5. Commit puntual de un archivo (`log -1`)

**Uso:** Obtener el SHA del último commit que tocó una página específica, para
granularidad por página en el índice (`last_commit_sha` de cada documento).

```bash
git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "Theming-Deep-Dive.md"
```

**Retorna:** el SHA del último commit que modificó ese archivo. **Costo:**
operación local, sin red. **Tiempo:** instantáneo.

## Lectura de contenido

Una vez identificado qué archivo hay que (re)leer, el contenido se obtiene con
la tool `Read` sobre la ruta del clone local, no con un comando git:

```
Read(.wiki-cache/pa-ui.wiki/Theming-Deep-Dive.md)
```

## Manejo de errores

### `git pull` no es fast-forward

El clone local diverge del remoto (esto no debería ocurrir en operación normal,
ya que la skill nunca escribe en `.wiki-cache/pa-ui.wiki`; puede pasar si
alguien edita el clone manualmente).

```bash
git -C .wiki-cache/pa-ui.wiki pull --ff-only
# fatal: Not possible to fast-forward, aborting.
```

**Recuperación:** borrar el clone y recrearlo desde cero.

```bash
rm -rf .wiki-cache/pa-ui.wiki
git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki
```

### El clone falla (repo no encontrado)

```bash
git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki
# fatal: repository 'https://github.com/JosepFernande/pa-ui.wiki.git/' not found
```

Un Wiki de GitHub no existe como repo git accesible por clone hasta que se crea
al menos una página manualmente desde la UI del repo (esto es un comportamiento
documentado de GitHub, no un bug de la skill). En `pa-ui` el Wiki ya está
poblado (17 páginas de referencia + `Home.md` + `_Sidebar.md`, pusheadas en la
migración inicial de la documentación), así que este caso solo debería
reaparecer si el Wiki llegara a eliminarse y recrearse desde cero. Si ocurre:

```typescript
if (cloneFailed) {
  console.error(
    'El Wiki no existe como repo git todavía. Crear al menos una página ' +
      'desde https://github.com/JosepFernande/pa-ui/wiki antes de sincronizar.',
  );
  throw new Error('wiki_repo_not_found');
}
```

### Archivo no encontrado en el clone local

Puede pasar si el índice en Engram referencia una página que se renombró o borró
en el Wiki.

```typescript
try {
  const markdown = await Read({
    file_path: `.wiki-cache/pa-ui.wiki/${doc.file}`,
  });
} catch {
  console.warn(`Página ${doc.file} no encontrada en el clone local. Saltando.`);
}
```

## No hay rate limiting que gestionar

A diferencia de estrategias basadas en APIs externas con límites de rate (por
ejemplo, 3 requests/segundo con burst de 20), esta estrategia no hace ninguna
llamada por página: toda la frescura se resuelve con 1 `git pull` de red +
comparaciones/operaciones locales de git. No existe un límite de requests que
gestionar ni necesidad de retry con backoff.

## Tabla de costos y tiempo

| Operación                                     | Tokens típicos | Tiempo | Red          |
| --------------------------------------------- | -------------- | ------ | ------------ |
| Clonar el Wiki (primera vez)                  | ~0 (solo I/O)  | 2-5s   | Sí           |
| `git pull --ff-only`                          | ~0             | 1-2s   | Sí           |
| Chequeo de frescura (`rev-parse` + comparar)  | ~20-30         | <1s    | No           |
| `diff --name-only` (listar páginas cambiadas) | ~10-20         | <1s    | No           |
| `log -1` de una página puntual                | ~10            | <1s    | No           |
| Leer 1 página completa (Read tool)            | ~2000-5000     | <1s    | No           |
| Sincronizar 17 páginas (primera vez)          | ~50000         | 20-40s | Sí (1 clone) |

Nota: no hay entrada de "actualizar" en esta tabla — el Wiki es solo lectura. La
actualización de issues ocurre vía `gh issue edit` sobre GitHub Issues, fuera
del alcance de este archivo.
