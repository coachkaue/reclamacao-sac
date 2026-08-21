import { Component, signal } from '@angular/core';
import { ReclamacaoForm } from './components/reclamacao-form/reclamacao-form';
import { FiscalComponent } from './components/fiscal/fiscal'; // Importa o painel do fiscal

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReclamacaoForm, FiscalComponent], // Registra os dois componentes
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Define qual tela está ativa no momento: 'form' (Cidadão) ou 'fiscal' (Administrativa)
  protected readonly currentView = signal<'form' | 'fiscal'>('form');

  // Solicita a senha para entrar na Área Administrativa
  protected irParaFiscal() {
    const senha = prompt('Digite a senha de acesso da Área do Fiscal:');
    if (senha === 'procon123') {
      this.currentView.set('fiscal');
    } else if (senha !== null) {
      alert('Senha incorreta de acesso.');
    }
  }

  // Retorna para o formulário do cidadão
  protected voltarAoForm() {
    this.currentView.set('form');
  }
}
