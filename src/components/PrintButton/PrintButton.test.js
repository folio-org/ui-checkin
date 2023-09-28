import ReactToPrint from 'react-to-print';

import {
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Button,
} from '@folio/stripes/components';

import PrintButton from './PrintButton';
import ComponentToPrint from '../ComponentToPrint';

jest.mock('../ComponentToPrint', () => jest.fn((props) => (
  <div {...props} />
)));
jest.mock('react-to-print', () => jest.fn(({ children, trigger, ...rest }) => (
  <div {...rest}>
    {children}
    {trigger()}
  </div>
)));

const defaultProps = {
  dataSource: {},
  template: 'testTemplate',
  onBeforePrint: jest.fn(),
  onAfterPrint: jest.fn(),
  children: 'buttonName',
  specificButtonProp: 'test',
};

describe('PrintButton', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    render(
      <PrintButton
        {...defaultProps}
      />
    );
  });

  it('"ReactToPrint" should be called with correct props', () => {
    const expectedProps = {
      trigger: expect.any(Function),
      content: expect.any(Function),
      removeAfterPrint: true,
      onBeforePrint: defaultProps.onBeforePrint,
      onAfterPrint: defaultProps.onAfterPrint,
    };

    expect(ReactToPrint).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });

  it('"ComponentToPrint" should be called with correct props', () => {
    const expectedProps = {
      template: defaultProps.template,
      dataSource: defaultProps.dataSource,
    };

    expect(ComponentToPrint).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });

  it('"Button" should be called with correct and filtered props', () => {
    const expectedProps = {
      specificButtonProp: defaultProps.specificButtonProp,
      children: defaultProps.children,
    };

    expect(Button).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });
});
