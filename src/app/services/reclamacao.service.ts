import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReclamacaoService {
  private readonly http = inject(HttpClient);
  // URL oficial configurada da API do Google Apps Script
  private readonly scriptUrl = 'https://script.google.com/macros/s/AKfycbzbCphW0U2qPD-yaAucZ8vG41wxCFQrjEr7D87Cl5A3i-F1OmfkgnZBtq3ADnShfIOy/exec';

  // Salva uma nova reclamação (Cidadão)
  enviarReclamacao(formData: any): Observable<{ status: string; protocol?: string }> {
    const payload = {
      ...formData,
      chaveSeguranca: 'PROCON_PE_SECURE_TOKEN_2026'
    };

    return this.http.post<{ status: string; protocol?: string }>(
      this.scriptUrl,
      JSON.stringify(payload),
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }

  // Consulta todas as reclamações (Área do Fiscal) <--- NOVO MÉTODO!
  obterReclamacoes(): Observable<{ status: string; data?: any[]; message?: string }> {
    const url = `${this.scriptUrl}?chaveSeguranca=PROCON_PE_SECURE_TOKEN_2026`;
    return this.http.get<{ status: string; data?: any[]; message?: string }>(url);
  }
}
