import 'package:dio/dio.dart';
import 'package:flutter_application/common/utils.dart';

Dio dio = Dio(BaseOptions(receiveTimeout: 10000));
Loading loading = Loading();
int count = 0;

class ExtRequestOptions extends RequestOptions {
  ExtRequestOptions({required String path}) : super(path: path);
  bool noLoading = false; // 发请求时默认带loading
}

class ExtOptions extends Options {
  ExtOptions(
      {String? method,
      int? sendTimeout,
      int? receiveTimeout,
      Map<String, dynamic>? extra,
      Map<String, dynamic>? headers,
      ResponseType? responseType,
      String? contentType,
      ValidateStatus? validateStatus,
      bool? receiveDataWhenStatusError,
      bool? followRedirects,
      int? maxRedirects,
      RequestEncoder? requestEncoder,
      ResponseDecoder? responseDecoder,
      ListFormat? listFormat,
      noLoading = false})
      : super(
          method: method,
          sendTimeout: sendTimeout,
          receiveTimeout: receiveTimeout,
          extra: extra,
          headers: headers,
          responseType: responseType,
          contentType: contentType,
          validateStatus: validateStatus,
          receiveDataWhenStatusError: receiveDataWhenStatusError,
          followRedirects: followRedirects,
          maxRedirects: maxRedirects,
          requestEncoder: requestEncoder,
          responseDecoder: responseDecoder,
          listFormat: listFormat,
        );
  bool? noLoading;
}

void main() {
  dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
    count++;
    print((options));
    if (!(options as ExtRequestOptions).noLoading && loading.isClosed()) loading.open();
    return handler.next(options);
  }, onResponse: (response, handler) {
    if (--count == 0 && !loading.isClosed()) loading.close();
    return handler.next(response);
  }, onError: (DioError e, handler) {
    if (!loading.isClosed()) loading.close(); // 网络原因应该关闭loading
    return handler.next(e);
  }));
}
