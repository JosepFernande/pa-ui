---
name: github-issues-from-docs
description:
  'Trigger: crear issue, GitHub issue, US-XX, revisar issue, alinear issue con
  documentación. Crear y revisar issues de GitHub alineados con documentación
  técnica usando cache híbrido local de GitHub Wiki.'
license: Apache-2.0
metadata:
  author: jfernandezo
  version: '4.0'
---

## Activation Contract

Se ejecuta cuando el usuario:

- Quiere crear un nuevo issue de GitHub (US-XX, feature, bug)
- Quiere revisar, analizar o alinear un issue de GitHub existente contra la
  documentación técnica del proyecto (número de issue, URL)

**NO** se ejecuta para:

- Consultas generales sobre arquitectura (usa otras skills)
- Implementación directa de componentes (usa sdd-apply)

## Hard Rules

1. **El Wiki es solo lectura**: nunca hacer `git push` al repo
   `https://github.com/JosepFernande/pa-ui.wiki.git`. Toda creación y
   actualización de issues ocurre vía `gh issue create` / `gh issue edit` /
   `gh issue comment`.
2. **Cache híbrido obligatorio** sobre la documentación de referencia del Wiki
   (arquitectura, theming, CSS, etc.): índice liviano y contenido completo por
   página en un archivo JSON local `.wiki-cache/index.json`, con
   `last_synced_head_sha` / `last_commit_sha`.
3. **Validación selectiva**: solo validar frescura de las páginas relevantes
   para el issue actual, nunca las ~17 páginas completas.
4. **Re-lectura incremental**: solo re-leer del clone local las páginas cuyo
   archivo cambió entre el `last_synced_head_sha` cacheado y el HEAD actual del
   repo del Wiki (`git diff --name-only <sha-viejo> <sha-nuevo>`).
5. **Auto-bootstrap**: si el índice no existe en `.wiki-cache/index.json`,
   ejecutar `/sync-wiki-docs` automáticamente antes de continuar.

## Decision Gates

| Situación                                    | Acción                                                     |
| -------------------------------------------- | ---------------------------------------------------------- |
| Índice no existe en `.wiki-cache/index.json` | Ejecutar `/sync-wiki-docs`                                 |
| Clone local no existe                        | `git clone` de `pa-ui.wiki.git` a `.wiki-cache/pa-ui.wiki` |
| Clone local existe                           | `git -C .wiki-cache/pa-ui.wiki pull --ff-only`             |
| HEAD actual == `last_synced_head_sha`        | Todo fresco, usar índice local (0 lecturas de archivo)     |
| HEAD actual != `last_synced_head_sha`        | `git diff --name-only` para saber qué `.md` cambiaron      |
| Página listada en el diff                    | Re-leer el archivo (Read tool) y actualizar cache          |
| Issue menciona concepto no indexado          | Buscar en todas las páginas (fallback)                     |
| Usuario pide "revisar todo"                  | Auditoría completa (leer todas las páginas)                |
| `git clone`/`git pull` falla                 | Reportar error, no fallar silenciosamente                  |
| Existe `.github/ISSUE_TEMPLATE`              | Alinear el body generado con esa plantilla                 |
| No existe `.github/ISSUE_TEMPLATE`           | Usar formato Como/Quiero/Para + criterios de aceptación    |

## Execution Steps

### Modo: Revisar issue existente

1. `gh issue view <number> --json title,body,labels,comments`
2. Determinar el tema del issue (keywords) y cargar el índice de docs desde
   `.wiki-cache/index.json` (local, 0 operaciones git)
3. Filtrar 3-5 páginas relevantes por match de tags
4. Asegurar el clone del Wiki (clonar o `pull --ff-only`), obtener el HEAD
   actual y compararlo contra `last_synced_head_sha`; si difiere, listar con
   `git diff --name-only` qué páginas cambiaron y re-leer únicamente esas
5. Comparar el issue contra la documentación cacheada e identificar gaps
6. Proponer cambios al usuario
7. Si aprueba: `gh issue edit <number> --body ...` o
   `gh issue comment <number> --body ...`

### Modo: Crear nuevo issue

1. Recopilar requisitos del usuario
2. Cargar y validar páginas relevantes (mismo flujo híbrido, desde
   `.wiki-cache/index.json`)
3. Generar el body del issue (ver Decision Gates para el formato)
4. `gh issue create --title "..." --body "..." --label "..."`
5. **Guardar learnings (opcional, best-effort)**: si el MCP de Engram está
   disponible, `mem_save` con
   `topic_key: "github-issue/{issue-number}/analysis"`. Si Engram no está
   disponible o falla, omitir este paso sin bloquear el flujo — el issue ya fue
   creado exitosamente en el paso 4.

### Comando `/sync-wiki-docs`

Sincroniza el índice y el contenido de las páginas de referencia del Wiki de
GitHub. Ver `assets/initialization-script.md` para el flujo completo.

## Output Contract

Retornar:

- **Resumen de análisis**: gaps encontrados, páginas de referencia consultadas
- **Resultado**: número y URL del issue de GitHub creado/actualizado
- **Estadísticas de cache**: páginas leídas desde cache vs. re-leídas del Wiki
- **Confirmación de learnings guardados** en Engram (opcional, solo si Engram
  estaba disponible; su ausencia no afecta el resultado principal)

## References

- `assets/document-index-template.json` — template del índice de páginas del
  Wiki
- `assets/tagging-strategy.md` — estrategia de tagging automático
- `assets/initialization-script.md` — script de sincronización inicial de docs
- `assets/usage-examples.md` — ejemplos de flujo completo
- `references/wiki-git-patterns.md` — patrones de uso de git sobre el repo del
  Wiki (solo lectura)
- `references/wiki-cache-patterns.md` — patrones de cache en el archivo JSON
  local `.wiki-cache/index.json`
