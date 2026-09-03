const MAX_LINES = 400;
export const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce a maximum line count for Angular component files. Component files must not exceed 400 lines.',
            url: '',
        },
        messages: {
            componentFileTooLong: 'Component file exceeds {{ maxLines }} lines (actual: {{ actualLines }} lines). Components must be under {{ maxLines }} lines.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename;
        if (!filename.endsWith('.component.ts')) {
            return {};
        }
        return {
            Program(node) {
                const lineCount = context.sourceCode.getText().split('\n').length;
                if (lineCount > MAX_LINES) {
                    context.report({
                        node,
                        messageId: 'componentFileTooLong',
                        data: {
                            maxLines: String(MAX_LINES),
                            actualLines: String(lineCount),
                        },
                    });
                }
            },
        };
    },
};
