/**
 * Toolbox for the Product Studio Blockly spike.
 * JSON-based — Blockly's preferred format in v12.
 */

export const SPIKE_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Triggers',
      colour: '45',
      contents: [
        { kind: 'block', type: 'mw_when_configured' },
      ],
    },
    {
      kind: 'category',
      name: 'Operators',
      colour: '120',
      contents: [
        { kind: 'block', type: 'mw_arithmetic' },
        { kind: 'block', type: 'mw_compare' },
        { kind: 'block', type: 'mw_number' },
      ],
    },
    {
      kind: 'category',
      name: 'Outputs',
      colour: '0',
      contents: [
        { kind: 'block', type: 'mw_set_variable' },
        { kind: 'block', type: 'mw_add_bom_line' },
        { kind: 'block', type: 'mw_show_warning' },
      ],
    },
  ],
} as const;
