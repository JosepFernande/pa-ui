import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaInput } from './input.component';

const meta: Meta<PaInput> = {
  title: 'Input/PaInput',
  component: PaInput,
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
    size: 'md',
    disabled: false,
    readonly: false,
    placeholder: 'Placeholder text',
    ariaLabel: 'Input example',
  },
};

export default meta;

type Story = StoryObj<PaInput>;

/** Default story — single input with the controls-driven args. */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<input pa-input [size]="size" [disabled]="disabled" [readonly]="readonly" [placeholder]="placeholder" [ariaLabel]="ariaLabel">`,
  }),
};

/** Renders all 3 sizes side by side for the size currently selected. */
export const AllSizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
        <input pa-input size="sm" placeholder="Small">
        <input pa-input size="md" placeholder="Medium">
        <input pa-input size="lg" placeholder="Large">
      </div>
    `,
  }),
};

/** Disabled state — native disabled attribute, .pa-input--disabled, no focus ring. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<input pa-input [size]="size" [disabled]="disabled" [placeholder]="placeholder">`,
  }),
};

/** Read-only state — value present, editable removed, .pa-input--readonly. */
export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => ({
    props: args,
    template: `<input pa-input [size]="size" [readonly]="readonly" value="Read-only value">`,
  }),
};

/**
 * Error state — a touched, invalid FormControl drives `.pa-input--error` and
 * `aria-invalid` through the ControlValueAccessor + NgControl integration.
 */
export const ErrorState: Story = {
  render: (args) => {
    const control = new FormControl('', { validators: Validators.required });
    control.markAsTouched();
    return {
      props: { ...args, control },
      template: `<input pa-input [formControl]="control" [size]="size" placeholder="Required field">`,
    };
  },
};
