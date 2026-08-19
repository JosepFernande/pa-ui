# Script de Inicialización: Sincronización de Páginas del Wiki

## Propósito

Este script se ejecuta automáticamente la primera vez que se usa la skill
`github-issues-from-docs` o manualmente con el comando `/sync-wiki-docs`. Solo
sincroniza documentación de referencia desde el repo git del Wiki
(`https://github.com/JosepFernande/pa-ui.wiki.git`, lectura); nunca hace
`git push` a ese repo.

## Flujo de ejecución

### Paso 1: Verificar si el índice ya existe

```typescript
const indexExists = await pathExists('.wiki-cache/index.json');

if (indexExists) {
  console.log(
    'Índice ya existe en .wiki-cache/index.json. Usar /sync-wiki-docs para forzar actualización.',
  );
  return;
}
```

### Paso 2: Asegurar el clone local del Wiki

```bash
# Si el clone no existe todavía
if [ ! -d .wiki-cache/pa-ui.wiki ]; then
  git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki
else
  git -C .wiki-cache/pa-ui.wiki pull --ff-only
fi
```

### Paso 3: Listar las páginas del Wiki

```bash
# Todas las páginas .md, excluyendo Home y cualquier página especial con
# prefijo "_" (convención de Gollum/GitHub Wiki para metadata de navegación:
# _Sidebar, _Footer, _Header, etc. — no son documentación de referencia)
find .wiki-cache/pa-ui.wiki -maxdepth 1 -name '*.md' \
  ! -name 'Home.md' ! -name '_*.md'
```

```typescript
const documents = pageFiles.map((file) => ({
  page: file.replace(/\.md$/, ''),
  file,
}));
```

### Paso 4: Para cada página, leer contenido y generar tags

```typescript
for (const doc of documents) {
  // 4a. Leer contenido con la tool Read
  const markdown = await Read({
    file_path: `.wiki-cache/pa-ui.wiki/${doc.file}`,
  });

  // 4b. Obtener el commit SHA en que se modificó por última vez este archivo
  const lastCommitSha = await bash(
    `git -C .wiki-cache/pa-ui.wiki log -1 --format=%H -- "${doc.file}"`,
  );

  // 4c. Generar tags automáticos
  const tags = generateTags(markdown, doc.page);

  // 4d. Adjuntar contenido y metadata al documento en memoria; se persiste
  // todo junto en el Paso 5 (un único archivo .wiki-cache/index.json)
  doc.last_commit_sha = lastCommitSha;
  doc.tags = tags;
  doc.content = markdown;
  doc.markdown_length = markdown.length;
  doc.cached_at = new Date().toISOString();
}
```

### Paso 5: Escribir el índice en `.wiki-cache/index.json`

```typescript
const headSha = await bash('git -C .wiki-cache/pa-ui.wiki rev-parse HEAD');

await Write({
  file_path: '.wiki-cache/index.json',
  content: JSON.stringify(
    {
      repo: 'https://github.com/JosepFernande/pa-ui.wiki.git',
      local_clone_path: '.wiki-cache/pa-ui.wiki',
      last_synced_head_sha: headSha,
      last_synced_at: new Date().toISOString(),
      documents: documents,
    },
    null,
    2,
  ),
});
```

`.wiki-cache/` ya está en `.gitignore` (línea `/.wiki-cache/`), así que este
archivo es puramente local y nunca se versiona. Ver
`references/wiki-cache-patterns.md` para el detalle de forma del archivo,
validación de frescura y actualización parcial sin pisar otras páginas.

### Paso 6: Reportar resultados

```typescript
console.log(`Sincronización completada:`);
console.log(`- Páginas sincronizadas: ${documents.length}`);
console.log(`- HEAD sincronizado: ${headSha}`);
console.log(
  `- Tags generados: ${documents.reduce((sum, doc) => sum + doc.tags.length, 0)}`,
);
```

## Algoritmo de generación de tags

```typescript
function generateTags(content: string, page: string): string[] {
  const tags = new Set<string>();

  // 1. Tags basados en el nombre de la página
  const pageLower = page.toLowerCase();
  if (pageLower.includes('architecture')) tags.add('arquitectura');
  if (pageLower.includes('css')) tags.add('css');
  if (pageLower.includes('theming')) tags.add('theme-engine');
  if (pageLower.includes('testing')) tags.add('testing');
  if (pageLower.includes('versioning')) tags.add('versioning');
  if (pageLower.includes('release')) tags.add('release');
  if (pageLower.includes('ci-cd')) tags.add('ci');

  // 2. Tags basados en contenido
  const contentLower = content.toLowerCase();

  // Conceptos técnicos
  if (contentLower.includes('token')) tags.add('tokens');
  if (contentLower.includes('signal')) tags.add('signals');
  if (contentLower.includes('standalone')) tags.add('standalone');
  if (
    contentLower.includes('css variables') ||
    contentLower.includes('custom properties')
  )
    tags.add('css-variables');
  if (contentLower.includes('viewencapsulation'))
    tags.add('view-encapsulation');

  // APIs
  if (contentLower.includes('providepatheme')) tags.add('providePaTheme');
  if (contentLower.includes('themeservice')) tags.add('ThemeService');
  if (contentLower.includes('controlvalueaccessor')) tags.add('cva');

  // Herramientas
  if (contentLower.includes('nx')) tags.add('nx');
  if (contentLower.includes('changeset')) tags.add('changesets');
  if (contentLower.includes('storybook')) tags.add('storybook');
  if (contentLower.includes('stylelint')) tags.add('stylelint');
  if (contentLower.includes('eslint')) tags.add('eslint');

  // Componentes
  if (contentLower.includes('button')) tags.add('button');
  if (contentLower.includes('input')) tags.add('input');
  if (contentLower.includes('badge')) tags.add('badge');

  // Procesos
  if (contentLower.includes('pre-commit')) tags.add('pre-commit');
  if (
    contentLower.includes('trusted publishing') ||
    contentLower.includes('oidc')
  )
    tags.add('trusted-publishing');
  if (contentLower.includes('ssr') || contentLower.includes('server-side'))
    tags.add('ssr');

  // 3. Limitar a 15 tags
  return Array.from(tags).slice(0, 15);
}
```

