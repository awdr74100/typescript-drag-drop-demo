// Validation Utility
export interface Validatable {
  value: string | number;
  required?: boolean; // 也可寫為 required: boolean | undefined (就為問號的實際表示)(函式參數也為同個概念)
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validatableInput: Validatable) {
  if (
    validatableInput.required &&
    (Number.isNaN(validatableInput.value) || !validatableInput.value.toString().trim())
  )
    return false;

  if (
    typeof validatableInput.minLength === 'number' &&
    typeof validatableInput.value === 'string' &&
    validatableInput.value.length < validatableInput.minLength
  )
    return false;

  if (
    typeof validatableInput.maxLength === 'number' &&
    typeof validatableInput.value === 'string' &&
    validatableInput.value.length > validatableInput.maxLength
  )
    return false;

  if (
    typeof validatableInput.min === 'number' &&
    typeof validatableInput.value === 'number' &&
    validatableInput.value < validatableInput.min
  )
    return false;

  if (
    typeof validatableInput.max === 'number' &&
    typeof validatableInput.value === 'number' &&
    validatableInput.value > validatableInput.max
  )
    return false;

  return true;
}
