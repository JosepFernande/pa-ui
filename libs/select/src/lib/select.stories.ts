import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { providePaTheme } from '@pa-ui/core';
import { PaSelect } from './select.component';
import type { PaSelectOption } from './select.types';

const FRUIT_OPTIONS: PaSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Grapefruit', value: 'grapefruit', disabled: true },
  { label: 'Mango', value: 'mango' },
];

const meta: Meta<PaSelect> = {
  title: 'Select/PaSelect',
  component: PaSelect,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    size: 'md',
    disabled: false,
    readonly: false,
    placeholder: 'Select a fruit…',
    ariaLabel: 'Fruit',
  },
};

export default meta;

type Story = StoryObj<PaSelect>;

/** Default story — single closed select with the controls-driven args. */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<pa-select [options]="options" [size]="size" [disabled]="disabled" [readonly]="readonly" [placeholder]="placeholder" [ariaLabel]="ariaLabel"></pa-select>`,
  }),
};

/** Renders all 3 sizes side by side, sharing the same options list. */
export const AllSizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start; width: 240px;">
        <pa-select [options]="options" size="sm" placeholder="Small"></pa-select>
        <pa-select [options]="options" size="md" placeholder="Medium"></pa-select>
        <pa-select [options]="options" size="lg" placeholder="Large"></pa-select>
      </div>
    `,
  }),
};

/** Disabled state — trigger removed from the tab order, panel cannot open. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<pa-select [options]="options" [size]="size" [disabled]="disabled" [placeholder]="placeholder"></pa-select>`,
  }),
};

/** Read-only state — trigger stays focusable/tabbable, but the panel never opens. */
export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => ({
    props: args,
    template: `<pa-select [options]="options" [size]="size" [readonly]="readonly" placeholder="Read-only"></pa-select>`,
  }),
};

/**
 * Error state — a touched, invalid `FormControl` drives `.pa-select--error`
 * and `aria-invalid` through the ControlValueAccessor + `NgControl`
 * integration.
 */
export const ErrorState: Story = {
  render: (args) => {
    const control = new FormControl(null, { validators: Validators.required });
    control.markAsTouched();
    return {
      props: { ...args, control },
      template: `<pa-select [formControl]="control" [options]="options" [size]="size" placeholder="Required field"></pa-select>`,
    };
  },
};

/**
 * Custom theme color — registers a custom "brand" primary via
 * `providePaTheme()` so `--pa-primary` (and every token derived from it,
 * e.g. `--pa-select-focus-border` and `--pa-select-option-selected-bg`)
 * resolves against a color with no repo-wide default, proving the
 * component consumes the theme engine rather than a hardcoded value.
 */
export const CustomThemeColor: Story = {
  decorators: [
    applicationConfig({
      providers: [
        providePaTheme({
          colors: {
            primary: { base: '#7c3aed', hover: '#6d28d9' },
          },
        }),
      ],
    }),
  ],
  render: (args) => {
    const control = new FormControl('banana');
    return {
      props: { ...args, control },
      template: `<pa-select [formControl]="control" [options]="options" [size]="size" [placeholder]="placeholder"></pa-select>`,
    };
  },
};
