// Chave de segurança secreta para autenticar as requisições
var CHAVE_SEGURANCA_REQUERIDA = 'PROCON_PE_SECURE_TOKEN_2026';

// -------------------------------------------------------------
// FUNÇÃO GET: Usada pela Área do Fiscal para LISTAR as reclamações
// -------------------------------------------------------------
function doGet(e) {
  try {
    // 1. Validação de Segurança
    var token = e.parameter.chaveSeguranca;
    if (token !== CHAVE_SEGURANCA_REQUERIDA) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Acesso não autorizado."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    // Se a planilha estiver vazia ou só tiver cabeçalho
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var result = [];
    
    // Varre as linhas pulando a linha 1 (cabeçalho)
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      result.push({
        carimboDataHora: row[0],
        tipoServico: row[1],
        nomeConsumidor: row[2],
        cpfConsumidor: row[3],
        enderecoConsumidor: row[4],
        telefoneConsumidor: row[5],
        emailConsumidor: row[6],
        nomeFornecedor: row[7],
        contatoSac: row[8],
        dataContato: row[9],
        horaContato: row[10],
        protocolo: row[11],
        bandeiraCartao: row[12],
        q1: row[13],
        q2: row[14],
        q3: row[15],
        q4: row[16],
        q5: row[17],
        q6: row[18],
        q7: row[19],
        q8: row[20],
        q9: row[21],
        q10: row[22],
        q11: row[23],
        q12: row[24],
        q13: row[25],
        protocoloProcon: row[26] || ""
      });
    }

    // Inverte o array para mostrar os mais recentes primeiro
    result.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------
// FUNÇÃO POST: Usada pelo Cidadão para SALVAR uma nova reclamação
// -------------------------------------------------------------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. Validação de Segurança
    if (data.chaveSeguranca !== CHAVE_SEGURANCA_REQUERIDA) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Acesso não autorizado."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Validação básica de campos obrigatórios
    if (!data.tipoServico || !data.nomeConsumidor || !data.cpfConsumidor) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Dados obrigatórios ausentes."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Validação do CPF no servidor
    if (!validarCPF(data.cpfConsumidor)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "CPF inválido."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timestamp = new Date();
    var protocol = "PROCON-" + timestamp.getFullYear() + "-" + Math.floor(Math.random() * 900000 + 100000);

    // Mapeia e Higieniza os dados contra XSS
    var newRow = [
      timestamp,                                  // Coluna A: Data/Hora
      sanitizeInput(data.tipoServico),            // Coluna B: Tipo de Serviço
      sanitizeInput(data.nomeConsumidor),         // Coluna C: Nome
      sanitizeInput(data.cpfConsumidor),          // Coluna D: CPF
      sanitizeInput(data.enderecoConsumidor),      // Coluna E: Endereço
      sanitizeInput(data.telefoneConsumidor || ""),// Coluna F: Telefone
      sanitizeInput(data.emailConsumidor || ""),   // Coluna G: E-mail
      sanitizeInput(data.nomeFornecedor),         // Coluna H: Fornecedor
      sanitizeInput(data.contatoSac),             // Coluna I: SAC do Fornecedor
      sanitizeInput(data.dataContato),            // Coluna J: Data Contato
      sanitizeInput(data.horaContato),            // Coluna K: Hora Contato
      sanitizeInput(data.protocolo),              // Coluna L: Protocolo do Fornecedor
      sanitizeInput(data.bandeiraCartao || ""),   // Coluna M: Bandeira Cartão
      sanitizeInput(data.q1),                     // Coluna N: Q1
      sanitizeInput(data.q2),                     // Coluna O: Q2
      sanitizeInput(data.q3),                     // Coluna P: Q3
      sanitizeInput(data.q4),                     // Coluna Q: Q4
      sanitizeInput(data.q5),                     // Coluna R: Q5
      sanitizeInput(data.q6),                     // Coluna S: Q6
      sanitizeInput(data.q7),                     // Coluna T: Q7
      sanitizeInput(data.q8),                     // Coluna U: Q8
      sanitizeInput(data.q9 || ""),               // Coluna V: Q9
      sanitizeInput(data.q10),                    // Coluna W: Q10
      sanitizeInput(data.q11),                    // Coluna X: Q11
      sanitizeInput(data.q12),                    // Coluna Y: Q12
      sanitizeInput(data.q13 || ""),              // Coluna Z: Q13
      protocol                                    // Coluna AA: Protocolo Oficial PROCON
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      protocol: protocol
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Sanitização de entradas contra XSS
function sanitizeInput(input) {
  if (input === null || input === undefined) return "";
  var str = String(input);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validação matemática do CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  var soma = 0;
  var resto;
  for (var i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (var i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}
