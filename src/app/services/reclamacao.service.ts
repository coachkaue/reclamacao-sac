import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReclamacaoService {
  private readonly http = inject(HttpClient);
  // URL oficial configurada da API do Google Apps Script
  private readonly scriptUrl = 'https://script.google.com/macros/s/AKfycbwQfztIL0MWruSLz8prOwpd5gAC2Wq8QDTS93Ingbv25cN0Ku58fG_r3IUkBBMaLeb1/exec';

    enviarReclamacao(formData: any): Observable<{ status: string; protocol?: string }> {
    // Anexa a chave de segurança secreta que o Google Apps Script exigirá
    const payload = {
      ...formData,
      chaveSeguranca: 'PROCON_PE_SECURE_TOKEN_2026'
    };

    // Enviamos o JSON como string com tipo text/plain para evitar o erro de CORS
    return this.http.post<{ status: string; protocol?: string }>(
      this.scriptUrl,
      JSON.stringify(payload),
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }
}
