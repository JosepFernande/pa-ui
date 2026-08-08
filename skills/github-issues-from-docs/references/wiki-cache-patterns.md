# Patrones de Cache Local (`.wiki-cache/index.json`)

## Estrategia híbrida

### Principios

1. **Índice liviano + contenido cacheado en un solo archivo**: un único JSON
   local (`.wiki-cache/index.json`) guarda tanto la metadata de cada página
   (tags, SHA del último commit) como su contenido completo. No hace falta
   sharding: son ~17 páginas de Wiki, el archivo completo entra cómodo en
   memoria y en una sola operación de `Read`/`Write`.
2. **Frescura garantizada**: comparar el HEAD SHA del clone local del Wiki
   (`.wiki-cache/pa-ui.wiki`) contra `last_synced_head_sha` antes de usar el
   contenido cacheado de cualquier página.
3. **Sincronización incremental**: solo re-leer del clone local las páginas que
   cambiaron (vía `git diff --name-only`), y solo actualizar esas entradas del
   índice — nunca reescribir el archivo entero desde cero salvo en la
   sincronización inicial o `--force`.
4. **Todo local y no versionado**: `.wiki-cache/` ya está en `.gitignore` (línea
   `/.wiki-cache/`), así que el clone del Wiki y el índice conviven ahí sin
   riesgo de exposición en git ni necesidad de tocar el gitignore.

## Ubicación y forma del archivo

```
.wiki-cache/index.json
```

Ruta relativa a la raíz del proyecto `pa-ui`. Forma completa:

```json
{
  "repo": "https://github.com/JosepFernande/pa-ui.wiki.git",
  "local_clone_path": ".wiki-cache/pa-ui.wiki",
  "last_synced_head_sha": "a1b2c3d4e5f6...",
  "last_synced_at": "2026-07-29T00:40:00.000Z",
  "documents": [
    {
      "page": "Architecture-and-Foundation",
      "file": "Architecture-and-Foundation.md",
      "last_commit_sha": "a1b2c3d4e5f6...",
      "cached_at": "2026-07-29T00:40:00.000Z",
      "content": "# Project Vision\nBuild an Angular component library...",
      "markdown_length": 12500,
      "tags": ["arquitectura", "tokens", "standalone"]
    }
  ]
}
```

Cada entrada de `documents` combina lo que antes vivían como dos topic_keys
separados (`wiki-docs/index` y `wiki-docs/{page-slug}`) en Engram: metadata de
índice (`page`, `file`, `tags`) y contenido cacheado (`content`,
`last_commit_sha`, `cached_at`, `markdown_length`) en la misma entrada.

## Patrones de lectura

### Cargar índice

```typescript
async function loadIndex(): Promise<WikiIndex | null> {
  try {
    const raw = await Read({ file_path: '.wiki-cache/index.json' });
    return JSON.parse(raw);
  } catch {
    // Archivo no existe todavía: disparar auto-bootstrap
    return null;
  }
}

const index = await loadIndex();
if (!index) {
  await syncWikiDocs();
  return await loadIndex();
}
```

### Validar frescura

```typescript
async function ensureWikiClone() {
  const exists = await pathExists('.wiki-cache/pa-ui.wiki');
  if (!exists) {
    await bash(
      'git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki',
    );
  } else {
    await bash('git -C .wiki-cache/pa-ui.wiki pull --ff-only');
  }
}

async function getCurrentHeadSha(): Promise<string> {
  return (await bash('git -C .wiki-cache/pa-ui.wiki rev-parse HEAD')).trim();
}

async function validateFreshness(cachedHeadSha: string) {
  await ensureWikiClone();
  const currentHeadSha = await getCurrentHeadSha();

  // 1 sola comparación de string reemplaza 1 llamada de API por página
  if (currentHeadSha !== cachedHeadSha) {
    return { fresh: false, currentHeadSha };
  }

  return { fresh: true };
}
```

### Leer página (con cache)

