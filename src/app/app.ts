import { Component } from '@angular/core';
import { ReclamacaoForm } from './components/reclamacao-form/reclamacao-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReclamacaoForm], // Importa o novo componente do formulário modularizado
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
