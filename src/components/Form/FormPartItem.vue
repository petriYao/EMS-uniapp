<script setup lang="ts">
import { ref, PropType, onBeforeMount, watch } from 'vue'
import FormInput from './formItem/FormInput.vue'
import FormSwitch from './formItem/FormSwitch.vue'
import FormPicker from './formItem/FormPicker.vue'
import FormCustomDate from './formItem/FormCustomDate.vue'
import FormCustomTime from './formItem/FormCustomTime.vue'
import FormRadioGroup from './formItem/FormRadioGroup.vue'
import FormSelectPopup from './formItem/FormSelectPopup.vue'
import FormCheckboxGroup from './formItem/FormCheckboxGroup.vue'
import FormRate from './formItem/FormRate.vue'
import FormUploadPictures from './formItem/FormUploadPictures.vue'
import FormUploader from './formItem/FormUploader.vue'
import FormTextarea from './formItem/FormTextarea.vue'
import FormInputUnit from './formItem/FormInputUnit.vue'
import FormPath from './formItem/FormPath.vue'
import FormArea from './formItem/FormArea.vue'
import FormAddress from './formItem/FormAddress.vue'
import FormDCheckbox from './formItem/FormDCheckbox.vue'
import FormDPicker from './formItem/FormDPicker.vue'
import FormDActionSheet from './formItem/FormDActionSheet.vue'
import { isEmpty } from 'lodash-es'

// import { getUview } from '@/utils'

// const u = getUview()
const props = defineProps({
  formData: {
    type: Array as PropType<any>,
    default: Array as any
  },
  editData: {
    type: Array as PropType<any>,
    default: Array as any
  },
  rules: {
    type: Object as PropType<any>,
    default: Object as any
  },
  labelPosition: {
    type: String as PropType<any>,
    default: 'left' as String
  }, //对齐方向
  borderBottom: {
    type: Boolean as PropType<any>,
    default: false
  }, //是否显示表单域的下划线边框
  labelWidth: {
    type: String as PropType<any>,
    default: '200rpx' as String
  }, //label长度
  labelAlign: {
    type: String as PropType<any>,
    default: 'center' as String
  }, //label字体对齐方式
  labelStyle: {
    type: Object as PropType<any>,
    default: { paddingLeft: '20rpx', color: '#9B9B9B' } as any
  } //label字体对齐方式
})

const formRef = ref()
const myFormData = ref() as any
const validate = async () => {
  return await formRef.value.validate()
}

const saveClick = () => {
  return myFormData.value
}

const required = (field: string) => {
  if (props.rules && props.rules[field]) {
    //存在
    return props.rules[field].required
  } else {
    //不存在}
    return false
  }
}

onBeforeMount(() => {})

watch(
  () => props.formData,
  () => {
    if (isEmpty(props.formData)) return
    const obj = {} as any
    if (props.editData) {
      for (const item of props.formData) {
        obj[item.formSchema.field] = props.editData[item.formSchema.field] // 将item.formSchema.field作为键，item.formSchema.value作为值，存入myFormData.value中
        if (item.formSchema.columnId) {
          obj[item.formSchema.columnId] = props.editData[item.formSchema.columnId]
        }
        if (item.formSchema.departmentId) {
          obj[item.formSchema.departmentId] = props.editData[item.formSchema.departmentId]
        }
        if (item.formSchema.addressCityText) {
          obj[item.formSchema.addressCityText] = props.editData[item.formSchema.addressCityText]
        }
      }
    }
    if (obj['employeeSex']) {
      obj['employeeSex'] = obj['employeeSex'] === 1 ? '男' : obj['employeeSex'] === 2 ? '女' : ''
    }
    myFormData.value = obj
  },
  {
    immediate: true,
    deep: true
  }
)

