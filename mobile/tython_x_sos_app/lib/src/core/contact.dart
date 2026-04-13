class EmergencyContact {
  const EmergencyContact({
    required this.name,
    required this.phoneNumber,
  });

  final String name;
  final String phoneNumber;

  String get normalizedPhoneNumber => _sanitizePhoneNumber(phoneNumber);

  bool get isValid => name.trim().isNotEmpty && normalizedPhoneNumber.isNotEmpty;

  EmergencyContact copyWith({
    String? name,
    String? phoneNumber,
  }) {
    return EmergencyContact(
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'name': name.trim(),
      'phoneNumber': normalizedPhoneNumber,
    };
  }

  static EmergencyContact fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      name: (json['name'] ?? '') as String,
      phoneNumber: (json['phoneNumber'] ?? '') as String,
    );
  }

  static String _sanitizePhoneNumber(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return '';
    }

    final cleaned = trimmed.replaceAll(RegExp(r'[^0-9+]'), '');
    if (cleaned.startsWith('+')) {
      return '+${cleaned.substring(1).replaceAll('+', '')}';
    }
    return cleaned.replaceAll('+', '');
  }
}
