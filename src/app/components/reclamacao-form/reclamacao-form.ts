import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { cpfValidator } from '../../validators/cpf.validador';
import { ReclamacaoService } from '../../services/reclamacao.service';

@Component({
  selector: 'app-reclamacao-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reclamacao-form.html',
  styleUrl: './reclamacao-form.css'
})
export class ReclamacaoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reclamacaoService = inject(ReclamacaoService);

  // Estados reativos (Signals) para controle de tela e UX
  protected readonly currentStep = signal(1);
  protected readonly isSubmitting = signal(false);
  protected readonly submissionSuccess = signal(false);
  protected readonly receiptProtocol = signal('');
  protected readonly receiptDate = signal('');

  // FormGroup contendo todos os campos do formulário
  protected form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      // 1. Categoria do Serviço
      tipoServico: ['', Validators.required],
      bandeiraCartao: [{ value: '', disabled: true }],

      // 2. Dados do Consumidor
      nomeConsumidor: ['', Validators.required],
      cpfConsumidor: ['', [Validators.required, cpfValidator]],
      telefoneConsumidor: [''],
      emailConsumidor: ['', Validators.email],
      enderecoConsumidor: ['', Validators.required],

      // 3. Dados do Fornecedor
      nomeFornecedor: ['', Validators.required],
      contatoSac: ['', Validators.required],
      dataContato: ['', Validators.required],
      horaContato: ['', Validators.required],
      protocolo: ['', Validators.required],

      // 4. Questionário do SAC (Sim ou Não)
      q1: ['', Validators.required],
      q2: ['', Validators.required],
      q3: ['', Validators.required],
      q4: ['', Validators.required],
      q5: ['', Validators.required],
      q6: ['', Validators.required],
      q7: ['', Validators.required],
      q8: ['', Validators.required],
      q9: [''], // Opcional
      q10: ['', Validators.required],
      q11: ['', Validators.required],
      q12: ['', Validators.required],
      q13: [''], // Opcional
      consentimentoLgpd: [false, Validators.requiredTrue]
    });

    // Lógica Condicional: Se o serviço for "Cartão de Crédito", habilita a Bandeira.
    this.form.get('tipoServico')?.valueChanges.subscribe(value => {
      const bandeiraCtrl = this.form.get('bandeiraCartao');
      if (value === 'Cartão de Credito') {
        bandeiraCtrl?.enable();
      } else {
        bandeiraCtrl?.disable();
        bandeiraCtrl?.setValue('');
      }
    });
  }

  // Formata o CPF em tempo real (000.000.000-00)
  protected onCpfInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    let formatted = value;
    if (value.length > 3) {
      formatted = value.substring(0, 3) + '.' + value.substring(3);
    }
    if (value.length > 6) {
      formatted = formatted.substring(0, 7) + '.' + formatted.substring(7);
    }
    if (value.length > 9) {
      formatted = formatted.substring(0, 11) + '-' + formatted.substring(11);
    }

    input.value = formatted;
    this.form.get('cpfConsumidor')?.setValue(formatted, { emitEvent: false });
  }

  // Formata o Telefone em tempo real ((00) 00000-0000)
  protected onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    let formatted = value;
    if (value.length > 0) {
      formatted = '(' + value;
    }
    if (value.length > 2) {
      formatted = formatted.substring(0, 3) + ') ' + formatted.substring(3);
    }
    if (value.length > 7) {
      formatted = formatted.substring(0, 10) + '-' + formatted.substring(10);
    }

    input.value = formatted;
    this.form.get('telefoneConsumidor')?.setValue(formatted, { emitEvent: false });
  }

  // Avança para a próxima etapa, validando apenas os campos da etapa atual
  protected nextStep(step: number) {
    if (this.isStepValid(step)) {
      this.currentStep.set(step + 1);
    } else {
      this.markStepAsTouched(step);
    }
  }

  // Volta para a etapa anterior
  protected prevStep(step: number) {
    this.currentStep.set(step - 1);
  }

  // Validação dinâmica por etapa (impede travamento por campos desativados)
  private isStepValid(step: number): boolean {
    const fields = this.getFieldsForStep(step);
    return fields.every(field => !this.form.get(field)?.invalid);
  }

  // Marca os campos da etapa atual como "tocados" para exibir mensagens de erro
  private markStepAsTouched(step: number) {
    const fields = this.getFieldsForStep(step);
    fields.forEach(field => {
      const ctrl = this.form.get(field);
      ctrl?.markAsTouched();
      ctrl?.updateValueAndValidity();
    });
  }

  // Retorna a lista de campos que pertencem a cada etapa
  private getFieldsForStep(step: number): string[] {
    switch (step) {
      case 1:
        return ['tipoServico', 'bandeiraCartao'];
      case 2:
        return ['nomeConsumidor', 'cpfConsumidor', 'telefoneConsumidor', 'emailConsumidor', 'enderecoConsumidor'];
      case 3:
        return ['nomeFornecedor', 'contatoSac', 'dataContato', 'horaContato', 'protocolo'];
      case 4:
        return ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q10', 'q11', 'q12', 'consentimentoLgpd'];
      default:
        return [];
    }
  }

  // Envio final dos dados pelo serviço
  protected onSubmit() {
    if (this.form.invalid) {
      this.markStepAsTouched(4);
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.form.getRawValue();

    this.reclamacaoService.enviarReclamacao(formData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
        this.receiptProtocol.set(res.protocol || 'FISCAL-' + Math.floor(Math.random() * 1000000));
        this.receiptDate.set(new Date().toLocaleString('pt-BR'));
      },
      error: (err) => {
        console.error('Falha de envio', err);
        this.isSubmitting.set(false);
        alert('Erro ao conectar ao servidor do Procon. Por favor, tente enviar novamente.');
      }
    });
  }

  // Limpa o formulário e retorna à primeira etapa
  protected resetForm() {
    this.form.reset();
    this.currentStep.set(1);
    this.submissionSuccess.set(false);
  }
}