defineExpose({ myFormData, saveClick, validate })
</script>
<template>
  <view v-if="formData && myFormData">
    <u-form
      :labelPosition="props.labelPosition"
      :borderBottom="props.borderBottom"
      :labelWidth="props.labelWidth"
      :labelStyle="props.labelStyle"
      :model="formData"
      :rules="rules"
      ref="formRef"
    >
      <template v-for="(data, index) of props.formData" :key="index">
        <!-- :required="required(data.formSchema.field)" -->
        <u-form-item
          :borderBottom="props.borderBottom"
          :prop="data.formSchema.field"
          labelWidth="200rpx"
        >
          <view :class="data.formSchema.columnStyle" class="px-20rpx">
            <!-- <template #label> -->
            <view class="font-semibold flex">
              <view> {{ data.columnTitle }} </view>
              <view v-if="required(data.formSchema.field)" class="text-red">*</view>
            </view>
            <!-- </template> -->
            <view
              class="bg-#f4f5f7 mt-20rpx rounded-10rpx flex items-center"
              :class="data.formSchema.inputStyle"
            >
              <!-- 输入框 -->
              <view v-if="data.formSchema.component === 'Input'" class="m-20rpx w-100%">
                <FormInput
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>

              <!-- 文本框 -->
              <view v-else-if="data.formSchema.component === 'Textarea'" class="w-100%">
                <FormTextarea
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>

              <!-- 上传图片 -->
              <view
                v-else-if="data.formSchema.component === 'UploadPictures'"
                class="bg-#FFF w-100%"
              >
                <FormUploadPictures
                  v-model="myFormData[data.formSchema.field]"
                  v-model:columnId="myFormData[data.formSchema.columnId]"
                  :count="data.formSchema.componentProps.count"
                  :category="data.formSchema.componentProps.category"
                />
              </view>

              <!-- 选择器 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Select'">
                <FormPicker
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                  :disabled="data.formSchema.componentProps.disabled"
                />
              </view>

              <!-- 日期选择 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'CustomDate'">
                <FormCustomDate
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>

              <!-- 旧 -->
              <!-- 密码框 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Password'">
                <FormPassword
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>

              <!-- 开关框 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Switch'">
                <FormSwitch
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>

              <!-- 单位输入框 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'InputUnit'">
                <FormInputUnit
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>

              <!-- 时间选择 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'CustomTime'">
                <FormCustomTime
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>
              <!-- 跳转 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'SelectPopup'">
                <FormSelectPopup
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>
              <!-- 单选 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'RadioGroup'">
                <FormRadioGroup
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>

              <!-- 多选 -->
              <view
                class="m-20rpx w-100%"
                v-else-if="data.formSchema.component === 'CheckboxGroup'"
              >
                <FormCheckboxGroup
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>

              <!-- 评分 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Rate'">
                <FormRate
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                />
              </view>

              <!-- 上传文件 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Uploader'">
                <FormUploader
                  v-model="myFormData[data.formSchema.field]"
                  v-model:columnId="myFormData[data.formSchema.columnId]"
                  :placeholder="data.formSchema.placeholder"
                  :category="data.formSchema.componentProps.category"
                />
              </view>

              <!-- 地址选择 -->
              <view v-else-if="data.formSchema.component === 'Address'" class="w-100%">
                <FormAddress
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :receiverAddressCity="myFormData[data.formSchema.receiverAddressCity]"
                />
              </view>

              <!-- 地区选择 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Area'">
                <FormArea
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  v-model:companyAddressCityText="myFormData[data.formSchema.addressCityText]"
                />
              </view>

              <!-- 跳转 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'Path'">
                <FormPath
                  v-model="myFormData[data.formSchema.field]"
                  v-model:departmentId="myFormData[data.formSchema.departmentId]"
                  :placeholder="data.formSchema.placeholder"
                  :field="data.formSchema.field"
                  :multiple="data.formSchema.multiple"
                  :type="data.formSchema.type"
                />
              </view>

              <!-- 弹出层多选 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'DCheckbox'">
                <FormDCheckbox
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>
              <!-- 弹出层单选 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'DSelect'">
                <FormDPicker
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>
              <!-- 动作面板 -->
              <view class="m-20rpx w-100%" v-else-if="data.formSchema.component === 'DActionSheet'">
                <FormDActionSheet
                  v-model="myFormData[data.formSchema.field]"
                  :placeholder="data.formSchema.placeholder"
                  :options="data.formSchema.componentProps.options"
                />
              </view>
            </view>
          </view>
        </u-form-item>
      </template>
    </u-form>
  </view>
</template>
<style lang="less" scoped>
::v-deep .u-form-item__body__right__message {
  padding-left: 20rpx !important;
}
</style>
