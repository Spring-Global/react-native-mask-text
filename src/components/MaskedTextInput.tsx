import React, {
  useEffect,
  useState,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useImperativeHandle,
} from 'react'
import { TextInput, TextInputProps } from 'react-native'
import { mask, unMask } from '../utils/mask'
import type {
  FormatType,
  MaskOptions,
  StyleObj,
  TextDecorationOptions,
} from '../@types'

type TIProps = Omit<TextInputProps, 'onChangeText'>
export interface MaskedTextInputProps extends TIProps {
  mask?: string
  type?: FormatType
  options?: MaskOptions
  defaultValue?: string
  onChangeText: (text: string, rawText: string) => void
  inputAccessoryView?: JSX.Element
  textBold?: boolean
  textItalic?: boolean
  textDecoration?: TextDecorationOptions
  style?: StyleObj
  selectionType?: 'state' | 'setNativeProps'
}

export const MaskedTextInputComponent: ForwardRefRenderFunction<
  TextInput,
  MaskedTextInputProps
> = (
  {
    mask: pattern = '',
    type = 'custom',
    options = {} as MaskOptions,
    defaultValue,
    onChangeText,
    value,
    inputAccessoryView,
    autoCapitalize = 'sentences',
    textBold,
    textItalic,
    textDecoration,
    style,
    selectionType = 'state',
    ...rest
  },
  ref
): JSX.Element => {
  const innerRef = useRef<React.ComponentRef<typeof TextInput>>(null)

  useImperativeHandle(
    ref,
    () => innerRef.current as React.ComponentRef<typeof TextInput>
  )

  const styleSheet = [
    {
      fontWeight: textBold && 'bold',
      fontStyle: textItalic && 'italic',
      textDecorationLine: textDecoration,
    },
    style,
  ]
  const getMaskedValue = (value: string) =>
    mask(value, pattern, type, options, autoCapitalize)
  const getUnMaskedValue = (value: string) =>
    unMask(value, type as 'custom' | 'currency')

  const defaultValueCustom = defaultValue || ''
  const defaultValueCurrency = defaultValue || '0'

  const initialRawValue = value

  const initialMaskedValue = getMaskedValue(
    type === 'currency' ? defaultValueCurrency : defaultValueCustom
  )

  const initialUnMaskedValue = getUnMaskedValue(
    type === 'currency' ? defaultValueCurrency : defaultValueCustom
  )

  const refValues = useRef({
    maskedValue: initialMaskedValue,
    unMaskedValue: initialUnMaskedValue,
    rawValue: initialRawValue,
  })
  const [maskedValue, setMaskedValue] = useState(initialMaskedValue)
  const [unMaskedValue, setUnmaskedValue] = useState(initialUnMaskedValue)
  const [rawValue, setRawValue] = useState(initialRawValue)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined)

  const actualValue = pattern || type === 'currency' ? maskedValue : rawValue

  function onChange(value: string) {
    const newUnMaskedValue = unMask(
      value,
      type as 'custom' | 'currency',
      options
    )
    const newMaskedValue = mask(newUnMaskedValue, pattern, type, options)

    setMaskedValue(newMaskedValue)
    setUnmaskedValue(newUnMaskedValue)
    setRawValue(value)

    refValues.current = {
      maskedValue: newMaskedValue,
      unMaskedValue: newUnMaskedValue,
      rawValue: value,
    }
  }

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false)
      return
    }

    onChangeText(maskedValue, unMaskedValue)
  }, [maskedValue, unMaskedValue])

  useEffect(() => {
    if (value) {
      setMaskedValue(getMaskedValue(value))
      setUnmaskedValue(getUnMaskedValue(value))
    } else {
      setMaskedValue(initialMaskedValue)
      setUnmaskedValue(initialUnMaskedValue)
    }
  }, [value])

  return (
    <>
      <TextInput
        onChangeText={(value) => onChange(value)}
        ref={innerRef}
        maxLength={pattern.length || undefined}
        autoCapitalize={autoCapitalize}
        {...rest}
        value={actualValue}
        style={styleSheet as StyleObj}
        selection={selection}
        onSelectionChange={() => {
          // the idea here is to avoid the cursor going to the suffix
          if (options.suffix) {
            // always keep the cursor at the end of the input
            const startIndexOf = Math.max(
              refValues.current.maskedValue.length - options.suffix.length,
              0
            )
            const newSelection = { start: startIndexOf, end: startIndexOf }
            if (selectionType == 'state') {
              setSelection(newSelection)
            } else {
              innerRef.current?.setNativeProps({
                selection: newSelection,
              })
            }
          }
        }}
      />
      {inputAccessoryView}
    </>
  )
}

export const MaskedTextInput = forwardRef(MaskedTextInputComponent)
