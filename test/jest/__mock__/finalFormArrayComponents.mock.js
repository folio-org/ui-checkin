jest.mock('react-final-form-arrays', () => ({
  FieldArray: jest.fn(() => null),
}));
