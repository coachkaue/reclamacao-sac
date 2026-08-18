import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const cpf = control.value ? control.value.replace(/[^\d]+/g, '') : '';
  if (!cpf) return null; // Deixa o validador 'Validators.required' lidar com campos vazios

  // CPFs com tamanho incorreto ou todos os dígitos iguais são inválidos
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return { invalidCpf: true };
  }

  // Validação do primeiro dígito verificador
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return { invalidCpf: true };

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return { invalidCpf: true };

  return null; // CPF é válido!
}
