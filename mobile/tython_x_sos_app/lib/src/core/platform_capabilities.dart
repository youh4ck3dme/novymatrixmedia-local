import 'package:flutter/foundation.dart';

class PlatformCapabilities {
  const PlatformCapabilities({
    required this.platformLabel,
    required this.emergencyNumber,
    required this.countryCode,
    required this.supportsForegroundExecution,
    required this.supportsBackgroundLocationRefresh,
    required this.supportsSilentSmsSending,
    required this.supportsSilentEmergencyDial,
  });

  final String platformLabel;
  final String emergencyNumber;
  final String countryCode;
  final bool supportsForegroundExecution;
  final bool supportsBackgroundLocationRefresh;
  final bool supportsSilentSmsSending;
  final bool supportsSilentEmergencyDial;

  static PlatformCapabilities detect({required String localeName}) {
    final countryCode = _parseCountryCode(localeName);
    final emergencyNumber = _resolveEmergencyNumber(countryCode);

    if (kIsWeb) {
      return PlatformCapabilities(
        platformLabel: 'Web',
        emergencyNumber: emergencyNumber,
        countryCode: countryCode,
        supportsForegroundExecution: false,
        supportsBackgroundLocationRefresh: false,
        supportsSilentSmsSending: false,
        supportsSilentEmergencyDial: false,
      );
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
      return PlatformCapabilities(
        platformLabel: 'Android',
        emergencyNumber: emergencyNumber,
        countryCode: countryCode,
        supportsForegroundExecution: true,
        supportsBackgroundLocationRefresh: true,
        supportsSilentSmsSending: false,
        supportsSilentEmergencyDial: false,
      );
      case TargetPlatform.iOS:
      return PlatformCapabilities(
        platformLabel: 'iOS',
        emergencyNumber: emergencyNumber,
        countryCode: countryCode,
        supportsForegroundExecution: true,
        supportsBackgroundLocationRefresh: false,
        supportsSilentSmsSending: false,
        supportsSilentEmergencyDial: false,
      );
      default:
        return PlatformCapabilities(
          platformLabel: defaultTargetPlatform.name,
          emergencyNumber: emergencyNumber,
          countryCode: countryCode,
          supportsForegroundExecution: false,
          supportsBackgroundLocationRefresh: false,
          supportsSilentSmsSending: false,
          supportsSilentEmergencyDial: false,
        );
    }
  }

  static String _parseCountryCode(String localeName) {
    final normalized = localeName.replaceAll('-', '_').split('_');
    if (normalized.length < 2) {
      return '';
    }
    return normalized[1].toUpperCase();
  }

  static String _resolveEmergencyNumber(String countryCode) {
    const nineOneOneCountries = <String>{'US', 'CA', 'MX', 'DO'};
    const tripleZeroCountries = <String>{'AU'};
    const oneOneOneCountries = <String>{'NZ'};
    const nineNineNineCountries = <String>{'GB'};

    if (nineOneOneCountries.contains(countryCode)) {
      return '911';
    }
    if (tripleZeroCountries.contains(countryCode)) {
      return '000';
    }
    if (oneOneOneCountries.contains(countryCode)) {
      return '111';
    }
    if (nineNineNineCountries.contains(countryCode)) {
      return '999';
    }
    return '112';
  }
}
