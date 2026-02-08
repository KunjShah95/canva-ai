import React from 'react';

const KeyboardShortcuts = ({ onClose }) => {
    const shortcuts = [
        { category: 'General', items: [
            { keys: ['Ctrl', 'S'], action: 'Save Project' },
            { keys: ['Ctrl', 'E'], action: 'Export' },
            { keys: ['?'], action: 'Show Shortcuts' }
        ]},
        { category: 'Editing', items: [
            { keys: ['Ctrl', 'Z'], action: 'Undo' },
            { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
            { keys: ['Delete'], action: 'Delete Selected' },
            { keys: ['Ctrl', 'D'], action: 'Duplicate' }
        ]},
        { category: 'Canvas', items: [
            { keys: ['+', '-'], action: 'Zoom In/Out' },
            { keys: ['0'], action: 'Reset Zoom' },
            { keys: ['Alt', 'Drag'], action: 'Pan Canvas' }
        ]},
        { category: 'Objects', items: [
            { keys: ['Ctrl', 'G'], action: 'Group' },
            { keys: ['Ctrl', 'Shift', 'G'], action: 'Ungroup' },
            { keys: [']'], action: 'Bring to Front' },
            { keys: ['['], action: 'Send to Back' }
        ]},
        { category: 'Text', items: [
            { keys: ['Ctrl', 'B'], action: 'Bold' },
            { keys: ['Ctrl', 'I'], action: 'Italic' }
        ]}
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold uppercase tracking-wider">Keyboard Shortcuts</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                    {shortcuts.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">{section.category}</h3>
                            <div className="space-y-2">
                                {section.items.map((shortcut) => (
                                    <div key={shortcut.action} className="flex items-center justify-between">
                                        <span className="text-sm">{shortcut.action}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, i) => (
                                                <React.Fragment key={key}>
                                                    <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">{key}</kbd>
                                                    {i < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-border text-center text-xs text-muted-foreground">
                    Press <kbd className="px-2 py-1 bg-secondary rounded text-xs">?</kbd> to open this menu anytime
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;
