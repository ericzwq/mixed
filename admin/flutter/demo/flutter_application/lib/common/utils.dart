import 'package:flutter_easyloading/flutter_easyloading.dart';

class Loading {
  bool _closed = true;
  bool manual = false; // 是否手动关闭loading

  open({manual = false, status = '加载中...'}) {
    EasyLoading.show(status: status, maskType: EasyLoadingMaskType.black);
    _closed = false;
    this.manual = manual;
  }

  close() {
    EasyLoading.removeAllCallbacks();
    _closed = true;
    manual = false;
  }

  bool isClosed() => _closed;
}
