---
name: github-issues-from-docs
description:
  'Trigger: crear issue, GitHub issue, US-XX, revisar issue, alinear issue con
  documentación. Crear y revisar issues de GitHub alineados con documentación
  técnica usando cache híbrido de Notion en Engram.'
license: Apache-2.0
metadata:
  author: jfernandezo
  version: '2.0'
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

1. **Notion es solo lectura**: nunca llamar `patch-page` / `post-page` para
   crear o modificar issues. Toda creación y actualización de issues ocurre vía
   `gh issue create` / `gh issue edit` / `gh issue comment`.
2. **Cache híbrido obligatorio** sobre la documentación de referencia en Notion
   (arquitectura, theming, CSS, etc.): índice liviano en Engram
   (`notion-docs/index`) + contenido completo por documento
   (`notion-docs/{doc-id}`) con `last_edited_time`.
3. **Validación selectiva**: solo validar frescura de los documentos relevantes
   para el issue actual, nunca los ~18 documentos completos.
4. **Re-lectura incremental**: solo re-leer de Notion los documentos cuyo
   `last_edited_time` cambió.
5. **Auto-bootstrap**: si el índice no existe en Engram, ejecutar
   `/sync-notion-docs` automáticamente antes de continuar.

## Decision Gates

| Situación                             | Acción                                                  |
| ------------------------------------- | ------------------------------------------------------- |
| Índice de docs no existe en Engram    | Ejecutar `/sync-notion-docs`                            |
| Documento obsoleto (timestamp cambió) | Re-leer de Notion y actualizar cache                    |
| Documento fresco                      | Usar cache de Engram (0 API calls)                      |
| Issue menciona concepto no indexado   | Buscar en todos los documentos (fallback)               |
| Usuario pide "revisar todo"           | Auditoría completa (leer todos los docs)                |
| Error de API de Notion                | Reportar error, no fallar silenciosamente               |
| Existe `.github/ISSUE_TEMPLATE`       | Alinear el body generado con esa plantilla              |
| No existe `.github/ISSUE_TEMPLATE`    | Usar formato Como/Quiero/Para + criterios de aceptación |

## Execution Steps

### Modo: Revisar issue existente

1. `gh issue view <number> --json title,body,labels,comments`
2. Determinar el tema del issue (keywords) y cargar el índice de docs desde
   Engram (local, 0 API calls)
3. Filtrar 3-5 documentos relevantes por match de tags
4. Validar frescura solo de esos documentos contra Notion; re-leer únicamente
   los obsoletos
5. Comparar el issue contra la documentación cacheada e identificar gaps
6. Proponer cambios al usuario
7. Si aprueba: `gh issue edit <number> --body ...` o
   `gh issue comment <number> --body ...`

### Modo: Crear nuevo issue

1. Recopilar requisitos del usuario
2. Cargar y validar documentos relevantes (mismo flujo híbrido)
3. Generar el body del issue (ver Decision Gates para el formato)
4. `gh issue create --title "..." --body "..." --label "..."`
5. Guardar learnings: `mem_save` con
   `topic_key: "github-issue/{issue-number}/analysis"`

### Comando `/sync-notion-docs`

Sincroniza el índice y el contenido de los documentos de referencia en Notion.
Ver `assets/initialization-script.md` para el flujo completo.

## Output Contract

Retornar:

- **Resumen de análisis**: gaps encontrados, documentos de referencia
  consultados
- **Resultado**: número y URL del issue de GitHub creado/actualizado
- **Estadísticas de cache**: documentos leídos desde cache vs. re-leídos desde
  Notion
- **Confirmación de learnings guardados** en Engram

## References

- `assets/document-index-template.json` — template del índice de documentos de
  Notion
- `assets/tagging-strategy.md` — estrategia de tagging automático
- `assets/initialization-script.md` — script de sincronización inicial de docs
- `assets/usage-examples.md` — ejemplos de flujo completo
- `references/notion-api-patterns.md` — patrones de uso de API de Notion (solo
  lectura)
- `references/engram-cache-patterns.md` — patrones de cache en Engram
