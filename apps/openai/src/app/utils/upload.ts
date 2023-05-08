import axios from 'axios'
import { API } from '../api'

const api = new API()

export async function upload(file: File) {
  let OSS: any;

  try {
    const data: any = await api.userApi.getOssSign()
    OSS = data
  } catch (err) {
    OSS = null
  }

  const formData = new FormData()
  const key = `${OSS.dir}${file.name}`
  formData.append('key', key)
  // formData.append('x-obs-acl', OSS.x_obs_acl)
  formData.append('policy', OSS.policy)
  formData.append('OSSAccessKeyId', OSS.accessKeyId)
  formData.append('signature', OSS.signature)
  formData.append('file', file)

  try {
    await axios.post(OSS.host, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: function (data) {
        return data
      }
    })
    return `${OSS.host}/${OSS.dir}${file.name}`
  } catch (error) {
    console.log(error)
  }
}