## Comando: `/sync-wiki-docs`

### Uso

```
/sync-wiki-docs              # Sincronización completa
/sync-wiki-docs --force      # Forzar re-lectura de todas las páginas
/sync-wiki-docs --incremental # Solo páginas que cambiaron
```

### Implementación

```typescript
async function syncWikiDocs(options: {
  force?: boolean;
  incremental?: boolean;
}) {
  if (options.incremental) {
    // Solo re-leer páginas que cambiaron entre el HEAD cacheado y el actual
    return await syncChangedDocs();
  }

  if (options.force) {
    // Forzar re-lectura de todas las páginas
    return await syncAllDocs({ force: true });
  }

  // Sincronización completa (primera vez)
  return await syncAllDocs({ force: false });
}
```

## Manejo de errores

### Error: el clone falla (repo no encontrado)

```bash
git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki
# fatal: repository 'https://github.com/JosepFernande/pa-ui.wiki.git/' not found
```

Un Wiki de GitHub no existe como repo git hasta que se crea al menos una página
manualmente desde la UI. En `pa-ui` el Wiki ya está poblado (17 páginas de
referencia + `Home.md` + páginas especiales con prefijo `_` como `_Sidebar.md` y
`_Footer.md`), así que este error solo debería reaparecer si el Wiki se elimina
y recrea desde cero. Ver `references/wiki-git-patterns.md` para el detalle.

```typescript
if (cloneFailed) {
  console.error(
    'No se pudo clonar el Wiki. Verificar que exista al menos una página en ' +
      'https://github.com/JosepFernande/pa-ui/wiki',
  );
  throw new Error('wiki_clone_failed');
}
```

### Error: `git pull` no es fast-forward

```typescript
try {
  await bash('git -C .wiki-cache/pa-ui.wiki pull --ff-only');
} catch (error) {
  if (error.message.includes('not possible to fast-forward')) {
    console.warn(
      'El clone local diverge del remoto. Recreando el clone desde cero.',
    );
    await bash('rm -rf .wiki-cache/pa-ui.wiki');
    await bash(
      'git clone https://github.com/JosepFernande/pa-ui.wiki.git .wiki-cache/pa-ui.wiki',
    );
    return;
  }
  throw error;
}
```

### Error: archivo no encontrado en el clone local

```typescript
try {
  const markdown = await Read({
    file_path: `.wiki-cache/pa-ui.wiki/${doc.file}`,
  });
} catch (error) {
  console.warn(`Página ${doc.file} no encontrada en el clone local. Saltando.`);
  return null;
}
```

### Error: falla la escritura de `.wiki-cache/index.json`

```typescript
try {
  await Write({
    file_path: '.wiki-cache/index.json',
    content: JSON.stringify(index, null, 2),
  });
} catch (error) {
  console.error('Error escribiendo .wiki-cache/index.json:', error);
  console.warn(
    'Continuando sin cache. La próxima ejecución repetirá la sincronización completa.',
  );
}
```

## Métricas de performance

| Operación                                        | Tiempo estimado | Operaciones git / lecturas                 |
| ------------------------------------------------ | --------------- | ------------------------------------------ |
| Sincronización completa (17 páginas)             | 20-40s          | 1 clone + 17 lecturas (Read tool)          |
| Sincronización incremental (3 páginas cambiadas) | 10-15s          | 1 pull + 1 rev-parse + 1 diff + 3 lecturas |
| Chequeo de frescura (todo fresco)                | 2-5s            | 1 pull + 1 rev-parse (~20-30 tokens)       |

Comparado con el mecanismo anterior basado en llamadas a una API externa, el
chequeo de frescura pasa de ~17 llamadas (~150 tokens c/u, ~2550 tokens totales)
a una única comparación de HEAD SHA (~20-30 tokens), sin importar cuántas
páginas tenga el Wiki.

## Recomendaciones

1. **Ejecutar `/sync-wiki-docs` semanalmente** para mantener el cache fresco
2. **Ejecutar después de cambios masivos** en la documentación del Wiki
3. **No ejecutar en cada sesión** (el chequeo de frescura por HEAD SHA ya es
   prácticamente gratuito)
4. **No hay rate limiting que gestionar**: solo hay una operación de red
   (`git pull`) por ejecución, no una llamada por página
