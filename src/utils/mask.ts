/* eslint-disable no-confusing-arrow */
import { BigNumber } from 'bignumber.js'
import type { AutoCapitalizeOptions } from '../@types/AutoCapitalizeOptions'
import type { FormatType } from '../@types'
import toPattern from './toPattern'
import type { MaskOptions } from '../@types'

/**
 * function unMask(
 * @param {string} value
 * @param {'custom' | 'currency'} type
 * @returns {string}
 */
function unMask(
  value: string,
  type: 'custom' | 'currency' = 'custom',
  options?: MaskOptions
): string {
  if (type === 'currency') {
    if (!value) return '0'
    let unMaskedValue = value
    unMaskedValue =
      options?.prefix != null
        ? unMaskedValue.replace(options?.prefix, '')
        : unMaskedValue
    unMaskedValue =
      options?.suffix != null
        ? unMaskedValue.replace(options?.suffix, '')
        : unMaskedValue
    unMaskedValue = unMaskedValue.replace(/\D/g, '')
    const number = parseInt(unMaskedValue.trimStart())

    return isNaN(number) ? '0' : number.toString()
  }

  return value.replace(/\W/g, '')
}

/**
 * function masker(
 * @param {string} value
 * @param {string} patterns
 * @param {any} options
 * @returns {string}
 */
function masker(value: string, pattern: string, options: any) {
  const { autoCapitalize } = options

  const sentence = toPattern(value, { pattern, ...options })

  switch (autoCapitalize) {
    case 'characters':
      sentence.toUpperCase()
      break
    case 'words':
      sentence.replace(/(?:^|\s)\S/g, (text) => text.toUpperCase())
      break
    case 'sentences': {
      const lower = sentence.toLowerCase()
      lower.charAt(0).toUpperCase() + lower.substring(1)
      break
    }
  }

  return sentence
}

/**
 * function masker(
 * @param {string} value
 * @param {any} options
 * @returns {string}
 */
function currencyMasker(value = '0', options: any) {
  const {
    prefix,
    decimalSeparator,
    groupSeparator,
    precision,
    groupSize,
    secondaryGroupSize,
    fractionGroupSeparator,
    fractionGroupSize,
    suffix,
  } = options

  const precisionDivider = parseInt(1 + '0'.repeat(precision || 0))
  const number = parseInt(value) / precisionDivider

  const formatter = {
    prefix,
    decimalSeparator,
    groupSeparator,
    groupSize: groupSize || 3,
    secondaryGroupSize,
    fractionGroupSeparator,
    fractionGroupSize,
    suffix,
  }

  const bigNumber = new BigNumber(number)

  BigNumber.config({ FORMAT: formatter })

  return bigNumber.toFormat(precision)
}

function dateMasker(value = '', options: any) {
  const { dateFormat = 'yyyy/mm/dd' } = options

  const regex = /[a-zA-Z]/gi
  const pattern = dateFormat.replaceAll(regex, '9')
  return masker(value, pattern, {})
}

function timeMasker(value = '', options: any) {
  const { timeFormat = 'HH:mm:ss' } = options

  const pattern = timeFormat
  return masker(value, pattern, {})
}

/**
 * function multimasker(
 * @param {string} value
 * @param {string[]} patterns
 * @param {any} options
 * @returns {string}
 */
function multimasker(value: string, patterns: string[], options: any) {
  return masker(
    value,
    patterns.reduce(
      (memo: string, pattern: string) =>
        value.length <= unMask(memo).length ? memo : pattern,
      patterns[0]
    ),
    options
  )
}

function mask(
  value: string | number,
  pattern: string | string[] = '',
  type: FormatType = 'custom',
  options?: MaskOptions,
  autoCapitalize?: AutoCapitalizeOptions
): string {
  if (type === 'currency') {
    return currencyMasker(String(value), options)
  }

  if (type === 'date') {
    return dateMasker(String(value), options)
  }

  if (type === 'time') {
    return timeMasker(String(value), options)
  }

  if (typeof pattern === 'string') {
    return masker(String(value), pattern || '', {
      autoCapitalize: autoCapitalize,
    })
  }

  return multimasker(String(value), pattern, {})
}

export { mask, unMask }
