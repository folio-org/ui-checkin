/* eslint-disable import/prefer-default-export */
import {
  screen,
  within,
} from '@testing-library/react';

export const getById = (id) => within(screen.getByTestId(id));
