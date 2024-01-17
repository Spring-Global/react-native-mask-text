import React from 'react'
import { Text, TextProps } from 'react-native'
import { mask } from '../utils/mask'
import type { MaskOptions, StyleObj, TextDecorationOptions } from '../@types'
export interface MaskedTextProps {
  children: string
  mask?: string
  type?: 'custom' | 'currency'
  options?: MaskOptions
  textBold?: boolean
  textItalic?: boolean
  textDecoration?: TextDecorationOptions
  style?: StyleObj
}

export function MaskedText({
  children: text,
  mask: pattern = '',
  type = 'custom',
  options = {} as MaskOptions,
  textBold,
  textItalic,
  textDecoration,
  style,
  ...rest
}: MaskedTextProps & TextProps): JSX.Element {
  const styleSheet = [
    {
      fontWeight: textBold && 'bold',
      fontStyle: textItalic && 'italic',
      textDecorationLine: textDecoration,
    },
    style,
  ]

  return (
    <Text {...rest} style={styleSheet as StyleObj}>
      {mask(text, pattern, type, options)}
    </Text>
  )
}
