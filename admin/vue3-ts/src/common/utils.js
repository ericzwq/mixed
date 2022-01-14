// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import crypto from 'crypto';
import { APP_BASE_PATH } from '@/common/consts';
import { LOGIN_PATH } from '@/router/router';
import { ElLoading } from 'element-plus';
export function codeaes(data) {
    const iv = '', key = '8NONwyJtHesysWpM', clearEncoding = 'utf8', cipherEncoding = 'base64', cipherChunks = [], cipher = crypto.createCipheriv('aes-128-ecb', key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
}
export function toLoginPage() {
    location.href = location.origin + APP_BASE_PATH + LOGIN_PATH;
}
const getLoading = () => ElLoading.service({
    text: '加载中',
    lock: true,
    // spinner: 'Loading',
    background: 'rgba(0, 0, 0, .4)'
});
const vm = getLoading();
vm.close();
export const Loading = {
    MANUAL: false,
    vm,
    closed: true,
    open(MANUAL = false) {
        this.vm = getLoading();
        this.closed = false;
        this.MANUAL = MANUAL;
    },
    close() {
        this.vm.close();
        this.closed = true;
        this.MANUAL = false;
    }
};
export function formatDate(time) {
    const date = new Date(time), y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), h = date.getHours(), mn = date.getMinutes(), s = date.getSeconds();
    return `${y}-${String(m)
        .padStart(2, '0')}-${String(d)
        .padStart(2, '0')} ${String(h)
        .padStart(2, '0')}:${String(mn)
        .padStart(2, '0')}:${String(s)
        .padStart(2, '0')}`;
}
//# sourceMappingURL=utils.js.map