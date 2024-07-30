import { parameters as rootParameters } from '../../../../.storybook/preview'
export * from '../../../../.storybook/preview'

export const parameters = {
  ...rootParameters,
  options: {
    storySort: ['Intro', '*'],
  },
}
