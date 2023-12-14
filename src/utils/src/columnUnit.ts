export const indexField = { columnName: 'index', columnTitle: '序号' }

export const actionField = {
  columnName: 'action',
  columnTitle: '操作',
  width: '180px',
  fixed: 'right'
}

export function getField(columnTitle: string, columnName: string) {
  return { columnTitle, columnName }
}

/**输入框 */
export function getInputColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '文本控件',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Input',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema

  return column
}

/**文本域 */
export function getTextareaColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '文本框',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Textarea',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**上传图片 */
export function getUploadPicturesColumn(
  columnTitle: string,
  columnName: string | number,
  columnId: string | number,
  count: number,
  category: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '上传图片',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    columnId: columnId,
    labelMessage: '',
    component: 'UploadPictures',
    componentProps: { disabled: false, count: count, category: category },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**单选 */
export function getSelectColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any,
  disabled?: boolean
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '单选',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Select',
    componentProps: { filterable: true, options, disabled: disabled },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**旧 */
/**地址选择 */
export function getCustomAreaColumn(
  columnTitle: string,
  columnName: string | number,
  addressCityText?: string,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '地址选择',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    addressCityText: addressCityText,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Area',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**密码输入框 */
export function getPasswordColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '密码框',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Password',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**开关框 */
export function getSwitchColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '开关框',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Switch',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**单位 */
export function getInputUnitColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '单位输入框',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'InputUnit',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**评分 */
export function getRateColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '评分',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Rate',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**日期选择 */
export function getCustomDateColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '日期选择',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'CustomDate',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**时间选择 */
export function getCustomTimeColumn(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '时间选择',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'CustomTime',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**单选 */
export function getRadioGroupColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '单选',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'RadioGroup',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**弹出层选择 */
export function getSelectPopupColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: 'SelectPopup',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'SelectPopup',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**多选 */
export function getCheckboxGroupColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '多选',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'CheckboxGroup',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**上传文件 */
export function getUploaderColumn(
  columnTitle: string,
  columnName: string | number,
  columnId: string | number,
  placeholder?: string,
  category?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '上传文件',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    columnId: columnId,
    labelMessage: '',
    component: 'Uploader',
    componentProps: { disabled: false, category: category },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**文本框 */
export function getAddress(
  columnTitle: string,
  columnName: string | number,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '文本框',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Address',
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**跳转 */
export function getPathColumn(
  columnTitle: string,
  columnName: string | number,
  departmentId: string | number,
  multiple: boolean,
  placeholder?: string,
  params?: any,
  type?: string | number
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 1,
    columnType: '跳转',
    columnRequired: columnRequired,
    columnScreenType: '0',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    departmentId: departmentId,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Path',
    multiple: multiple,
    type: type,
    componentProps: { disabled: false },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**单选 */
export function getPickerColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '单选',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'Select',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**
 * 弹出层多选
 * @param columnTitle
 * @param columnName
 * @param options
 * @param placeholder
 * @param params
 * @returns
 */
export function getDCheckboxColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '弹出层多选',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'DCheckbox',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**
 * 弹出层单选
 * @param columnTitle
 * @param columnName
 * @param options
 * @param placeholder
 * @param params
 * @returns
 */
export function getDPickerColumn(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '单选',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'DSelect',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}

/**
 * 动作面板
 * @param columnTitle
 * @param columnName
 * @param options
 * @param placeholder
 * @param params
 * @returns
 */
export function getDActionSheet(
  columnTitle: any,
  columnName: string | number,
  options: any,
  placeholder?: string,
  params?: any
) {
  const value = params?.value ? params?.value[columnName] ?? null : null
  const columnRequired = params?.columnRequired ?? '0'
  const column = {
    columnAlias: '',
    groupId: '',
    columnName: columnName,
    columnTitle: columnTitle,
    columnControl: 2,
    columnType: '动作面板',
    columnRequired: columnRequired,
    columnScreenType: '1',
    columnNameValue: value
  } as any
  const formSchema = {
    field: columnName,
    label: columnTitle,
    placeholder: placeholder,
    labelMessage: '',
    component: 'DActionSheet',
    componentProps: { filterable: true, options },
    colProps: null,
    formItemProps: null,
    value: value,
    hidden: null,
    columnStyle: params?.columnStyle ?? '',
    inputStyle: params?.inputStyle ?? ''
  }
  column['formSchema'] = formSchema
  return column
}
