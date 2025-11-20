/**
 * Utilitários de normalização/validação de CPF/CNPJ em JS puro
 */
function digitsOnly(v) {
  return String(v || '').replace(/\D/g, '')
}

function inferDocType(doc) {
  const d = digitsOnly(doc)
  if (d.length === 11) return 'CPF'
  if (d.length === 14) return 'CNPJ'
  return null
}

function normalizeCpfCnpj(cpf, cnpj) {
  const c1 = digitsOnly(cpf)
  const c2 = digitsOnly(cnpj)
  if (c1 && c2) throw new Error('Informe apenas CPF ou apenas CNPJ')
  const type = inferDocType(c1 || c2)
  if (!type) throw new Error('Formato inválido para CPF/CNPJ')
  return { value: c1 || c2, type }
}

module.exports = { digitsOnly, inferDocType, normalizeCpfCnpj }