import { Component, signal, computed, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReclamacaoService } from '../../services/reclamacao.service';

@Component({
  selector: 'app-fiscal',
  standalone: true,
  imports: [CommonModule], // Importante para usar *ngFor e diretivas de formatação
  templateUrl: './fiscal.html',
  styleUrl: './fiscal.css'
})
export class FiscalComponent implements OnInit {
  private readonly reclamacaoService = inject(ReclamacaoService);

  // Evento para sinalizar ao app.ts o desejo de retornar ao formulário principal
  @Output() voltar = new EventEmitter<void>();

  // Estados reativos (Signals)
  protected readonly reclamacoes = signal<any[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly searchText = signal('');
  protected readonly selectedReclamacao = signal<any | null>(null);

  // Filtro dinâmico local baseado no que o fiscal digita na busca
  protected readonly filteredReclamacoes = computed(() => {
    const text = this.searchText().toLowerCase().trim();
    const list = this.reclamacoes();
    
    if (!text) return list;

    return list.filter(r => 
      (r.nomeConsumidor && r.nomeConsumidor.toLowerCase().includes(text)) ||
      (r.cpfConsumidor && r.cpfConsumidor.includes(text)) ||
      (r.nomeFornecedor && r.nomeFornecedor.toLowerCase().includes(text)) ||
      (r.protocoloProcon && r.protocoloProcon.toLowerCase().includes(text))
    );
  });

  ngOnInit() {
    this.carregarReclamacoes();
  }

  // Carrega todas as denúncias chamando a planilha Google
  protected carregarReclamacoes() {
    this.isLoading.set(true);
    this.reclamacaoService.obterReclamacoes().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.reclamacoes.set(res.data);
        } else {
          alert('Falha ao carregar as reclamações da planilha.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro de requisição GET', err);
        alert('Erro de conexão ao carregar a base de dados do Google Sheets.');
        this.isLoading.set(false);
      }
    });
  }

  // Atualiza o texto de busca sempre que o fiscal digita algo
  protected onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchText.set(input.value);
  }

  // Abre a ficha detalhada para auditoria
  protected abrirFicha(reclamacao: any) {
    this.selectedReclamacao.set(reclamacao);
  }

  // Fecha a visualização da ficha detalhada
  protected fecharFicha() {
    this.selectedReclamacao.set(null);
  }

  // Aciona o diálogo de impressão do próprio navegador
  protected imprimir() {
    window.print();
  }

  // Emite o sinal para voltar à tela do cidadão
  protected voltarAoFormulario() {
    this.voltar.emit();
  }
}
