import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tython_x_sos_app/src/core/platform_capabilities.dart';

void main() {
  group('PlatformCapabilities.detect', () {
    test('returns web capabilities when forced to web', () {
      final capabilities = PlatformCapabilities.detect(
        localeName: 'en_US',
        isWebOverride: true,
      );

      expect(capabilities.platformLabel, 'Web');
      expect(capabilities.emergencyNumber, '911');
      expect(capabilities.supportsForegroundExecution, isFalse);
    });

    test('returns android capabilities and non-default emergency number', () {
      final capabilities = PlatformCapabilities.detect(
        localeName: 'en_AU',
        isWebOverride: false,
        targetPlatformOverride: TargetPlatform.android,
      );

      expect(capabilities.platformLabel, 'Android');
      expect(capabilities.emergencyNumber, '000');
      expect(capabilities.supportsBackgroundLocationRefresh, isTrue);
    });

    test('falls back to 112 when country is unknown', () {
      final capabilities = PlatformCapabilities.detect(
        localeName: 'en_XX',
        isWebOverride: false,
        targetPlatformOverride: TargetPlatform.windows,
      );

      expect(capabilities.emergencyNumber, '112');
      expect(capabilities.platformLabel, 'windows');
    });
  });
}
