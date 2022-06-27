import {
  screen,
  within,
} from '@testing-library/react';

export const getById = (id) => within(screen.getByTestId(id));

export const componentPropsCheck = (Component, testId, expectedProps, partialCompare = false) => {
  const propertiesForCompare = Component.mock.calls
    .reverse()
    .find(item => item?.[0]?.['data-testid'] === testId);

  const resultExpectedProps = partialCompare
    ? expect.objectContaining(expectedProps)
    : {
      ...expectedProps,
      'data-testid': testId,
    };

  expect(propertiesForCompare[0]).toStrictEqual(resultExpectedProps);
};
