import axios from 'axios';
import { ElMessage } from 'element-plus';
import { isProduction } from '@/common/env';
import { TOKEN_KEY } from '@/common/consts';
import { LOGIN_PATH } from '@/router';
import { Loading, toLoginPage } from '@/common/utils';
const baseURL = isProduction ? '' : '/api'; // http://106.75.247.94:38100/shop/getAuthUrl
export const http = axios.create({
    baseURL
});
let total = 0;
const token = localStorage.getItem(TOKEN_KEY);
http.defaults.headers.common[TOKEN_KEY] = token;
if (!token && !location.pathname.includes(LOGIN_PATH))
    toLoginPage();
http.interceptors.request.use((config) => {
    total++;
    // if (!config.noLoading) loadingVM = getLoading(o.MANUAL);
    if (!config.noLoading)
        Loading.open();
    return config;
});
http.interceptors.response.use(res => {
    // if (--total === 0 && !loadingVM['MANUAL']) loadingVM.close(); // manual：是否手动关闭loading（请使用全局搜索）
    if (--total === 0 && !Loading['MANUAL'])
        Loading.close(); // manual：是否手动关闭loading（请使用全局搜索）
    if (res.data.code === 401 && !location.pathname.includes(LOGIN_PATH))
        toLoginPage();
    return res.data;
}, err => {
    ElMessage.error('网络异常');
    // if (--total === 0) loadingVM.close(); // 网络原因应该关闭loading
    if (--total === 0)
        Loading.close(); // 网络原因应该关闭loading
    return Promise.reject(err);
});
export default http;
//# sourceMappingURL=http.js.map