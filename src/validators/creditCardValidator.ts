import cardValidator from 'card-validator';

const creditCardValid = {
  $validator: (value: string | null | undefined): boolean => {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    return cardValidator.number(value).isValid;
  },
  $message: 'Must be a valid card number.',
} as const;

export default creditCardValid;