```typescript
async function getDocumentContent(page: string, index: WikiIndex) {
  const cachedDoc = index.documents.find((d) => d.page === page);
  const freshness = await validateFreshness(index.last_synced_head_sha);

  if (cachedDoc && freshness.fresh) {
    // Cache válido, usar contenido ya cargado desde .wiki-cache/index.json
    return { content: cachedDoc.content, source: 'cache' };
  }

  // HEAD cambió: determinar si esta página específica cambió antes de
  // re-leerla (evita re-lecturas innecesarias de páginas que no cambiaron)
  const changedFiles = await bash(
    `git -C .wiki-cache/pa-ui.wiki diff --name-only ${index.last_synced_head_sha} ${freshness.currentHeadSha} -- '*.md'`,
  );

  if (cachedDoc && !changedFiles.includes(`${page}.md`)) {
    // La página no está en el diff: sigue fresca aunque el HEAD global cambió
    return { content: cachedDoc.content, source: 'cache' };
  }

  // La página cambió (o no estaba cacheada), re-leer del clone local
  const content = await Read({
    file_path: `.wiki-cache/pa-ui.wiki/${page}.md`,
  });
  const lastCommitSha = (
    await bash(
      `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${page}.md"`,
    )
  ).trim();

  await updateDocumentInIndex(page, lastCommitSha, content);

  return { content, source: 'wiki' };
}
```

## Actualización parcial sin pisar otras páginas

La regla clave: cuando solo N de ~17 páginas cambiaron, releer el índice
completo, mutar únicamente las entradas afectadas y volver a escribir el archivo
entero — nunca reescribir con un objeto que solo contenga esas N páginas, porque
eso borraría las demás.

```typescript
async function updateDocumentInIndex(
  page: string,
  lastCommitSha: string,
  content: string,
) {
  // 1. Releer el índice completo tal como está en disco
  const index = await loadIndex();
  if (!index) throw new Error('index_missing_during_partial_update');

  // 2. Generar tags para la página actualizada
  const tags = generateTags(content, page);

  // 3. Mutar solo la entrada de esa página (o agregarla si es nueva)
  const existingIndex = index.documents.findIndex((d) => d.page === page);
  const updatedDoc = {
    page,
    file: `${page}.md`,
    last_commit_sha: lastCommitSha,
    cached_at: new Date().toISOString(),
    content,
    markdown_length: content.length,
    tags,
  };

  if (existingIndex >= 0) {
    index.documents[existingIndex] = updatedDoc;
  } else {
    index.documents.push(updatedDoc);
  }

  // 4. Persistir el índice completo (todas las páginas, no solo la que cambió)
  await writeIndexAtomic(index);
}
```

### Escritura atómica

`Write` sobrescribe el archivo completo en una sola operación, así que no hay un
escenario de escritura parcial línea por línea que corrompa el JSON a mitad de
camino. El riesgo real es perder el archivo si el proceso se interrumpe entre
releer el índice viejo y escribir el nuevo (ventana de carrera si dos
sincronizaciones corrieran en paralelo, algo que esta skill no hace). Para
minimizar ese riesgo:

```typescript
async function writeIndexAtomic(index: WikiIndex) {
  const content = JSON.stringify(index, null, 2);

  // Validar que el JSON generado es parseable antes de escribir, para nunca
  // dejar el archivo en un estado corrupto
  JSON.parse(content);

  await Write({ file_path: '.wiki-cache/index.json', content });
}
```

Si se necesita una garantía más fuerte contra interrupciones a mitad de
escritura (por ejemplo, en un entorno con escrituras concurrentes), el patrón
estándar es escribir a un archivo temporal (`.wiki-cache/index.json.tmp`) y
renombrarlo sobre el destino final; para el uso actual de esta skill
(secuencial, un solo proceso) no es necesario.

## Patrones de sincronización

### Sincronización completa

```typescript
async function syncWikiDocs() {
  // 1. Asegurar el clone local
  await ensureWikiClone();

  // 2. Listar páginas (excluyendo Home.md y páginas con prefijo _)
  const files = await listMarkdownFiles('.wiki-cache/pa-ui.wiki', {
    exclude: (name) => name === 'Home.md' || name.startsWith('_'),
  });

  const documents = [];

  // 3. Para cada página, leer contenido y generar tags
  for (const file of files) {
    const page = file.replace(/\.md$/, '');
    const content = await Read({ file_path: `.wiki-cache/pa-ui.wiki/${file}` });
    const lastCommitSha = (
      await bash(
        `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${file}"`,
      )
    ).trim();
    const tags = generateTags(content, page);

    documents.push({
      page,
      file,
      last_commit_sha: lastCommitSha,
      cached_at: new Date().toISOString(),
      content,
      markdown_length: content.length,
      tags,
    });
  }

  // 4. Escribir el índice completo de una sola vez
  const headSha = await getCurrentHeadSha();
  await writeIndexAtomic({
    repo: 'https://github.com/JosepFernande/pa-ui.wiki.git',
    local_clone_path: '.wiki-cache/pa-ui.wiki',
    last_synced_head_sha: headSha,
    last_synced_at: new Date().toISOString(),
    documents,
  });

  return { synced: documents.length };
}
```

### Sincronización incremental

```typescript
async function syncChangedDocs() {
  // 1. Cargar índice local
  const index = await loadIndex();
  if (!index) return await syncWikiDocs();

  // 2. Asegurar el clone y comparar HEAD (1 sola comparación, no N)
  await ensureWikiClone();
  const currentHeadSha = await getCurrentHeadSha();

  if (currentHeadSha === index.last_synced_head_sha) {
    return { changed: 0 }; // todo fresco, costo ~0
  }

  // 3. Listar exactamente qué páginas .md cambiaron
  const changedFiles = (
    await bash(
      `git -C .wiki-cache/pa-ui.wiki diff --name-only ${index.last_synced_head_sha} ${currentHeadSha} -- '*.md'`,
    )
  )
    .split('\n')
    .filter(Boolean);

  let changedCount = 0;

  // 4. Re-leer solo esas páginas y mutar solo sus entradas en memoria
  for (const doc of index.documents) {
    if (!changedFiles.includes(doc.file)) continue;

    const content = await Read({
      file_path: `.wiki-cache/pa-ui.wiki/${doc.file}`,
    });
    const lastCommitSha = (
      await bash(
        `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${doc.file}"`,
      )
    ).trim();

    doc.content = content;
    doc.markdown_length = content.length;
    doc.last_commit_sha = lastCommitSha;
    doc.cached_at = new Date().toISOString();
    doc.tags = generateTags(content, doc.page);
    changedCount++;
  }

  // 5. Escribir el índice completo actualizado con el nuevo HEAD
  index.last_synced_head_sha = currentHeadSha;
  index.last_synced_at = new Date().toISOString();
  await writeIndexAtomic(index);

  return { changed: changedCount };
}
```

## Limitaciones

### Tamaño del archivo

Sin límite práctico impuesto por un backend externo: el tamaño lo determina el
disco local. Con ~17 páginas de documentación técnica, el archivo completo se
mantiene en un rango de decenas a pocos cientos de KB — sin necesidad de truncar
contenido ni hacer sharding por página.

### Sin detección automática de cambios remotos

No hay mecanismo push-based de detección de cambios en el Wiki remoto. El
usuario debe ejecutar `/sync-wiki-docs` periódicamente, o confiar en que la
skill asegura el clone (`git pull --ff-only`) y compara el HEAD SHA en cada
ejecución (chequeo de frescura automático, sin costo de red adicional más allá
del `pull`).

### Un solo archivo, sin concurrencia

El patrón asume ejecución secuencial de un único proceso de la skill a la vez
sobre el mismo checkout. Si en el futuro se necesitara soportar escrituras
concurrentes (por ejemplo, múltiples agentes corriendo `/sync-wiki-docs` en
paralelo sobre el mismo working tree), habría que introducir locking de archivo
o el patrón de escritura a archivo temporal + rename atómico mencionado arriba.
