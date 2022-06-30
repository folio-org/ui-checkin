/* eslint-disable max-classes-per-file */
import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import Barcode from 'react-barcode';

import '../../../test/jest/__mock__';

import ComponentToPrint, {
  shouldProcessNode,
  processNode,
} from './ComponentToPrint';
import { buildTemplate } from '../../util';

const mockProcessDefaultNode = jest.fn();
const mockParseWithInstructions = jest.fn((componentStr) => componentStr);

jest.mock('html-to-react', () => ({
  __esModule: true,
  default: {
    ProcessNodeDefinitions: class {
      processDefaultNode = mockProcessDefaultNode;
    },
  },
  Parser: class {
    parseWithInstructions = mockParseWithInstructions;
  },
}));
jest.mock('../../util', () => ({
  buildTemplate: jest.fn(Template => (data) => (Template ? <Template {...data} /> : null)),
}));
jest.mock('react-barcode', () => jest.fn(() => null));

describe('ComponentToPrint', () => {
  const buttonText = 'Test button string';

  afterEach(() => {
    buildTemplate.mockClear();
    mockParseWithInstructions.mockClear();
    Barcode.mockClear();
  });

  describe('when "componentStr" is present', () => {
    const mockedTemplate = 'button';
    beforeEach(() => {
      render(
        <ComponentToPrint
          template={mockedTemplate}
          dataSource={{ children: buttonText }}
        />
      );
    });

    it('should render passed template', () => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should correctly pass "dataSource"', () => {
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });

    it('should execute "buildTemplate" with correct props', () => {
      expect(buildTemplate).toBeCalledWith(mockedTemplate);
    });

    it('should execute "mockParseWithInstructions" with correct props', () => {
      const expectedResult = [
        {
          replaceChildren: true,
          shouldProcessNode,
          processNode,
        },
        {
          shouldProcessNode: expect.any(Function),
          processNode: mockProcessDefaultNode,
        },
      ];

      expect(mockParseWithInstructions).toBeCalledWith(expect.anything(), expect.any(Function), expectedResult);
    });
  });

  describe('when "componentStr" is absent', () => {
    it('should not render anything', () => {
      const { container } = render(
        <ComponentToPrint
          template=""
          dataSource={{ children: buttonText }}
        />
      );

      expect(container.childElementCount).toEqual(0);
    });
  });

  describe('shouldProcessNode', () => {
    it('should return true when node with name equal to "barcode" passed', () => {
      expect(shouldProcessNode({ name: 'barcode' })).toBe(true);
    });

    it('shoudl return false when node name is not equal to "barcode"', () => {
      expect(shouldProcessNode({ name: 'test' })).toBe(false);
    });
  });

  describe('processNode', () => {
    it('should execute "Barcode" with correct props when children are present', () => {
      const mockedChild = ' test ';
      render(processNode('node', [mockedChild]));

      expect(Barcode).toHaveBeenCalledWith({ value: mockedChild.trim() }, {});
    });

    it('should execute "Barcode" with correct props when children are absent', () => {
      render(processNode('node', []));

      expect(Barcode).toHaveBeenCalledWith({ value: ' ' }, {});
    });
  });
});
