const { digitsOnly, inferDocType, normalizeCpfCnpj } = require('../src/lib/doc-validation')

describe('doc-validation utilities', () => {
  test('digitsOnly removes non-digits', () => {
    expect(digitsOnly('123.456.789-00')).toBe('12345678900')
    expect(digitsOnly('12.345.678/0001-90')).toBe('12345678000190')
  })

  test('inferDocType identifies CPF and CNPJ', () => {
    expect(inferDocType('12345678900')).toBe('CPF')
    expect(inferDocType('12345678000190')).toBe('CNPJ')
    expect(inferDocType('')).toBeNull()
  })

  test('normalizeCpfCnpj enforces single document', () => {
    const cpf = '123.456.789-00'
    const cnpj = ''
    const r1 = normalizeCpfCnpj(cpf, cnpj)
    expect(r1.type).toBe('CPF')
    expect(r1.value).toBe('12345678900')

    const r2 = normalizeCpfCnpj('', '12.345.678/0001-90')
    expect(r2.type).toBe('CNPJ')
    expect(r2.value).toBe('12345678000190')

    expect(() => normalizeCpfCnpj('1', '')).toThrow()
    expect(() => normalizeCpfCnpj('', '2')).toThrow()
    expect(() => normalizeCpfCnpj('12345678900', '12345678000190')).toThrow()
  })
})