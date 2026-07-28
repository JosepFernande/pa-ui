import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { providePaTheme } from '@pa-ui/core';
import { PaButton } from './button.component';

/**
 * Visual proof for Issue #59: `PaButton` consumes the theme engine's derived
 * semantic variants (base/hover/active/contrast). This story registers one
 * custom color ("brand") on top of the default palette via `providePaTheme()`
 * so the color control can demonstrate both a default theme color and a
 * genuinely custom one.
 */
const meta: Meta<PaButton> = {
  title: 'Button/PaButton',
  component: PaButton,
  decorators: [
    applicationConfig({
      providers: [
        providePaTheme({
          colors: {
            brand: '#ec4899',
            primary: { base: '#16709e', hover: '#0a4f6b' },
          },
        }),
      ],
    }),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'success', 'danger', 'warning', 'neutral', 'brand'],
      description:
        'Theme-registered color name. "brand" is a custom color registered via providePaTheme() for this story, proving the 4 host-bound variants derive from any registered color, not just the defaults.',
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    color: 'primary',
    variant: 'solid',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
  },
};

export default meta;

type Story = StoryObj<PaButton>;

/**
 * Default story — uses the "primary" default color (Scenario: Default
 * control value).
 */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<button pa-button [variant]="variant" [size]="size" [color]="color" [disabled]="disabled" [loading]="loading" [type]="type">Button</button>`,
  }),
};

/**
 * Renders all 4 button variants for the color currently selected in the
 * `color` control, including the custom "brand" option (Scenario: Custom
 * color changes rendered button — background reflects --pa-{name}, hover
 * and active are reachable via interaction, text reflects
 * --pa-{name}-contrast).
 */
export const AllVariants: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <button pa-button variant="solid" [size]="size" [color]="color" [disabled]="disabled" [loading]="loading" [type]="type">Solid</button>
        <button pa-button variant="outline" [size]="size" [color]="color" [disabled]="disabled" [loading]="loading" [type]="type">Outline</button>
        <button pa-button variant="ghost" [size]="size" [color]="color" [disabled]="disabled" [loading]="loading" [type]="type">Ghost</button>
      </div>
    `,
  }),
};

/**
 * Pins the color control to the custom "brand" color registered for this
 * story, proving the 4 derived host variables resolve against a color that
 * has no repo-wide default.
 */
export const CustomBrandColor: Story = {
  args: {
    color: 'brand',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <button pa-button variant="solid" [size]="size" color="brand" [disabled]="disabled" [loading]="loading" [type]="type">Solid</button>
        <button pa-button variant="outline" [size]="size" color="brand" [disabled]="disabled" [loading]="loading" [type]="type">Outline</button>
        <button pa-button variant="ghost" [size]="size" color="brand" [disabled]="disabled" [loading]="loading" [type]="type">Ghost</button>
      </div>
    `,
  }),
};
